import { ExcuseRequest, ExcuseCategory, CredibilityLevel, Tone } from '../types';

interface GrokExcuseResponse {
  excuse: string;
  success: boolean;
  error?: string;
}

class GrokExcuseService {
  private readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly API_KEY = process.env.EXPO_PUBLIC_GROK_API;

  private buildPrompt(request: ExcuseRequest): string {
    const { category, credibility, tone } = request;
    
    const categoryDescriptions = {
      retard: 'être en retard',
      ghost: 'avoir ghosté quelqu\'un',
      devoir: 'ne pas avoir rendu un devoir',
      travail: 'ne pas avoir fait son travail',
      'rendez-vous': 'avoir raté un rendez-vous',
      autre: 'avoir un problème général'
    };

    const credibilityDescriptions = {
      realiste: 'très crédible et réaliste',
      credule: 'plutôt crédible mais avec un doute',
      mytho: 'peu crédible, limite mytho'
    };

    const toneDescriptions = {
      serieux: 'ton sérieux et professionnel',
      drôle: 'ton humoristique et décontracté',
      surrealiste: 'ton surréaliste et créatif',
      limite: 'ton limite et audacieux'
    };

    const prompt = `Tu es un expert en excuses créatives. Génère une excuse ${credibilityDescriptions[credibility]} pour ${categoryDescriptions[category]} avec un ${toneDescriptions[tone]}. 

L'excuse doit être :
- En français
- Créative et originale
- Adaptée au contexte (${categoryDescriptions[category]})
- Avec le niveau de crédibilité demandé (${credibilityDescriptions[credibility]})
- Dans le ton demandé (${toneDescriptions[tone]})
- Maximum 2-3 phrases
- Sans être trop longue

Génère uniquement l'excuse, sans explications supplémentaires.`;

    return prompt;
  }

  private async callGrokAPI(prompt: string): Promise<GrokExcuseResponse> {
    if (!this.API_KEY) {
      console.error('❌ Clé API Grok manquante');
      return {
        excuse: '',
        success: false,
        error: 'Clé API Grok manquante'
      };
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API Grok:', response.status, errorText);
        return {
          excuse: '',
          success: false,
          error: `Erreur API: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();

      const excuse = data.choices?.[0]?.message?.content;
      
      if (!excuse) {
        console.error('❌ Aucune excuse trouvée dans la réponse');
        console.error('📊 Structure de la réponse:', data);
        return {
          excuse: '',
          success: false,
          error: 'Aucune excuse générée dans la réponse'
        };
      }

      // Nettoyer la réponse en enlevant les guillemets
      let cleanedExcuse = excuse.trim();
      
      // Enlever les guillemets au début et à la fin
      if (cleanedExcuse.startsWith('"') && cleanedExcuse.endsWith('"')) {
        cleanedExcuse = cleanedExcuse.slice(1, -1);
      }
      
      // Enlever les guillemets simples au début et à la fin
      if (cleanedExcuse.startsWith("'") && cleanedExcuse.endsWith("'")) {
        cleanedExcuse = cleanedExcuse.slice(1, -1);
      }
      
      return {
        excuse: cleanedExcuse,
        success: true
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'appel à l\'API Grok:', error);
      return {
        excuse: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async generateIntelligentExcuse(request: ExcuseRequest): Promise<GrokExcuseResponse> {
    
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await this.callGrokAPI(prompt);
      
      if (response.success) {
        return response;
      } else {
        console.error('❌ Échec de génération avec Grok:', response.error);
        return response;
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération avec Grok:', error);
      return {
        excuse: '',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}

export const grokExcuseService = new GrokExcuseService(); 