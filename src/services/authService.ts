import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';
import { persistenceService } from './persistenceService';

export const authService = {
  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (displayName) {
        await updateProfile(user, { displayName });
      }

      const newUser: User = {
        id: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || undefined,
        isPremium: false,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), newUser);
      
      // Sauvegarder en local
      await persistenceService.saveUserData(newUser);
      
      return newUser;
    } catch (error) {
      throw error;
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Sauvegarder en local
        await persistenceService.saveUserData(userData);
        
        return userData;
      }
      
      throw new Error('Utilisateur non trouvé');
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      
      // Effacer les données locales
      await persistenceService.clearUserData();
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Essayer de récupérer depuis le stockage local
        const localUser = await persistenceService.getUserData();
        return localUser;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Mettre à jour le stockage local
        await persistenceService.saveUserData(userData);
        
        return userData;
      }
      return null;
    } catch (error) {
      // En cas d'erreur, essayer de récupérer depuis le stockage local
      try {
        const localUser = await persistenceService.getUserData();
        return localUser;
      } catch (localError) {
        console.error('Erreur lors de la récupération locale:', localError);
        throw error;
      }
    }
  },

  async updateUserPremiumStatus(userId: string, isPremium: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isPremium: isPremium,
        premiumUpdatedAt: new Date(),
      });

      // Mettre à jour les données locales
      await persistenceService.updateUserData({ isPremium });
      
      console.log('Statut premium mis à jour:', isPremium);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut premium:', error);
      throw error;
    }
  },

  async updateUserDisplayName(userId: string, displayName: string): Promise<void> {
    try {
      // Mettre à jour dans Firebase
      await updateDoc(doc(db, 'users', userId), {
        displayName: displayName,
        updatedAt: new Date(),
      });

      // Mettre à jour le profil Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
      }

      // Mettre à jour les données locales
      await persistenceService.updateUserData({ displayName });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom d\'affichage:', error);
      throw error;
    }
  },

  async incrementUserStats(userId: string, field: 'excusesGenerated' | 'excusesShared' | 'excusesFavorited' | 'excusesDeleted'): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Utiliser increment() pour atomiquement incrémenter le champ
      await updateDoc(userRef, {
        [field]: increment(1),
        lastStatsUpdate: new Date(),
      });

      console.log(`Statistique ${field} incrémentée pour l'utilisateur:`, userId);
    } catch (error) {
      console.error(`Erreur lors de l'incrémentation de ${field}:`, error);
      throw error;
    }
  },

  async getUserStats(userId: string): Promise<{
    excusesGenerated: number;
    excusesShared: number;
    excusesFavorited: number;
    excusesDeleted: number;
  }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          excusesGenerated: userData.excusesGenerated || 0,
          excusesShared: userData.excusesShared || 0,
          excusesFavorited: userData.excusesFavorited || 0,
          excusesDeleted: userData.excusesDeleted || 0,
        };
      }
      return {
        excusesGenerated: 0,
        excusesShared: 0,
        excusesFavorited: 0,
        excusesDeleted: 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
      return {
        excusesGenerated: 0,
        excusesShared: 0,
        excusesFavorited: 0,
        excusesDeleted: 0,
      };
    }
  }
}; 