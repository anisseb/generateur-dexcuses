import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { auth } from '../config/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

class PersistenceService {
  private readonly AUTH_KEY = 'auth_user_data';
  private readonly AUTH_TIMESTAMP_KEY = 'auth_timestamp';
  private readonly FIREBASE_AUTH_KEY = 'firebase_auth_state';

  /**
   * Sauvegarde les données utilisateur en local
   */
  async saveUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.AUTH_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(this.AUTH_TIMESTAMP_KEY, Date.now().toString());
      await AsyncStorage.setItem(this.FIREBASE_AUTH_KEY, 'true');
      console.log('Données utilisateur sauvegardées localement');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
    }
  }

  /**
   * Récupère les données utilisateur sauvegardées
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.AUTH_KEY);
      const timestamp = await AsyncStorage.getItem(this.AUTH_TIMESTAMP_KEY);
      
      if (!userData || !timestamp) {
        return null;
      }

      const user = JSON.parse(userData);
      const savedTimestamp = parseInt(timestamp);
      const now = Date.now();
      
      // Vérifier si les données ne sont pas trop anciennes (7 jours)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
      if (now - savedTimestamp > maxAge) {
        await this.clearUserData();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Efface les données utilisateur sauvegardées
   */
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.AUTH_KEY);
      await AsyncStorage.removeItem(this.AUTH_TIMESTAMP_KEY);
      await AsyncStorage.removeItem(this.FIREBASE_AUTH_KEY);
      console.log('Données utilisateur effacées localement');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données utilisateur:', error);
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté localement
   */
  async isUserLoggedIn(): Promise<boolean> {
    try {
      const firebaseAuthState = await AsyncStorage.getItem(this.FIREBASE_AUTH_KEY);
      if (firebaseAuthState === 'true') {
        const userData = await this.getUserData();
        return userData !== null;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  }

  /**
   * Synchronise l'état d'authentification avec Firebase
   */
  async syncWithFirebase(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        unsubscribe();
        
        if (firebaseUser) {
          // L'utilisateur est connecté sur Firebase, récupérer ses données
          try {
            const userData = await this.getUserData();
            if (userData && userData.id === firebaseUser.uid) {
              resolve(userData);
            } else {
              // Les données ne correspondent pas, effacer et retourner null
              await this.clearUserData();
              resolve(null);
            }
          } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            resolve(null);
          }
        } else {
          // L'utilisateur n'est pas connecté sur Firebase, effacer les données locales
          await this.clearUserData();
          resolve(null);
        }
      });
    });
  }

  /**
   * Met à jour les données utilisateur
   */
  async updateUserData(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUserData();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await this.saveUserData(updatedUser);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données utilisateur:', error);
    }
  }
}

export const persistenceService = new PersistenceService(); 