import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';
import { authService } from './authService';

// Configuration RevenueCat
const REVENUECAT_CONFIG = {
  // Clés API pour chaque plateforme
  API_KEYS: {
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  },
  // Identifiants des produits
  PRODUCT_IDS: {
    PREMIUM_MONTHLY: 'premium_monthly',
    PREMIUM_YEARLY: 'premium_yearly',
    PREMIUM_LIFETIME: 'premium_lifetime',
  },
  // Identifiants des entités (entitlements)
  ENTITLEMENT_IDS: {
    PREMIUM: 'premium',
  },
};

class PurchaseService {
  private isInitialized = false;

  /**
   * Initialise RevenueCat
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_CONFIG.API_KEYS.ios 
        : REVENUECAT_CONFIG.API_KEYS.android;

      if (!apiKey) {
        throw new Error(`Clé API RevenueCat manquante pour ${Platform.OS}`);
      }

      await Purchases.configure({ apiKey });
      console.log('RevenueCat initialisé avec succès');
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Identifie l'utilisateur dans RevenueCat
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('Utilisateur identifié dans RevenueCat:', userId);
    } catch (error) {
      console.error('Erreur lors de l\'identification de l\'utilisateur:', error);
      throw error;
    }
  }

  /**
   * Récupère les offres disponibles
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      return null;
    }
  }

  /**
   * Affiche l'écran d'achat pour un package spécifique
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Vérifier si l'utilisateur a maintenant accès au premium
      const isPremium = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_IDS.PREMIUM] !== undefined;
      
      console.log('Achat réussi, statut premium:', isPremium);
      
      // Mettre à jour le statut premium dans Firebase si l'achat est réussi
      if (isPremium) {
        await this.updateUserPremiumStatus(true);
      }
      
      return isPremium;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('Achat annulé par l\'utilisateur');
      } else {
        console.error('Erreur lors de l\'achat:', error);
      }
      return false;
    }
  }

  /**
   * Vérifie le statut premium de l'utilisateur
   */
  async checkPremiumStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_IDS.PREMIUM] !== undefined;
      
      console.log('Statut premium vérifié:', isPremium);
      return isPremium;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut premium:', error);
      return false;
    }
  }

  /**
   * Restaure les achats
   */
  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = customerInfo.entitlements.active[REVENUECAT_CONFIG.ENTITLEMENT_IDS.PREMIUM] !== undefined;
      
      console.log('Achats restaurés, statut premium:', isPremium);
      
      // Mettre à jour le statut premium dans Firebase si la restauration est réussie
      if (isPremium) {
        await this.updateUserPremiumStatus(true);
      }
      
      return isPremium;
    } catch (error) {
      console.error('Erreur lors de la restauration des achats:', error);
      return false;
    }
  }

  /**
   * Déconnecte l'utilisateur de RevenueCat
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('Utilisateur déconnecté de RevenueCat');
    } catch (error) {
      console.error('Erreur lors de la déconnexion de RevenueCat:', error);
    }
  }

  /**
   * Obtient les informations du client
   */
  async getCustomerInfo() {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Erreur lors de la récupération des informations client:', error);
      return null;
    }
  }

  /**
   * Met à jour le statut premium de l'utilisateur dans Firebase
   */
  private async updateUserPremiumStatus(isPremium: boolean): Promise<void> {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.id) {
        await authService.updateUserPremiumStatus(currentUser.id, isPremium);
        console.log('Statut premium mis à jour dans Firebase:', isPremium);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut premium:', error);
    }
  }

  /**
   * Vérifie si RevenueCat est initialisé
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const purchaseService = new PurchaseService(); 