import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { purchaseService } from '../services/purchaseService';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { authService } from '../services/authService';

interface PremiumScreenProps {
  onGoBack: () => void;
}

export const PremiumScreen: React.FC<PremiumScreenProps> = ({ onGoBack }) => {
  const { themeColors, isThemeInitialized } = useTheme();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const { user, logout } = useAuth();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    initializePremium();
  }, []);

  const initializePremium = async () => {
    try {
      setLoading(true);
      
      // Initialiser RevenueCat
      await purchaseService.initialize();
      
      // Identifier l'utilisateur
      if (user?.id) {
        await purchaseService.identifyUser(user.id);
      }
      
      // Récupérer les offres
      const currentOfferings = await purchaseService.getOfferings();
      setOfferings(currentOfferings);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation premium:', error);
      Alert.alert('Erreur', 'Impossible de charger les offres premium');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      
      const isPremium = await purchaseService.purchasePackage(packageToPurchase);
      
      if (isPremium) {
        // Rafraîchir les données utilisateur pour refléter le nouveau statut premium
        await authService.getCurrentUser();
        
        Alert.alert(
          '🎉 Félicitations !',
          'Vous êtes maintenant abonné Premium ! Profitez de toutes les fonctionnalités exclusives.',
          [{ text: 'OK', onPress: onGoBack }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      Alert.alert('Erreur', 'Impossible de finaliser l\'achat. Veuillez réessayer.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      const isPremium = await purchaseService.restorePurchases();
      
      if (isPremium) {
        // Rafraîchir les données utilisateur pour refléter le nouveau statut premium
        await authService.getCurrentUser();
        
        Alert.alert(
          '✅ Achats restaurés',
          'Vos achats ont été restaurés avec succès !',
          [{ text: 'OK', onPress: onGoBack }]
        );
      } else {
        Alert.alert('Aucun achat', 'Aucun achat à restaurer n\'a été trouvé.');
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
    } finally {
      setLoading(false);
    }
  };

  const getPackagePrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getPackagePeriod = (pkg: PurchasesPackage) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('monthly')) return 'mois';
    if (identifier.includes('yearly')) return 'an';
    if (identifier.includes('lifetime')) return 'à vie';
    return '';
  };

  const getPackageIcon = (pkg: PurchasesPackage) => {
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('monthly')) return '📅';
    if (identifier.includes('yearly')) return '📆';
    if (identifier.includes('lifetime')) return '👑';
    return '💎';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={themeColors.background as [string, string]}
        style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Passez Premium !</Text>
          <Text style={styles.heroSubtitle}>
            Débloquez toutes les fonctionnalités exclusives et générez des excuses encore plus créatives
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Fonctionnalités Premium</Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="infinite" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Génération illimitée d'excuses</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.featureText}>50 excuses mythiques exclusives</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              <Text style={styles.featureText}>Aucune publicité</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={24} color="#FF69B4" />
              <Text style={styles.featureText}>Soutenir le projet <Text style={styles.featureText}>💖</Text></Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={24} color="#9C27B0" />
              <Text style={styles.featureText}>Statistiques d'utilisation détaillées</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        {offerings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Choisissez votre plan</Text>
            
                         {offerings.availablePackages.map((pkg) => (
               <View
                 key={pkg.identifier}
                 style={[
                   styles.packageCard,
                   purchasing === pkg.identifier && styles.purchasingCard
                 ]}
               >
                 <View style={styles.packageHeader}>
                   <Text style={styles.packageIcon}>{getPackageIcon(pkg)}</Text>
                   <View style={styles.packageInfo}>
                     <Text style={styles.packageTitle}>
                       {pkg.product.title}
                     </Text>
                     <Text style={styles.packageDescription}>
                       {pkg.product.description}
                     </Text>
                   </View>
                 </View>
                 
                 <View style={styles.packagePrice}>
                   <Text style={styles.priceText}>{getPackagePrice(pkg)}</Text>
                 </View>

                 <TouchableOpacity
                   style={[
                     styles.purchaseButton,
                     purchasing === pkg.identifier && styles.purchasingButton
                   ]}
                   onPress={() => handlePurchase(pkg)}
                   disabled={purchasing !== null}
                 >
                   {purchasing === pkg.identifier ? (
                     <ActivityIndicator size="small" color="white" />
                   ) : (
                     <Text style={styles.purchaseButtonText}>Acheter</Text>
                   )}
                 </TouchableOpacity>
               </View>
             ))}
          </View>
        )}

        {/* Restore Purchases */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.restoreButtonText}>Restaurer mes achats</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            En vous abonnant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            Les abonnements se renouvellent automatiquement sauf annulation.
          </Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 15,
    flex: 1,
  },
  packageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  purchasingCard: {
    borderColor: '#4CAF50',
    opacity: 0.7,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  packageIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  packageInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  packageDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  packagePrice: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  periodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  purchaseButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  purchasingButton: {
    backgroundColor: '#2E7D32',
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  termsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 50,
  },
}); 