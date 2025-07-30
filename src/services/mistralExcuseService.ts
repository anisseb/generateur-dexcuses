import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExcuseRequest, ExcuseCategory, CredibilityLevel, Tone } from '../types';

export interface MistralExcuseResponse {
  excuse: string;
  explanation: string;
  credibility: string;
  timestamp: number;
}

class MistralExcuseService {
  private readonly API_KEY = process.env.EXPO_PUBLIC_MISTRAL_API_KEY;
  private readonly BASE_URL = 'https://api.mistral.ai/v1/chat/completions';
  private readonly CACHE_PREFIX = 'mistral_excuse_cache_';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

  /**
   * Génère une clé de cache unique pour une demande d'excuse
   */
  private generateCacheKey(request: ExcuseRequest): string {
    const key = `${request.category}_${request.credibility}_${request.tone}_${request.context || 'default'}`;
    return this.CACHE_PREFIX + key.replace(/[^a-zA-Z0-9]/g, '_');
  }

  /**
   * Vérifie si les données en cache sont encore valides
   */
  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    return (now - timestamp) < this.CACHE_DURATION;
  }

  /**
   * Nettoie le cache expiré
   */
  async cleanExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (!this.isCacheValid(parsed.timestamp)) {
            await AsyncStorage.removeItem(key);
            console.log(`Cache expiré supprimé: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  /**
   * Génère le prompt pour l'IA Mistral
   */
  private generatePrompt(request: ExcuseRequest): string {
    const categoryDescriptions = {
      retard: 'être en retard à un rendez-vous, cours, réunion ou événement',
      ghost: 'avoir ignoré ou ghosté quelqu\'un (messages, appels, rendez-vous)',
      devoir: 'ne pas avoir rendu un devoir, projet ou travail à temps',
      travail: 'être absent du travail, en retard ou ne pas avoir fait une tâche',
      'rendez-vous': 'rater un rendez-vous amoureux, professionnel ou amical',
      autre: 'toute autre situation nécessitant une excuse'
    };

    const credibilityDescriptions = {
      realiste: 'très crédible et plausible, quelque chose qui pourrait vraiment arriver',
      credule: 'un peu créatif mais encore acceptable, avec une touche d\'originalité',
      mytho: 'complètement délirant et amusant, une excuse vraiment créative et drôle'
    };

    const toneDescriptions = {
      serieux: 'ton professionnel et sérieux, approprié pour des situations importantes',
      drôle: 'ton humoristique et léger, pour dédramatiser la situation',
      surrealiste: 'ton complètement surréaliste et créatif, avec des éléments fantastiques',
      limite: 'ton audacieux et limite, des excuses vraiment osées'
    };

    return `Tu es un expert en génération d'excuses créatives et crédibles. Génère une excuse pour ${categoryDescriptions[request.category]}.

Paramètres de l'excuse:
- Catégorie: ${request.category}
- Niveau de crédibilité: ${credibilityDescriptions[request.credibility]}
- Ton: ${toneDescriptions[request.tone]}
${request.context ? `- Contexte: ${request.context}` : ''}

Génère une réponse JSON structurée avec les sections suivantes:

{
  "excuse": "L'excuse générée (phrase complète et naturelle)",
  "explanation": "Explication courte de pourquoi cette excuse est appropriée",
  "credibility": "Évaluation de la crédibilité de cette excuse (1-10)"
}

L'excuse doit être:
- Naturelle et conversationnelle
- Adaptée au niveau de crédibilité demandé
- Dans le ton spécifié
- Créative et originale
- Appropriée pour la catégorie choisie

Sois créatif et amusant tout en restant dans les paramètres demandés !`;
  }

  /**
   * Appelle l'API Mistral pour obtenir une excuse
   */
  private async callMistralAPI(prompt: string): Promise<MistralExcuseResponse> {
    if (!this.API_KEY) {
      throw new Error('Clé API Mistral non configurée. Veuillez définir EXPO_PUBLIC_MISTRAL_API_KEY.');
    }

    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requêtes API atteinte. Veuillez réessayer plus tard.');
      } else if (response.status === 401) {
        throw new Error('Clé API Mistral invalide.');
      } else {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Réponse API invalide');
    }

    try {
      // Essayer de parser le JSON de la réponse
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          excuse: parsed.excuse || 'Désolé, je n\'ai pas d\'excuse pour ça... 😅',
          explanation: parsed.explanation || 'Excuse générée par IA',
          credibility: parsed.credibility || '5',
          timestamp: Date.now()
        };
      } else {
        // Si pas de JSON valide, utiliser le contenu brut
        return {
          excuse: content.trim(),
          explanation: 'Excuse générée par IA Mistral',
          credibility: '7',
          timestamp: Date.now()
        };
      }
    } catch (parseError) {
      console.error('Erreur lors du parsing de la réponse:', parseError);
      throw new Error('Format de réponse invalide de l\'API');
    }
  }

  /**
   * Génère une excuse intelligente (avec cache)
   */
  async generateIntelligentExcuse(request: ExcuseRequest): Promise<MistralExcuseResponse> {
    try {
      const cacheKey = this.generateCacheKey(request);
      
      // Vérifier le cache
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (this.isCacheValid(parsed.timestamp)) {
          console.log('Excuse récupérée depuis le cache');
          return parsed;
        }
      }

      // Générer une nouvelle excuse
      console.log('Génération d\'une nouvelle excuse via Mistral API');
      const prompt = this.generatePrompt(request);
      const excuseResponse = await this.callMistralAPI(prompt);
      
      // Sauvegarder en cache
      await AsyncStorage.setItem(cacheKey, JSON.stringify(excuseResponse));
      console.log('Excuse sauvegardée en cache');

      return excuseResponse;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'excuse:', error);
      
      // En cas d'erreur, retourner une excuse par défaut
      return {
        excuse: this.getFallbackExcuse(request),
        explanation: 'Excuse générée en mode hors ligne',
        credibility: '5',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Génère une excuse de secours basée sur les paramètres
   */
  private getFallbackExcuse(request: ExcuseRequest): string {
    const fallbackExcuses = {
      retard: {
        realiste: {
          serieux: "Désolé, j'ai eu un problème de transport en commun",
          drôle: "Mon chat a caché mes clés",
          surrealiste: "Un trou noir s'est ouvert dans ma chambre",
          limite: "J'ai dû sauver un bébé d'un incendie"
        },
        credule: {
          serieux: "J'ai eu un accident de voiture mineur",
          drôle: "J'ai été piégé dans mon ascenseur",
          surrealiste: "J'ai été téléporté dans une dimension parallèle",
          limite: "J'ai été kidnappé par des ninjas"
        },
        mytho: {
          serieux: "J'ai été hospitalisé d'urgence",
          drôle: "J'ai été transformé en légume",
          surrealiste: "J'ai voyagé dans le temps",
          limite: "J'ai sauvé le monde d'une invasion zombie"
        }
      },
      ghost: {
        realiste: {
          serieux: "J'ai eu des problèmes personnels",
          drôle: "Mon téléphone a fait une grève",
          surrealiste: "J'ai été téléporté sur une île déserte",
          limite: "J'ai été recruté par une agence secrète"
        },
        credule: {
          serieux: "J'ai eu une dépression",
          drôle: "J'ai été transformé en statue",
          surrealiste: "J'ai voyagé dans le temps",
          limite: "J'ai été recruté par les Avengers"
        },
        mytho: {
          serieux: "J'ai été dans le coma",
          drôle: "J'ai été transformé en super-héros",
          surrealiste: "J'ai créé un nouveau univers",
          limite: "J'ai sauvé l'univers d'une destruction"
        }
      },
      devoir: {
        realiste: {
          serieux: "J'ai eu des problèmes techniques",
          drôle: "Mon ordinateur a fait une grève",
          surrealiste: "Mes notes se sont envolées par la fenêtre",
          limite: "J'ai été kidnappé par des ninjas"
        },
        credule: {
          serieux: "J'ai eu une panne d'électricité",
          drôle: "J'ai été transformé en livre",
          surrealiste: "Mes devoirs ont pris vie",
          limite: "J'ai été recruté par une université secrète"
        },
        mytho: {
          serieux: "J'ai eu une amnésie",
          drôle: "J'ai été transformé en génie",
          surrealiste: "J'ai créé une nouvelle branche de la science",
          limite: "J'ai sauvé l'humanité par mes découvertes"
        }
      },
      travail: {
        realiste: {
          serieux: "J'ai eu un problème de transport",
          drôle: "Mon réveil a fait une grève",
          surrealiste: "Un trou noir s'est ouvert dans ma chambre",
          limite: "J'ai dû sauver le monde"
        },
        credule: {
          serieux: "J'ai eu un accident",
          drôle: "J'ai été transformé en statue",
          surrealiste: "J'ai voyagé dans le temps",
          limite: "J'ai été recruté par les Avengers"
        },
        mytho: {
          serieux: "J'ai été dans le coma",
          drôle: "J'ai été transformé en super-héros",
          surrealiste: "J'ai créé un nouveau univers",
          limite: "J'ai sauvé l'univers d'une destruction"
        }
      },
      "rendez-vous": {
        realiste: {
          serieux: "J'ai eu un problème de transport",
          drôle: "Mon GPS m'a fait faire le tour du monde",
          surrealiste: "Un trou noir s'est ouvert dans ma chambre",
          limite: "J'ai dû sauver le monde"
        },
        credule: {
          serieux: "J'ai eu un accident",
          drôle: "J'ai été transformé en statue",
          surrealiste: "J'ai voyagé dans le temps",
          limite: "J'ai été recruté par les Avengers"
        },
        mytho: {
          serieux: "J'ai été dans le coma",
          drôle: "J'ai été transformé en super-héros",
          surrealiste: "J'ai créé un nouveau univers",
          limite: "J'ai sauvé l'univers d'une destruction"
        }
      },
      autre: {
        realiste: {
          serieux: "J'ai eu un imprévu",
          drôle: "La vie m'a joué un tour",
          surrealiste: "La réalité a glissé",
          limite: "Le destin a frappé"
        },
        credule: {
          serieux: "J'ai eu un accident",
          drôle: "J'ai été transformé en statue",
          surrealiste: "J'ai voyagé dans le temps",
          limite: "J'ai été recruté par les Avengers"
        },
        mytho: {
          serieux: "J'ai été dans le coma",
          drôle: "J'ai été transformé en super-héros",
          surrealiste: "J'ai créé un nouveau univers",
          limite: "J'ai sauvé l'univers d'une destruction"
        }
      }
    };

    const categoryExcuses = fallbackExcuses[request.category] || fallbackExcuses.retard;
    const credibilityExcuses = categoryExcuses[request.credibility] || categoryExcuses.realiste;
    const toneExcuse = credibilityExcuses[request.tone] || credibilityExcuses.serieux;

    return toneExcuse;
  }

  /**
   * Supprime le cache pour une catégorie spécifique
   */
  async clearCacheForCategory(category: ExcuseCategory): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const targetKeys = keys.filter(key => 
        key.includes(category.replace(/[^a-zA-Z0-9]/g, '_'))
      );
      
      for (const key of targetKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`Cache supprimé pour: ${key}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }

  /**
   * Supprime tout le cache des excuses
   */
  async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      for (const key of cacheKeys) {
        await AsyncStorage.removeItem(key);
      }
      console.log('Tout le cache des excuses a été supprimé');
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }
}

export const mistralExcuseService = new MistralExcuseService(); 