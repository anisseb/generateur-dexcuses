import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { historyService } from '../services/historyService';
import { authService } from '../services/authService';
import { reportService } from '../services/reportService';
import { ExcuseCategory, ExcuseHistoryItem, CredibilityLevel, Tone } from '../types';
import { Share } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface HistoryScreenProps {
  onGoBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onGoBack }) => {
  const { user } = useAuth();
  const { themeColors, isThemeInitialized } = useTheme();
  const insets = useSafeAreaInsets();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const [history, setHistory] = useState<ExcuseHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExcuseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ExcuseCategory | 'all' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { key: 'all', label: '📋 Tout', emoji: '📋' },
    { key: 'favorites', label: '❤️ Favoris', emoji: '❤️' },
    { key: 'retard', label: '⏰ Retard', emoji: '⏰' },
    { key: 'ghost', label: '👻 Ghost', emoji: '👻' },
    { key: 'devoir', label: '📚 Devoir', emoji: '📚' },
    { key: 'travail', label: '💼 Travail', emoji: '💼' },
    { key: 'rendez-vous', label: '🤝 Rendez-vous', emoji: '🤝' },
    { key: 'autre', label: '❓ Autre', emoji: '❓' },
  ];

  const loadHistory = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userHistory = await historyService.getUserHistory(user.id);
      const normalizedHistory = normalizeHistoryData(userHistory);
      setHistory(normalizedHistory);
      applyFilter(normalizedHistory, selectedFilter);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user?.id) return;
    
    try {
      const userFavorites = await historyService.getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    }
  };

  const applyFilter = (historyData: ExcuseHistoryItem[], filter: ExcuseCategory | 'all' | 'favorites') => {
    let filtered = historyData;
    
    if (filter === 'favorites') {
      filtered = historyData.filter(item => favorites.includes(item.id));
    } else if (filter !== 'all') {
      filtered = historyData.filter(item => item.filters.category === filter);
    }
    
    setFilteredHistory(filtered);
  };

  const handleFilterChange = (filter: ExcuseCategory | 'all' | 'favorites') => {
    setSelectedFilter(filter);
    applyFilter(history, filter);
  };

  const toggleFavorite = async (excuseId: string) => {
    if (!user?.id) return;
    
    try {
      const isFavorite = favorites.includes(excuseId);
      
      if (isFavorite) {
        await historyService.removeFromFavorites(user.id, excuseId);
        setFavorites(prev => prev.filter(id => id !== excuseId));
      } else {
        await historyService.addToFavorites(user.id, excuseId);
        setFavorites(prev => [...prev, excuseId]);
      }
      
      // Re-appliquer le filtre si on est sur la page favoris
      if (selectedFilter === 'favorites') {
        applyFilter(history, 'favorites');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour les favoris');
    }
  };

  const shareExcuse = async (excuse: string) => {
    try {
      await Share.share({
        message: `"${excuse}"`,
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
      console.error('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager l\'excuse');
    }
  };

  const deleteExcuse = async (excuseId: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      'Supprimer l\'excuse',
      'Êtes-vous sûr de vouloir supprimer cette excuse de votre historique ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.removeExcuseFromHistory(user.id, excuseId);
              
              // Mettre à jour l'état local
              const updatedHistory = history.filter(item => item.id !== excuseId);
              setHistory(updatedHistory);
              applyFilter(updatedHistory, selectedFilter);
              
              // Retirer des favoris si nécessaire
              if (favorites.includes(excuseId)) {
                setFavorites(prev => prev.filter(id => id !== excuseId));
              }
              
              Alert.alert('Succès', 'Excuse supprimée de l\'historique');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'excuse');
            }
          }
        }
      ]
    );
  };

  const reportExcuse = async (excuse: string, category: string, credibility: string, tone: string) => {
    if (!user?.id) return;
    
    Alert.alert(
      '🚩 Signaler cette excuse',
      'Cette excuse vous semble-t-elle inappropriée ou choquante ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Signaler',
          style: 'destructive',
          onPress: async () => {
            try {
              await reportService.reportExcuse(
                excuse,
                user.id,
                user.email || '',
                category,
                credibility,
                tone
              );
              
              Alert.alert(
                '✅ Signalement enregistré',
                'Merci pour votre signalement. Notre équipe va examiner cette excuse.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Erreur lors du signalement:', error);
              Alert.alert('Erreur', 'Impossible d\'enregistrer le signalement');
            }
          }
        }
      ]
    );
  };

  const clearHistory = async () => {
    if (!user?.id) return;
    
    Alert.alert(
      'Supprimer l\'historique',
      'Êtes-vous sûr de vouloir supprimer tout votre historique ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.clearUserHistory(user.id);
              setHistory([]);
              setFilteredHistory([]);
              Alert.alert('Succès', 'Historique supprimé avec succès');
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'historique');
            }
          }
        }
      ]
    );
  };

  const refreshHistory = async () => {
    setRefreshing(true);
    await Promise.all([loadHistory(), loadFavorites()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadHistory();
    loadFavorites();
  }, [user?.id]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'realiste': return '#4CAF50';
      case 'credule': return '#FF9800';
      case 'mytho': return '#F44336';
      default: return '#4CAF50';
    }
  };

  // Fonction pour normaliser les données d'historique (migration des anciennes données)
  const normalizeHistoryData = (historyData: any[]): ExcuseHistoryItem[] => {
    return historyData.map(item => {
      // Si l'item a l'ancienne structure (sans filters)
      if (item.category && !item.filters) {
        return {
          id: item.id,
          excuse: item.excuse,
          filters: {
            category: item.category as ExcuseCategory,
            credibility: (item.credibility || 'realiste') as CredibilityLevel,
            tone: (item.tone || 'serieux') as Tone
          },
          createdAt: item.createdAt
        };
      }
      // Si l'item a déjà la nouvelle structure
      return item;
    });
  };

  const getToneEmoji = (tone: string) => {
    switch (tone) {
      case 'serieux': return '😐';
      case 'drôle': return '😄';
      case 'surrealiste': return '🤪';
      case 'limite': return '😱';
      default: return '😐';
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + (isTablet ? 20 : 15) }]}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={isTablet ? 32 : 24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📚 Historique</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshHistory} disabled={refreshing}>
              <Ionicons name="refresh" size={isTablet ? 28 : 20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
              <Ionicons name="trash-outline" size={isTablet ? 28 : 20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={[
                  styles.filterButton,
                  selectedFilter === category.key && styles.selectedFilter
                ]}
                onPress={() => handleFilterChange(category.key as ExcuseCategory | 'all' | 'favorites')}
              >
                <Text style={styles.filterEmoji}>{category.emoji}</Text>
                <Text style={[
                  styles.filterText,
                  selectedFilter === category.key && styles.selectedFilterText
                ]}>
                  {category.label.split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filteredHistory.length}</Text>
            <Text style={styles.statLabel}>Excuses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        {/* History List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Chargement de l'historique...</Text>
          </View>
        ) : filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={isTablet ? 80 : 64} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.emptyText}>
              {selectedFilter === 'favorites' 
                ? 'Aucune excuse en favoris' 
                : selectedFilter === 'all' 
                  ? 'Aucune excuse dans l\'historique' 
                  : `Aucune excuse pour ${categories.find(c => c.key === selectedFilter)?.label.split(' ')[1]}`
              }
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {filteredHistory.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                      <View style={[styles.credibilityBadge, { backgroundColor: getCredibilityColor(item.filters.credibility) }]}>
                        <Text style={styles.credibilityText}>{item.filters.credibility}</Text>
                      </View>
                      <Text style={styles.toneText}>{getToneEmoji(item.filters.tone)} {item.filters.tone}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => shareExcuse(item.excuse)}
                    >
                      <Ionicons name="share-outline" size={isTablet ? 26 : 20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleFavorite(item.id)}
                    >
                      <Ionicons
                        name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                        size={isTablet ? 26 : 20}
                        color={favorites.includes(item.id) ? "#FF6B6B" : "white"}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => reportExcuse(item.excuse, item.filters.category, item.filters.credibility, item.filters.tone)}
                    >
                      <Ionicons name="flag-outline" size={isTablet ? 26 : 20} color="#FF5722" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteExcuse(item.id)}
                    >
                      <Ionicons name="trash-outline" size={isTablet ? 26 : 20} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.excuseText}>"{item.excuse}"</Text>
              </View>
            ))}
          </View>
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
  headerTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: isTablet ? 15 : 10,
  },
  refreshButton: {
    padding: isTablet ? 12 : 8,
  },
  clearButton: {
    padding: isTablet ? 12 : 8,
  },
  filtersContainer: {
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 30 : 20,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    alignItems: 'center',
    padding: isTablet ? 18 : 12,
    marginRight: isTablet ? 18 : 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: isTablet ? 16 : 12,
    minWidth: isTablet ? 90 : 70,
  },
  selectedFilter: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  filterEmoji: {
    fontSize: isTablet ? 28 : 20,
    marginBottom: isTablet ? 6 : 4,
  },
  filterText: {
    fontSize: isTablet ? 14 : 11,
    color: 'white',
    fontWeight: '600',
  },
  selectedFilterText: {
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 30 : 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 25 : 15,
    minWidth: isTablet ? 120 : 80,
  },
  statNumber: {
    fontSize: isTablet ? 32 : 24,
    fontWeight: 'bold',
    color: 'gold',
  },
  statLabel: {
    fontSize: isTablet ? 16 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: isTablet ? 8 : 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: 'white',
    marginTop: isTablet ? 15 : 10,
    fontSize: isTablet ? 20 : 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 20 : 16,
    textAlign: 'center',
    marginTop: isTablet ? 15 : 10,
  },
  historyList: {
    paddingHorizontal: isTablet ? 40 : 20,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isTablet ? 20 : 15,
    padding: isTablet ? 25 : 15,
    marginBottom: isTablet ? 20 : 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isTablet ? 15 : 10,
  },
  cardMeta: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isTablet ? 8 : 5,
  },
  credibilityBadge: {
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
    borderRadius: isTablet ? 12 : 8,
    marginRight: isTablet ? 15 : 10,
  },
  credibilityText: {
    fontSize: isTablet ? 14 : 10,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'capitalize',
  },
  toneText: {
    fontSize: isTablet ? 16 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dateText: {
    fontSize: isTablet ? 14 : 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  favoriteButton: {
    padding: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: isTablet ? 12 : 8,
  },
  actionButton: {
    padding: isTablet ? 10 : 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isTablet ? 12 : 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  excuseText: {
    fontSize: isTablet ? 20 : 16,
    color: 'white',
    fontStyle: 'italic',
    lineHeight: isTablet ? 28 : 22,
  },
  bottomSpacing: {
    height: 50,
  },
}); 