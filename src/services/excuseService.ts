import { Excuse, ExcuseRequest, CredibilityLevel, Tone, ExcuseCategory } from '../types';
import { mistralExcuseService, MistralExcuseResponse } from './mistralExcuseService';

// Base d'excuses prédéfinies
const EXCUSE_TEMPLATES = {
  retard: {
    realiste: {
      serieux: [
        "Désolé, j'ai eu un problème de transport en commun",
        "J'ai eu un imprévu familial urgent",
        "Ma voiture n'a pas démarré ce matin",
        "J'ai eu un problème de santé mineur"
      ],
      drôle: [
        "Mon chat a caché mes clés",
        "J'ai oublié de mettre mon réveil",
        "J'ai eu une crise existentielle dans ma salle de bain",
        "Mon GPS m'a fait faire le tour du monde"
      ],
      surrealiste: [
        "Un trou noir s'est ouvert dans ma chambre",
        "Les extraterrestres ont kidnappé mon réveil",
        "J'ai été transformé en escargot pendant 2 heures",
        "Un ninja invisible a volé mes chaussures"
      ],
      limite: [
        "J'ai dû sauver un bébé d'un incendie",
        "J'ai été retenu par la CIA pour interrogatoire",
        "J'ai gagné au loto mais j'ai perdu le ticket",
        "J'ai été nommé président d'un pays lointain"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu un accident de voiture mineur",
        "J'ai dû emmener quelqu'un aux urgences",
        "Ma maison a été inondée",
        "J'ai eu un problème technique majeur"
      ],
      drôle: [
        "Mon chien a mangé mes vêtements",
        "J'ai été piégé dans mon ascenseur",
        "J'ai eu une panne de courant",
        "Mon téléphone a explosé"
      ],
      surrealiste: [
        "J'ai été téléporté dans une dimension parallèle",
        "Un dragon a bloqué ma route",
        "J'ai eu une conversation avec mon reflet",
        "Les pigeons ont formé une barricade"
      ],
      limite: [
        "J'ai été kidnappé par des ninjas",
        "J'ai dû arrêter un braquage de banque",
        "J'ai été choisi pour une mission secrète",
        "J'ai eu une crise d'identité multiple"
      ]
    },
    mytho: {
      serieux: [
        "J'ai été hospitalisé d'urgence",
        "J'ai eu un accident grave",
        "Ma famille a eu un drame",
        "J'ai été victime d'un crime"
      ],
      drôle: [
        "J'ai été transformé en légume",
        "J'ai eu une conversation avec Dieu",
        "J'ai été élu roi d'un royaume lointain",
        "J'ai découvert que j'étais un super-héros"
      ],
      surrealiste: [
        "J'ai voyagé dans le temps",
        "J'ai été contacté par des aliens",
        "J'ai fusionné avec mon téléphone",
        "J'ai eu une crise de super-pouvoirs"
      ],
      limite: [
        "J'ai sauvé le monde d'une invasion zombie",
        "J'ai été recruté par le MI6",
        "J'ai eu une révélation divine",
        "J'ai été choisi par une prophétie ancienne"
      ]
    }
  },
  ghost: {
    realiste: {
      serieux: [
        "J'ai eu des problèmes personnels",
        "J'ai été très occupé avec le travail",
        "J'ai eu des soucis de santé",
        "J'ai eu besoin de temps pour moi"
      ],
      drôle: [
        "Mon téléphone a fait une grève",
        "J'ai été kidnappé par ma couette",
        "J'ai eu une crise de paresse aiguë",
        "Mon chat a changé mon mot de passe"
      ],
      surrealiste: [
        "J'ai été téléporté sur une île déserte",
        "J'ai fusionné avec mon canapé",
        "J'ai eu une conversation avec mon oreiller",
        "J'ai été transformé en plante d'intérieur"
      ],
      limite: [
        "J'ai été recruté par une agence secrète",
        "J'ai eu une mission de sauvetage",
        "J'ai été choisi pour sauver l'humanité",
        "J'ai eu une révélation spirituelle"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu une dépression",
        "J'ai été hospitalisé",
        "J'ai eu des problèmes familiaux graves",
        "J'ai eu un accident"
      ],
      drôle: [
        "J'ai été transformé en statue",
        "J'ai eu une crise d'identité",
        "J'ai été kidnappé par des mimes",
        "J'ai eu une conversation avec mon frigo"
      ],
      surrealiste: [
        "J'ai voyagé dans une dimension parallèle",
        "J'ai été contacté par mon moi du futur",
        "J'ai fusionné avec internet",
        "J'ai eu une crise de super-pouvoirs"
      ],
      limite: [
        "J'ai été recruté par les Avengers",
        "J'ai eu une mission intergalactique",
        "J'ai été choisi par une prophétie",
        "J'ai eu une révélation divine"
      ]
    },
    mytho: {
      serieux: [
        "J'ai été dans le coma",
        "J'ai eu un cancer",
        "J'ai été kidnappé",
        "J'ai eu une amnésie"
      ],
      drôle: [
        "J'ai été transformé en super-héros",
        "J'ai eu une conversation avec Dieu",
        "J'ai été élu président de l'univers",
        "J'ai découvert que j'étais immortel"
      ],
      surrealiste: [
        "J'ai créé un nouveau univers",
        "J'ai fusionné avec la matrice",
        "J'ai eu une crise de réalité",
        "J'ai été choisi par les forces cosmiques"
      ],
      limite: [
        "J'ai sauvé l'univers d'une destruction",
        "J'ai été recruté par les gardiens de la galaxie",
        "J'ai eu une révélation cosmique",
        "J'ai été choisi par le destin lui-même"
      ]
    }
  },
  devoir: {
    realiste: {
      serieux: [
        "J'ai eu des problèmes techniques",
        "J'ai été malade",
        "J'ai eu des obligations familiales",
        "J'ai eu des difficultés de compréhension"
      ],
      drôle: [
        "Mon ordinateur a fait une grève",
        "J'ai eu une crise de procrastination",
        "Mon chat a mangé mes notes",
        "J'ai oublié que j'avais des devoirs"
      ],
      surrealiste: [
        "Mes notes se sont envolées par la fenêtre",
        "J'ai fusionné avec mon bureau",
        "J'ai eu une conversation avec mes crayons",
        "J'ai été transformé en dictionnaire"
      ],
      limite: [
        "J'ai été kidnappé par des ninjas",
        "J'ai eu une mission de sauvetage",
        "J'ai été choisi pour une quête épique",
        "J'ai eu une révélation académique"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu une panne d'électricité",
        "J'ai été hospitalisé",
        "J'ai eu un accident",
        "J'ai eu des problèmes familiaux"
      ],
      drôle: [
        "J'ai été transformé en livre",
        "J'ai eu une crise d'inspiration",
        "J'ai été kidnappé par des bibliothécaires",
        "J'ai eu une conversation avec mes devoirs"
      ],
      surrealiste: [
        "Mes devoirs ont pris vie",
        "J'ai voyagé dans le temps",
        "J'ai fusionné avec la connaissance",
        "J'ai eu une crise de génie"
      ],
      limite: [
        "J'ai été recruté par une université secrète",
        "J'ai eu une mission académique",
        "J'ai été choisi par le savoir universel",
        "J'ai eu une révélation intellectuelle"
      ]
    },
    mytho: {
      serieux: [
        "J'ai eu une amnésie",
        "J'ai été dans le coma",
        "J'ai eu un traumatisme crânien",
        "J'ai eu une maladie rare"
      ],
      drôle: [
        "J'ai été transformé en génie",
        "J'ai eu une conversation avec Einstein",
        "J'ai été élu plus grand savant du monde",
        "J'ai découvert la théorie du tout"
      ],
      surrealiste: [
        "J'ai créé une nouvelle branche de la science",
        "J'ai fusionné avec l'univers",
        "J'ai eu une crise de conscience cosmique",
        "J'ai été choisi par les forces de la connaissance"
      ],
      limite: [
        "J'ai sauvé l'humanité par mes découvertes",
        "J'ai été recruté par une civilisation avancée",
        "J'ai eu une révélation scientifique",
        "J'ai été choisi par l'intelligence universelle"
      ]
    }
  },
  travail: {
    realiste: {
      serieux: [
        "J'ai eu un problème de transport",
        "J'ai eu un imprévu familial",
        "J'ai eu des soucis de santé",
        "J'ai eu un problème technique"
      ],
      drôle: [
        "Mon réveil a fait une grève",
        "J'ai été kidnappé par ma couette",
        "Mon chat a caché mes vêtements",
        "J'ai eu une crise de motivation"
      ],
      surrealiste: [
        "Un trou noir s'est ouvert dans ma chambre",
        "J'ai été téléporté dans une dimension parallèle",
        "Les extraterrestres ont volé mon réveil",
        "J'ai fusionné avec mon lit"
      ],
      limite: [
        "J'ai dû sauver le monde",
        "J'ai été recruté par une agence secrète",
        "J'ai eu une mission de sauvetage",
        "J'ai été choisi par une prophétie"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu un accident",
        "J'ai été hospitalisé",
        "J'ai eu des problèmes familiaux graves",
        "J'ai eu une panne d'électricité"
      ],
      drôle: [
        "J'ai été transformé en statue",
        "J'ai eu une crise d'identité",
        "J'ai été kidnappé par des mimes",
        "J'ai eu une conversation avec mon frigo"
      ],
      surrealiste: [
        "J'ai voyagé dans le temps",
        "J'ai été contacté par mon moi du futur",
        "J'ai fusionné avec internet",
        "J'ai eu une crise de super-pouvoirs"
      ],
      limite: [
        "J'ai été recruté par les Avengers",
        "J'ai eu une mission intergalactique",
        "J'ai été choisi par une prophétie",
        "J'ai eu une révélation divine"
      ]
    },
    mytho: {
      serieux: [
        "J'ai été dans le coma",
        "J'ai eu un cancer",
        "J'ai été kidnappé",
        "J'ai eu une amnésie"
      ],
      drôle: [
        "J'ai été transformé en super-héros",
        "J'ai eu une conversation avec Dieu",
        "J'ai été élu président de l'univers",
        "J'ai découvert que j'étais immortel"
      ],
      surrealiste: [
        "J'ai créé un nouveau univers",
        "J'ai fusionné avec la matrice",
        "J'ai eu une crise de réalité",
        "J'ai été choisi par les forces cosmiques"
      ],
      limite: [
        "J'ai sauvé l'univers d'une destruction",
        "J'ai été recruté par les gardiens de la galaxie",
        "J'ai eu une révélation cosmique",
        "J'ai été choisi par le destin lui-même"
      ]
    }
  },
  "rendez-vous": {
    realiste: {
      serieux: [
        "J'ai eu un problème de transport",
        "J'ai eu un imprévu familial",
        "J'ai eu des soucis de santé",
        "J'ai eu un problème technique"
      ],
      drôle: [
        "Mon GPS m'a fait faire le tour du monde",
        "J'ai été kidnappé par ma couette",
        "Mon chat a caché mes clés",
        "J'ai eu une crise de motivation"
      ],
      surrealiste: [
        "Un trou noir s'est ouvert dans ma chambre",
        "J'ai été téléporté dans une dimension parallèle",
        "Les extraterrestres ont volé mon réveil",
        "J'ai fusionné avec mon lit"
      ],
      limite: [
        "J'ai dû sauver le monde",
        "J'ai été recruté par une agence secrète",
        "J'ai eu une mission de sauvetage",
        "J'ai été choisi par une prophétie"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu un accident",
        "J'ai été hospitalisé",
        "J'ai eu des problèmes familiaux graves",
        "J'ai eu une panne d'électricité"
      ],
      drôle: [
        "J'ai été transformé en statue",
        "J'ai eu une crise d'identité",
        "J'ai été kidnappé par des mimes",
        "J'ai eu une conversation avec mon frigo"
      ],
      surrealiste: [
        "J'ai voyagé dans le temps",
        "J'ai été contacté par mon moi du futur",
        "J'ai fusionné avec internet",
        "J'ai eu une crise de super-pouvoirs"
      ],
      limite: [
        "J'ai été recruté par les Avengers",
        "J'ai eu une mission intergalactique",
        "J'ai été choisi par une prophétie",
        "J'ai eu une révélation divine"
      ]
    },
    mytho: {
      serieux: [
        "J'ai été dans le coma",
        "J'ai eu un cancer",
        "J'ai été kidnappé",
        "J'ai eu une amnésie"
      ],
      drôle: [
        "J'ai été transformé en super-héros",
        "J'ai eu une conversation avec Dieu",
        "J'ai été élu président de l'univers",
        "J'ai découvert que j'étais immortel"
      ],
      surrealiste: [
        "J'ai créé un nouveau univers",
        "J'ai fusionné avec la matrice",
        "J'ai eu une crise de réalité",
        "J'ai été choisi par les forces cosmiques"
      ],
      limite: [
        "J'ai sauvé l'univers d'une destruction",
        "J'ai été recruté par les gardiens de la galaxie",
        "J'ai eu une révélation cosmique",
        "J'ai été choisi par le destin lui-même"
      ]
    }
  },
  autre: {
    realiste: {
      serieux: [
        "J'ai eu un imprévu",
        "J'ai eu des problèmes personnels",
        "J'ai eu des soucis de santé",
        "J'ai eu un problème technique"
      ],
      drôle: [
        "La vie m'a joué un tour",
        "J'ai eu une crise existentielle",
        "Mon chat a décidé pour moi",
        "J'ai eu une panne de motivation"
      ],
      surrealiste: [
        "La réalité a glissé",
        "J'ai fusionné avec l'univers",
        "Les lois de la physique ont changé",
        "J'ai eu une crise de conscience"
      ],
      limite: [
        "Le destin a frappé",
        "J'ai été choisi par les forces cosmiques",
        "J'ai eu une révélation divine",
        "L'univers a décidé pour moi"
      ]
    },
    credule: {
      serieux: [
        "J'ai eu un accident",
        "J'ai été hospitalisé",
        "J'ai eu des problèmes familiaux graves",
        "J'ai eu une panne d'électricité"
      ],
      drôle: [
        "J'ai été transformé en statue",
        "J'ai eu une crise d'identité",
        "J'ai été kidnappé par des mimes",
        "J'ai eu une conversation avec mon frigo"
      ],
      surrealiste: [
        "J'ai voyagé dans le temps",
        "J'ai été contacté par mon moi du futur",
        "J'ai fusionné avec internet",
        "J'ai eu une crise de super-pouvoirs"
      ],
      limite: [
        "J'ai été recruté par les Avengers",
        "J'ai eu une mission intergalactique",
        "J'ai été choisi par une prophétie",
        "J'ai eu une révélation divine"
      ]
    },
    mytho: {
      serieux: [
        "J'ai été dans le coma",
        "J'ai eu un cancer",
        "J'ai été kidnappé",
        "J'ai eu une amnésie"
      ],
      drôle: [
        "J'ai été transformé en super-héros",
        "J'ai eu une conversation avec Dieu",
        "J'ai été élu président de l'univers",
        "J'ai découvert que j'étais immortel"
      ],
      surrealiste: [
        "J'ai créé un nouveau univers",
        "J'ai fusionné avec la matrice",
        "J'ai eu une crise de réalité",
        "J'ai été choisi par les forces cosmiques"
      ],
      limite: [
        "J'ai sauvé l'univers d'une destruction",
        "J'ai été recruté par les gardiens de la galaxie",
        "J'ai eu une révélation cosmique",
        "J'ai été choisi par le destin lui-même"
      ]
    }
  }
};

