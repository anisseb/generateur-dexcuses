export interface User {
  id: string;
  email: string;
  displayName?: string;
  isPremium: boolean;
  createdAt: Date;
}

export interface Excuse {
  id: string;
  text: string;
  category: ExcuseCategory;
  credibility: CredibilityLevel;
  tone: Tone;
  isPremium: boolean;
  createdAt: Date;
  userId?: string;
}

export type ExcuseCategory = 
  | 'retard'
  | 'ghost'
  | 'devoir'
  | 'travail'
  | 'rendez-vous'
  | 'autre';

export type CredibilityLevel = 
  | 'realiste'
  | 'credule'
  | 'mytho';

export type Tone = 
  | 'serieux'
  | 'drôle'
  | 'surrealiste'
  | 'limite';

export interface ExcuseRequest {
  category: ExcuseCategory;
  credibility: CredibilityLevel;
  tone: Tone;
  context?: string;
}

export interface PremiumPack {
  id: string;
  name: string;
  description: string;
  excuses: Excuse[];
  price: number;
}

export interface ExcuseHistoryItem {
  id: string;
  excuse: string;
  filters: {
    category: ExcuseCategory;
    credibility: CredibilityLevel;
    tone: Tone;
  };
  createdAt: Date;
} 