import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Alert as RNAlert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { historyService } from '../services/historyService';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfileScreen } from './ProfileScreen';
import { DarkModeScreen } from './DarkModeScreen';
import { SupportScreen } from './SupportScreen';
import { InfoScreen } from './InfoScreen';
import { PremiumScreen } from './PremiumScreen';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface SettingsScreenProps {
  onGoBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onGoBack }) => {
  const { user, logout } = useAuth();
  const { themeColors, isLoading, isThemeInitialized } = useTheme();
  const insets = useSafeAreaInsets();
  const [userStats, setUserStats] = useState<{
    totalExcuses: number;
    favoriteCategory: string;
    favoriteCredibility: string;
    favoriteTone: string;
    totalFavorites: number;
    totalShared: number;
    totalDeleted: number;
  } | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'profile' | 'darkMode' | 'support' | 'info'>('settings');
  const [infoSection, setInfoSection] = useState<'about' | 'legal' | 'privacy' | 'terms'>('about');
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    if (!user?.id) return;
    try {
      const stats = await historyService.getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const openLink = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        RNAlert.alert('Erreur', `Impossible d'ouvrir ${title}`);
      }
    } catch (error) {
      RNAlert.alert('Erreur', `Impossible d'ouvrir ${title}`);
    }
  };

  const handlePremium = () => {
    setShowPremium(true);
  };

  const settingsSections = [
    {
      title: '👤 Compte',
      items: [
        {
          title: 'Profil',
          subtitle: user?.displayName || user?.email || 'Utilisateur',
          icon: '👤',
          onPress: () => setCurrentScreen('profile')
        },
        {
          title: 'Statut Premium',
          subtitle: user?.isPremium ? 'Actif' : 'Gratuit',
          icon: user?.isPremium ? '💎' : '⭐',
          onPress: () => handlePremium()
        }
      ]
    },
    {
      title: '🔧 Application',
      items: [
        {
          title: 'Mode sombre',
          subtitle: 'Changer le thème',
          icon: '🌙',
          onPress: () => setCurrentScreen('darkMode')
        },
      ]
    },
    {
      title: '📱 Support',
      items: [
        {
          title: 'Aide & Support',
          subtitle: 'Besoin d\'aide ?',
          icon: '❓',
          onPress: () => setCurrentScreen('support')
        },
        {
          title: 'Signaler un bug',
          subtitle: 'Nous aider à améliorer l\'app',
          icon: '🐛',
          onPress: () => openLink('mailto:bugs@generateur-dexcuses.com', 'Signaler un bug')
        },
        {
          title: 'Suggestion',
          subtitle: 'Proposer une fonctionnalité',
          icon: '💡',
          onPress: () => openLink('mailto:suggestions@generateur-dexcuses.com', 'Suggestion')
        }
      ]
    },
    {
      title: '📄 Informations',
      items: [
        {
          title: 'À propos',
          subtitle: 'En savoir plus sur l\'app',
          icon: 'ℹ️',
          onPress: () => {
            setInfoSection('about');
            setCurrentScreen('info');
          }
        },
        {
          title: 'Mentions légales',
          subtitle: 'Informations légales',
          icon: '⚖️',
          onPress: () => {
            setInfoSection('legal');
            setCurrentScreen('info');
          }
        },
        {
          title: 'Politique de confidentialité',
          subtitle: 'Comment nous protégeons vos données',
          icon: '🔒',
          onPress: () => {
            setInfoSection('privacy');
            setCurrentScreen('info');
          }
        },
        {
          title: 'Conditions d\'utilisation',
          subtitle: 'Règles d\'utilisation de l\'app',
          icon: '📋',
          onPress: () => {
            setInfoSection('terms');
            setCurrentScreen('info');
          }
        }
      ]
    },
    {
      title: '🌐 Réseaux sociaux',
      items: [
        {
          title: 'Instagram',
          subtitle: 'Suivez-nous sur Instagram',
          icon: '📸',
          onPress: () => openLink('https://www.instagram.com/academ.ia.for.kids/', 'Instagram')
        },
        {
          title: 'TikTok',
          subtitle: 'Découvrez nos vidéos',
          icon: '🎵',
          onPress: () => openLink('https://www.tiktok.com/@academ__ia', 'TikTok')
        },
        {
          title: 'Twitter',
          subtitle: 'Restez informés',
          icon: '🐦',
          onPress: () => openLink('https://x.com/Academ__IA', 'Twitter')
        }
      ]
    }
  ];

  const handleGoBack = () => {
    if (currentScreen !== 'settings') {
      setCurrentScreen('settings');
    } else {
      onGoBack();
    }
  };

  if (currentScreen === 'profile') {
    return <ProfileScreen onGoBack={handleGoBack} />;
  }

  if (currentScreen === 'darkMode') {
    return <DarkModeScreen onGoBack={handleGoBack} />;
  }

  if (currentScreen === 'support') {
    return <SupportScreen onGoBack={handleGoBack} />;
  }

  if (currentScreen === 'info') {
    return <InfoScreen onGoBack={handleGoBack} initialSection={infoSection} />;
  }

  // Utiliser le thème par défaut pendant le chargement pour éviter le flickering
  const gradientColors = (isLoading || !isThemeInitialized) ? ['#667eea', '#764ba2'] as [string, string] : themeColors.background as [string, string];

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + (isTablet ? 20 : 15) }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⚙️ Paramètres</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* User Stats */}
          {userStats && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📊 Vos statistiques</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.totalExcuses}</Text>
                  <Text style={styles.statLabel}>Excuses générées</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.totalFavorites}</Text>
                  <Text style={styles.statLabel}>En favoris</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.totalShared}</Text>
                  <Text style={styles.statLabel}>Partagées</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userStats.totalDeleted}</Text>
                  <Text style={styles.statLabel}>Supprimées</Text>
                </View>
              </View>
              
              <View style={styles.preferencesGrid}>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceText}>{userStats.favoriteCategory}</Text>
                  <Text style={styles.preferenceLabel}>Catégorie préférée</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceText}>{userStats.favoriteCredibility}</Text>
                  <Text style={styles.preferenceLabel}>Niveau préféré</Text>
                </View>
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceText}>{userStats.favoriteTone}</Text>
                  <Text style={styles.preferenceLabel}>Ton préféré</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                >
                  <View style={styles.settingIcon}>
                    <Text style={styles.iconText}>{item.icon}</Text>
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

          {/* Premium Modal */}
          {showPremium && (
              <PremiumScreen onGoBack={() => setShowPremium(false)} />

          )}

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
    padding: isTablet ? 40 : 20,
  },
  backButton: {
    padding: isTablet ? 12 : 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 60,
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 40 : 30,
  },
  userName: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 8 : 5,
  },
  userEmail: {
    fontSize: isTablet ? 20 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: isTablet ? 35 : 25,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 20 : 15,
    paddingHorizontal: isTablet ? 40 : 20,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: isTablet ? 40 : 20,
    borderRadius: isTablet ? 20 : 15,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingIcon: {
    width: isTablet ? 50 : 40,
    height: isTablet ? 50 : 40,
    borderRadius: isTablet ? 25 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 20 : 15,
  },
  iconText: {
    fontSize: isTablet ? 24 : 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: isTablet ? 4 : 2,
  },
  settingSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  arrowText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 'bold',
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  bottomSpacing: {
    height: 50,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gold',
    marginBottom: 5,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  preferenceItem: {
    width: '32%',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'gold',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  preferenceLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
}); 