export const excuseService = {
  async generateExcuse(request: ExcuseRequest): Promise<string> {
    try {
      // Essayer d'abord Mistral pour une excuse intelligente
      const mistralResponse = await mistralExcuseService.generateIntelligentExcuse(request);
      return mistralResponse.excuse;
    } catch (error) {
      console.log('Mistral indisponible, utilisation des excuses prédéfinies');
      // Fallback vers les excuses prédéfinies
      return this.generateFallbackExcuse(request);
    }
  },

  generateFallbackExcuse(request: ExcuseRequest): string {
    const { category, credibility, tone } = request;
    
    const templates = EXCUSE_TEMPLATES[category]?.[credibility]?.[tone];
    
    if (!templates || templates.length === 0) {
      return "Désolé, je n'ai pas d'excuse pour ça... 😅";
    }
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  },

  async generateCustomExcuse(request: ExcuseRequest, context?: string): Promise<string> {
    let baseExcuse = await this.generateExcuse(request);
    
    if (context) {
      baseExcuse += ` ${context}`;
    }
    
    return baseExcuse;
  },

  getExcuseCategories(): ExcuseCategory[] {
    return ['retard', 'ghost', 'devoir', 'travail', 'rendez-vous', 'autre'];
  },

  getCredibilityLevels(): CredibilityLevel[] {
    return ['realiste', 'credule', 'mytho'];
  },

  getTones(): Tone[] {
    return ['serieux', 'drôle', 'surrealiste', 'limite'];
  }
}; 