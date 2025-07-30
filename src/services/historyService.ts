import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ExcuseRequest } from '../types';
import { authService } from './authService';

import { ExcuseCategory, CredibilityLevel, Tone, ExcuseHistoryItem as TypesExcuseHistoryItem } from '../types';

// Interface pour les données Firebase (avec Timestamp)
export interface ExcuseHistoryItemFirebase {
  id: string;
  excuse: string;
  filters: {
    category: ExcuseCategory;
    credibility: CredibilityLevel;
    tone: Tone;
  };
  createdAt: Timestamp;
}

export interface UserHistory {
  userId: string;
  excuses: ExcuseHistoryItemFirebase[];
  lastUpdated: Timestamp;
}

class HistoryService {
  private readonly COLLECTION_NAME = 'userHistory';

  /**
   * Ajoute une excuse à l'historique de l'utilisateur
   */
  async addExcuseToHistory(
    userId: string, 
    excuse: string, 
    filters: ExcuseRequest
  ): Promise<void> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);

      const newExcuseItem: ExcuseHistoryItemFirebase = {
        id: Date.now().toString(),
        excuse,
        filters: {
          category: filters.category,
          credibility: filters.credibility,
          tone: filters.tone
        },
        createdAt: Timestamp.now()
      };

      if (historyDoc.exists()) {
        // Mettre à jour l'historique existant
        await updateDoc(historyRef, {
          excuses: arrayUnion(newExcuseItem),
          lastUpdated: Timestamp.now()
        });
      } else {
        // Créer un nouvel historique
        const newHistory: UserHistory = {
          userId,
          excuses: [newExcuseItem],
          lastUpdated: Timestamp.now()
        };
        await setDoc(historyRef, newHistory);
      }

      console.log('Excuse ajoutée à l\'historique');
      
      // Incrémenter le compteur d'excuses générées
      try {
        await authService.incrementUserStats(userId, 'excusesGenerated');
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des statistiques:', error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'historique:', error);
      throw error;
    }
  }

  /**
   * Récupère l'historique des excuses d'un utilisateur
   */
  async getUserHistory(userId: string): Promise<TypesExcuseHistoryItem[]> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);

      if (historyDoc.exists()) {
        const data = historyDoc.data() as UserHistory;
        // Convertir les Timestamp en Date et trier par date de création (plus récent en premier)
        return data.excuses
          .map(item => ({
            ...item,
            createdAt: item.createdAt.toDate()
          }))
          .sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
      }

      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Supprime une excuse de l'historique
   */
  async removeExcuseFromHistory(userId: string, excuseId: string): Promise<void> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);

      if (historyDoc.exists()) {
        const data = historyDoc.data() as UserHistory;
        const updatedExcuses = data.excuses.filter(excuse => excuse.id !== excuseId);
        
        await updateDoc(historyRef, {
          excuses: updatedExcuses,
          lastUpdated: Timestamp.now()
        });

        console.log('Excuse supprimée de l\'historique');
        
        // Incrémenter le compteur d'excuses supprimées
        try {
          await authService.incrementUserStats(userId, 'excusesDeleted');
        } catch (error) {
          console.error('Erreur lors de l\'incrémentation des statistiques:', error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'excuse:', error);
      throw error;
    }
  }

  /**
   * Efface tout l'historique d'un utilisateur
   */
  async clearUserHistory(userId: string): Promise<void> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(historyRef, {
        userId,
        excuses: [],
        favorites: [],
        lastUpdated: Timestamp.now()
      });

      console.log('Historique effacé');
    } catch (error) {
      console.error('Erreur lors de l\'effacement de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Récupère les favoris d'un utilisateur
   */
  async getUserFavorites(userId: string): Promise<string[]> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);

      if (historyDoc.exists()) {
        const data = historyDoc.data();
        return data.favorites || [];
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
  }

  /**
   * Ajoute une excuse aux favoris
   */
  async addToFavorites(userId: string, excuseId: string): Promise<void> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);
      
      if (historyDoc.exists()) {
        const data = historyDoc.data();
        const favorites = data.favorites || [];
        
        if (!favorites.includes(excuseId)) {
          await updateDoc(historyRef, {
            favorites: [...favorites, excuseId],
            lastUpdated: Timestamp.now()
          });
        }
      } else {
        await setDoc(historyRef, { 
          userId,
          excuses: [],
          favorites: [excuseId],
          lastUpdated: Timestamp.now()
        });
      }
      
      console.log('Excuse ajoutée aux favoris:', excuseId);
      
      // Incrémenter le compteur d'excuses favorisées
      try {
        await authService.incrementUserStats(userId, 'excusesFavorited');
      } catch (error) {
        console.error('Erreur lors de l\'incrémentation des statistiques:', error);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  }

  /**
   * Retire une excuse des favoris
   */
  async removeFromFavorites(userId: string, excuseId: string): Promise<void> {
    try {
      const historyRef = doc(db, this.COLLECTION_NAME, userId);
      const historyDoc = await getDoc(historyRef);
      
      if (historyDoc.exists()) {
        const data = historyDoc.data();
        const favorites = data.favorites || [];
        
        const updatedFavorites = favorites.filter((id: string) => id !== excuseId);
        
        await updateDoc(historyRef, {
          favorites: updatedFavorites,
          lastUpdated: Timestamp.now()
        });
      }
      
      console.log('Excuse retirée des favoris:', excuseId);
    } catch (error) {
      console.error('Erreur lors du retrait des favoris:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques de l'utilisateur
   */
  async getUserStats(userId: string): Promise<{
    totalExcuses: number;
    favoriteCategory: string;
    favoriteCredibility: string;
    favoriteTone: string;
    totalFavorites: number;
    totalShared: number;
    totalDeleted: number;
  }> {
    try {
      const excuses = await this.getUserHistory(userId);
      
      if (excuses.length === 0) {
        return {
          totalExcuses: 0,
          favoriteCategory: 'Aucune',
          favoriteCredibility: 'Aucune',
          favoriteTone: 'Aucun',
          totalFavorites: 0,
          totalShared: 0,
          totalDeleted: 0
        };
      }

      // Compter les occurrences
      const categoryCount: { [key: string]: number } = {};
      const credibilityCount: { [key: string]: number } = {};
      const toneCount: { [key: string]: number } = {};

      excuses.forEach((excuse: any) => {
        // Vérifier si l'excuse a la nouvelle structure avec filters
        if (excuse.filters && excuse.filters.category) {
          categoryCount[excuse.filters.category] = (categoryCount[excuse.filters.category] || 0) + 1;
          credibilityCount[excuse.filters.credibility] = (credibilityCount[excuse.filters.credibility] || 0) + 1;
          toneCount[excuse.filters.tone] = (toneCount[excuse.filters.tone] || 0) + 1;
        } else if (excuse.category) {
          // Fallback pour l'ancienne structure
          categoryCount[excuse.category] = (categoryCount[excuse.category] || 0) + 1;
          credibilityCount[excuse.credibility || 'realiste'] = (credibilityCount[excuse.credibility || 'realiste'] || 0) + 1;
          toneCount[excuse.tone || 'serieux'] = (toneCount[excuse.tone || 'serieux'] || 0) + 1;
        }
      });

      // Récupérer les favoris
      const favorites = await this.getUserFavorites(userId);
      const totalFavorites = favorites.length;

      // Récupérer les statistiques utilisateur
      const userStats = await authService.getUserStats(userId);

      // Trouver les plus populaires
      const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
      );
      const favoriteCredibility = Object.keys(credibilityCount).reduce((a, b) => 
        credibilityCount[a] > credibilityCount[b] ? a : b
      );
      const favoriteTone = Object.keys(toneCount).reduce((a, b) => 
        toneCount[a] > toneCount[b] ? a : b
      );

      return {
        totalExcuses: excuses.length,
        favoriteCategory,
        favoriteCredibility,
        favoriteTone,
        totalFavorites,
        totalShared: userStats.excusesShared,
        totalDeleted: userStats.excusesDeleted
      };
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        totalExcuses: 0,
        favoriteCategory: 'Erreur',
        favoriteCredibility: 'Erreur',
        favoriteTone: 'Erreur',
        totalFavorites: 0,
        totalShared: 0,
        totalDeleted: 0
      };
    }
  }
}

export const historyService = new HistoryService(); 