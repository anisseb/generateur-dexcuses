import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserSettings {
  theme: string;
  darkMode: boolean;
  autoTheme: boolean;
  notifications: boolean;
  language: string;
  lastUpdated: Date;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  darkMode: false,
  autoTheme: true,
  notifications: true,
  language: 'fr',
  lastUpdated: new Date()
};

class SettingsService {
  private readonly COLLECTION_NAME = 'users';

  /**
   * Récupère les paramètres d'un utilisateur
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.settings) {
          return {
            ...DEFAULT_SETTINGS,
            ...userData.settings,
            lastUpdated: userData.settings.lastUpdated?.toDate() || new Date()
          };
        }
      }

      // Retourner les paramètres par défaut si aucun paramètre n'existe
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Met à jour les paramètres d'un utilisateur
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      const updatedSettings = {
        ...settings,
        lastUpdated: new Date()
      };

      if (userDoc.exists()) {
        // Mettre à jour les paramètres existants
        await updateDoc(userRef, {
          settings: updatedSettings
        });
      } else {
        // Créer un nouveau document utilisateur avec les paramètres
        await setDoc(userRef, {
          settings: updatedSettings
        });
      }

      console.log('Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      throw error;
    }
  }

  /**
   * Met à jour un paramètre spécifique
   */
  async updateSetting(userId: string, key: keyof UserSettings, value: any): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION_NAME, userId);
      const userDoc = await getDoc(userRef);

      const updateData = {
        [`settings.${key}`]: value,
        'settings.lastUpdated': new Date()
      };

      if (userDoc.exists()) {
        await updateDoc(userRef, updateData);
      } else {
        const currentSettings = { ...DEFAULT_SETTINGS, [key]: value, lastUpdated: new Date() };
        await setDoc(userRef, { settings: currentSettings });
      }

      console.log(`Paramètre ${key} mis à jour avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du paramètre ${key}:`, error);
      throw error;
    }
  }

  /**
   * Réinitialise les paramètres aux valeurs par défaut
   */
  async resetSettings(userId: string): Promise<void> {
    try {
      await this.updateUserSettings(userId, DEFAULT_SETTINGS);
      console.log('Paramètres réinitialisés avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des paramètres:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService(); 