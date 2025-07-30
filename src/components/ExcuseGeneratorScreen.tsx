import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Animated,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { excuseService } from '../services/excuseService';
import { historyService } from '../services/historyService';
import { authService } from '../services/authService';
import { getRandomSubtitle } from '../utils/randomUtils';
import { ExcuseCategory, CredibilityLevel, Tone } from '../types';
import { SettingsScreen } from './SettingsScreen';
import { HistoryScreen } from './HistoryScreen';
import { PremiumScreen } from './PremiumScreen';
import { Ionicons } from '@expo/vector-icons';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes
const AD_UNIT_ID = __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-3940256099942544/6300978111'; 

export const ExcuseGeneratorScreen: React.FC = () => {
  const { user } = useAuth();
  const { themeColors, isLoading, isThemeInitialized } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<ExcuseCategory>('retard');
  const [selectedCredibility, setSelectedCredibility] = useState<CredibilityLevel>('realiste');
  const [selectedTone, setSelectedTone] = useState<Tone>('serieux');
  const [currentExcuse, setCurrentExcuse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showSettings, setShowSettings] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentExcuseId, setCurrentExcuseId] = useState<string>('');
  const [isCurrentExcuseFavorited, setIsCurrentExcuseFavorited] = useState(false);
  const [subtitle, setSubtitle] = useState<string>(getRandomSubtitle());
  const insets = useSafeAreaInsets();

  // Changer le sous-titre toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitle(getRandomSubtitle());
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, []);

  const categories = [
    { key: 'retard', label: '⏰ Retard', emoji: '⏰' },
    { key: 'ghost', label: '👻 Ghost', emoji: '👻' },
    { key: 'devoir', label: '📚 Devoir', emoji: '📚' },
    { key: 'travail', label: '💼 Travail', emoji: '💼' },
    { key: 'rendez-vous', label: '🤝 Rendez-vous', emoji: '🤝' },
    { key: 'autre', label: '❓ Autre', emoji: '❓' },
  ];

  const credibilityLevels = [
    { key: 'realiste', label: 'Réaliste', color: '#4CAF50' },
    { key: 'credule', label: 'Crédible', color: '#FF9800' },
    { key: 'mytho', label: 'Mytho', color: '#F44336' },
  ];

  const tones = [
    { key: 'serieux', label: 'Sérieux', emoji: '😐' },
    { key: 'drôle', label: 'Drôle', emoji: '😄' },
    { key: 'surrealiste', label: 'Surréaliste', emoji: '🤪' },
    { key: 'limite', label: 'Limite', emoji: '😱' },
  ];

  const generateExcuse = async () => {
    setIsGenerating(true);
    setCurrentExcuseId('');
    setIsCurrentExcuseFavorited(false);
    setSubtitle(getRandomSubtitle()); // Changer le sous-titre aléatoirement
    
    // Animation de fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const excuse = await excuseService.generateExcuse({
          category: selectedCategory,
          credibility: selectedCredibility,
          tone: selectedTone,
        });
        
        setCurrentExcuse(excuse);
        
        // Sauvegarder dans l'historique
        if (user?.id) {
          try {
            await historyService.addExcuseToHistory(user.id, excuse, {
              category: selectedCategory,
              credibility: selectedCredibility,
              tone: selectedTone,
            });
            
            // Récupérer l'historique pour trouver l'excuse qu'on vient d'ajouter
            const history = await historyService.getUserHistory(user.id);
            const newExcuse = history.find(item => 
              item.excuse === excuse && 
              item.filters.category === selectedCategory &&
              item.filters.credibility === selectedCredibility &&
              item.filters.tone === selectedTone
            );
            
            if (newExcuse) {
              setCurrentExcuseId(newExcuse.id);
              
              // Vérifier si l'excuse est dans les favoris
              const favorites = await historyService.getUserFavorites(user.id);
              setIsCurrentExcuseFavorited(favorites.includes(newExcuse.id));
            }
          } catch (error) {
            console.error('Erreur lors de la sauvegarde dans l\'historique:', error);
          }
        }
        
        // Animation de fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        Alert.alert('Erreur', 'Impossible de générer une excuse pour le moment');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const shareExcuse = async () => {
    if (!currentExcuse) {
      Alert.alert('Erreur', 'Générez d\'abord une excuse !');
      return;
    }

    try {
      await Share.share({
        message: `${currentExcuse}`,
        title: 'Mon excuse géniale',
      });
      
      // Incrémenter le compteur d'excuses partagées
      if (user?.id) {
        try {
          await authService.incrementUserStats(user.id, 'excusesShared');
        } catch (error) {
          console.error('Erreur lors de l\'incrémentation des statistiques:', error);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager l\'excuse');
    }
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handlePremium = () => {
    setShowPremium(true);
  };

  const toggleFavorite = async () => {
    if (!currentExcuseId || !user?.id) {
      Alert.alert('Erreur', 'Aucune excuse à ajouter aux favoris');
      return;
    }

    try {
      if (isCurrentExcuseFavorited) {
        await historyService.removeFromFavorites(user.id, currentExcuseId);
        setIsCurrentExcuseFavorited(false);
      } else {
        await historyService.addToFavorites(user.id, currentExcuseId);
        setIsCurrentExcuseFavorited(true);
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    }
  };

  // Utiliser le thème par défaut pendant le chargement pour éviter le flickering
  const gradientColors = (isLoading || !isThemeInitialized) ? ['#667eea', '#764ba2'] as [string, string] : themeColors.background as [string, string];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + (isTablet ? 20 : 5) }]}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
            <Ionicons name="settings-outline" size={isTablet ? 48 : 34} color="white" />
          </TouchableOpacity> 
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>
            Salut {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'} ! 👋
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📂 Catégorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.key && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category.key as ExcuseCategory)}
              >
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.selectedCategoryText
                ]}>
                  {category.label.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Credibility Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Niveau de crédibilité</Text>
          <View style={styles.credibilityContainer}>
            {credibilityLevels.map((level) => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.credibilityButton,
                  { borderColor: level.color },
                  selectedCredibility === level.key && { backgroundColor: level.color }
                ]}
                onPress={() => setSelectedCredibility(level.key as CredibilityLevel)}
              >
                <Text style={[
                  styles.credibilityText,
                  selectedCredibility === level.key && styles.selectedCredibilityText
                ]}>
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tone Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎭 Ton</Text>
          <View style={styles.toneContainer}>
            {tones.map((tone) => (
              <TouchableOpacity
                key={tone.key}
                style={[
                  styles.toneButton,
                  selectedTone === tone.key && styles.selectedTone
                ]}
                onPress={() => setSelectedTone(tone.key as Tone)}
              >
                <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                <Text style={[
                  styles.toneText,
                  selectedTone === tone.key && styles.selectedToneText
                ]}>
                  {tone.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
          onPress={generateExcuse}
          disabled={isGenerating}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? 'Génération...' : '🎲 Générer une excuse'}
          </Text>
        </TouchableOpacity>

        {/* Generated Excuse */}
        {(currentExcuse || isGenerating) && (
          <Animated.View style={[styles.excuseContainer, { opacity: fadeAnim }]}>
            <Text style={styles.excuseLabel}>Votre excuse :</Text>
            <View style={styles.excuseCard}>
              {isGenerating ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.loadingText}>Génération en cours...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.excuseActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={shareExcuse}>
                      <Ionicons name="share-outline" size={isTablet ? 28 : 24} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
                      <Ionicons 
                        name={isCurrentExcuseFavorited ? "heart" : "heart-outline"} 
                        size={isTablet ? 28 : 24} 
                        color={isCurrentExcuseFavorited ? "#FF6B6B" : "#FF6B6B"} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.excuseText}>"{currentExcuse}"</Text>
                </>
              )}
            </View>
          </Animated.View>
        )}

        {/* Premium Banner */}
          {!user?.isPremium && (
            <View style={styles.premiumBanner}>
              <Text style={styles.premiumTitle}>🌟 Passez Premium !</Text>
              <Text style={styles.premiumText}>
                Débloquez 50 excuses mythiques et la personnalisation illimitée
              </Text>
              <TouchableOpacity style={styles.premiumButton} onPress={handlePremium}>
                <Text style={styles.premiumButtonText}>💎 Découvrir Premium</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* History Button */}
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(true)}>
          <Ionicons name="time-outline" size={24} color="white" />
          <Text style={styles.historyButtonText}>📚 Voir l'historique</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

                   {/* Settings Modal */}
             {showSettings && (
               <SettingsScreen onGoBack={() => setShowSettings(false)} />
             )}

             {/* Premium Modal */}
             {showPremium && (
               <PremiumScreen onGoBack={() => setShowPremium(false)} />
             )}

             {/* History Modal */}
             {showHistory && (
               <HistoryScreen onGoBack={() => setShowHistory(false)} />
             )}
              {/* Bandeau publicitaire */}
              <View style={styles.bottomAdContainer}>
                <BannerAd
                  unitId={AD_UNIT_ID}
                  size={isTablet ? BannerAdSize.ANCHORED_ADAPTIVE_BANNER : BannerAdSize.BANNER}
                  requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                  }}
                />
              </View>
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
    padding: isTablet ? 40 : 30,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: isTablet ? 12 : 8,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    flex: 1,
  },
  settingsText: {
    color: 'white',
    fontSize: isTablet ? 32 : 24,
  },
  userInfo: {
    alignItems: 'center',
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 40 : 30,
  },
  welcomeText: {
    fontSize: isTablet ? 38 : 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 8 : 5,
  },
  subtitle: {
    fontSize: isTablet ? 26 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 35 : 25,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 20 : 15,
  },
  horizontalScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    padding: isTablet ? 20 : 15,
    marginRight: isTablet ? 20 : 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: isTablet ? 20 : 15,
    minWidth: isTablet ? 100 : 80,
  },
  selectedCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  categoryEmoji: {
    fontSize: isTablet ? 32 : 24,
    marginBottom: isTablet ? 8 : 5,
  },
  categoryText: {
    fontSize: isTablet ? 14 : 12,
    color: 'white',
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: '#333',
  },
  credibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  credibilityButton: {
    flex: 1,
    padding: isTablet ? 20 : 15,
    marginHorizontal: isTablet ? 8 : 5,
    borderWidth: 2,
    borderRadius: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  credibilityText: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600',
    color: 'white',
  },
  selectedCredibilityText: {
    color: 'white',
  },
  toneContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toneButton: {
    width: isTablet ? (width - 120) / 2 : (width - 60) / 2,
    padding: isTablet ? 20 : 15,
    marginBottom: isTablet ? 15 : 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedTone: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  toneEmoji: {
    fontSize: isTablet ? 32 : 24,
    marginBottom: isTablet ? 8 : 5,
  },
  toneText: {
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600',
    color: 'white',
  },
  selectedToneText: {
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#5515D5', // Orange vif pour toujours être visible
    padding: isTablet ? 25 : 18,
    marginHorizontal: isTablet ? 40 : 20,
    borderRadius: isTablet ? 20 : 15,
    alignItems: 'center',
    marginBottom: isTablet ? 35 : 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: 'white',
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
  },
  excuseContainer: {
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 35 : 25,
  },
  excuseLabel: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: isTablet ? 15 : 10,
  },
  excuseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isTablet ? 30 : 20,
    borderRadius: isTablet ? 20 : 15,
    marginBottom: isTablet ? 20 : 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    position: 'relative',
  },
  excuseText: {
    fontSize: isTablet ? 22 : 18,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: isTablet ? 28 : 24,
    paddingTop: isTablet ? 50 : 40, // Espace pour les boutons en haut
  },
  shareButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    gap: 10,
  },
  excuseActions: {
    position: 'absolute',
    top: isTablet ? 20 : 15,
    right: isTablet ? 20 : 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 15 : 10,
    zIndex: 1,
  },
  favoriteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: isTablet ? 10 : 8,
    borderRadius: isTablet ? 12 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBanner: {
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  premiumText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  premiumButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 50,
  },
  bottomAdContainer: {
    width: width,
    alignItems: 'center',
    marginBottom: 20,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5515D5',
    padding: isTablet ? 20 : 15,
    marginHorizontal: isTablet ? 40 : 20,
    marginTop: isTablet ? 25 : 20,
    borderRadius: isTablet ? 20 : 15,
    marginBottom: isTablet ? 25 : 20,
  },
  historyButtonText: {
    color: 'white',
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600',
    marginLeft: isTablet ? 15 : 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
}); 