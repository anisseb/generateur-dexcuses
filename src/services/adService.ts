import mobileAds, {
  BannerAd,
  BannerAdSize,
  TestIds,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

// Configuration des publicités
const AD_CONFIG = {
  // Utiliser les IDs de test pour le développement
  BANNER_AD_UNIT_ID: __DEV__ ? TestIds.BANNER : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
  REWARDED_AD_UNIT_ID: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz',
  APP_ID: __DEV__ ? TestIds.APP_OPEN : 'ca-app-pub-xxxxxxxxxxxxxxxx~wwwwwwwwww',
};

class AdService {
  private isInitialized = false;

  /**
   * Initialise le service de publicités
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      await mobileAds().initialize();
      console.log('Service de publicités initialisé');
      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des publicités:', error);
    }
  }

  /**
   * Obtient l'ID de l'unité publicitaire pour les bannières
   */
  getBannerAdUnitId(): string {
    return AD_CONFIG.BANNER_AD_UNIT_ID;
  }

  /**
   * Obtient l'ID de l'unité publicitaire pour les publicités récompensées
   */
  getRewardedAdUnitId(): string {
    return AD_CONFIG.REWARDED_AD_UNIT_ID;
  }

  /**
   * Obtient l'ID de l'application
   */
  getAppId(): string {
    return AD_CONFIG.APP_ID;
  }

  /**
   * Vérifie si les publicités sont initialisées
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Charge une publicité récompensée
   */
  async loadRewardedAd(): Promise<RewardedAd | null> {
    try {
      const rewarded = RewardedAd.createForAdRequest(AD_CONFIG.REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
        keywords: ['excuse', 'humor', 'fun'],
      });

      const unsubscribeLoaded = rewarded.addAdEventListener(AdEventType.LOADED, () => {
        console.log('Publicité récompensée chargée');
      });

      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        reward => {
          console.log('Récompense gagnée:', reward);
        },
      );

      rewarded.load();

      return rewarded;
    } catch (error) {
      console.error('Erreur lors du chargement de la publicité récompensée:', error);
      return null;
    }
  }

  /**
   * Affiche une publicité récompensée
   */
  async showRewardedAd(): Promise<boolean> {
    try {
      const rewarded = await this.loadRewardedAd();
      if (!rewarded) return false;

      return new Promise((resolve) => {
        const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
          console.log('Publicité récompensée fermée');
          resolve(false);
        });

        const unsubscribeEarned = rewarded.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          () => {
            console.log('Récompense gagnée');
            resolve(true);
          },
        );

        rewarded.show();
      });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la publicité récompensée:', error);
      return false;
    }
  }
}

export const adService = new AdService(); 