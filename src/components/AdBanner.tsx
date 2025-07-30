import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAuth } from '../contexts/AuthContext';
import { adService } from '../services/adService';

const { width } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

export const AdBanner: React.FC<AdBannerProps> = ({ position = 'bottom' }) => {
  const { user } = useAuth();
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);

  useEffect(() => {
    // Initialiser le service de publicités
    adService.initialize();
  }, []);

  // Ne pas afficher les publicités pour les utilisateurs premium
  if (user?.isPremium) {
    return null;
  }

  const handleAdLoaded = () => {
    setIsAdLoaded(true);
    setAdError(null);
  };

  const handleAdError = (error: any) => {
    console.error('Erreur publicité:', error);
    setAdError(error.message);
    setIsAdLoaded(false);
  };

  const handleAdClosed = () => {
    setIsAdLoaded(false);
  };

  return (
    <View style={[
      styles.container,
      position === 'top' ? styles.topPosition : styles.bottomPosition
    ]}>
      <BannerAd
        unitId={adService.getBannerAdUnitId()}
        size={isTablet ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          keywords: ['excuse', 'humor', 'fun', 'mobile app'],
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdError}
        onAdClosed={handleAdClosed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  topPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
}); 