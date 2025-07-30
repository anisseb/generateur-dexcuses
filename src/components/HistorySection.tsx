import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { historyService } from '../services/historyService';
import { useAuth } from '../contexts/AuthContext';
import { getRandomSubtitle } from '../utils/randomUtils';
import { ExcuseHistoryItem } from '../types';

interface HistorySectionProps {
  onRefresh?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onRefresh }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ExcuseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false); // Plié par défaut
  const [subtitle, setSubtitle] = useState<string>(getRandomSubtitle());

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id]);

  // Recharger l'historique quand le composant est remonté (nouvelle clé)
  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, []);

  // Changer le sous-titre toutes les 45 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitle(getRandomSubtitle());
    }, 45000); // 45 secondes

    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userHistory = await historyService.getUserHistory(user.id);
      setHistory(userHistory);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = async () => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      const userHistory = await historyService.getUserHistory(user.id);
      setHistory(userHistory);
      setSubtitle(getRandomSubtitle()); // Changer le sous-titre lors du rafraîchissement
      onRefresh?.();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const shareExcuse = async (excuse: string) => {
    try {
      await Share.share({
        message: excuse,
        title: 'Mon excuse géniale',
      });
    } catch (error) {
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
              await loadHistory();
              onRefresh?.();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'excuse');
            }
          }
        }
      ]
    );
  };

  const clearHistory = async () => {
    if (!user?.id) return;

    Alert.alert(
      'Effacer l\'historique',
      'Êtes-vous sûr de vouloir effacer tout votre historique ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              await historyService.clearUserHistory(user.id);
              setHistory([]);
              onRefresh?.();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effacer l\'historique');
            }
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      retard: '⏰',
      ghost: '👻',
      devoir: '📚',
      travail: '💼',
      'rendez-vous': '🤝',
      autre: '❓'
    };
    return emojis[category] || '❓';
  };

  const getCredibilityColor = (credibility: string) => {
    const colors: { [key: string]: string } = {
      realiste: '#4CAF50',
      credule: '#FF9800',
      mytho: '#F44336'
    };
    return colors[credibility] || '#666';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="white" />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>📚 Aucun historique</Text>
        <Text style={styles.emptyText}>
          Vos excuses générées apparaîtront ici.
        </Text>
      </View>
    );
  }

  const displayedHistory = expanded ? history : history.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>📚 Historique ({history.length})</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshHistory}
            disabled={refreshing}
          >
            <Ionicons 
              name={refreshing ? "refresh" : "refresh-outline"} 
              size={20} 
              color={refreshing ? "#4CAF50" : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={clearHistory}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && (
        <ScrollView 
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {displayedHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View style={styles.excuseContent}>
              <Text style={styles.excuseText}>"{item.excuse}"</Text>
              <View style={styles.excuseMeta}>
                <View style={styles.filters}>
                  <Text style={styles.filterItem}>
                    {getCategoryEmoji(item.filters.category)} {item.filters.category}
                  </Text>
                  <View style={[styles.credibilityBadge, { backgroundColor: getCredibilityColor(item.filters.credibility) }]}>
                    <Text style={styles.credibilityText}>{item.filters.credibility}</Text>
                  </View>
                  <Text style={styles.filterItem}>🎭 {item.filters.tone}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => shareExcuse(item.excuse)}
              >
                <Ionicons name="share-outline" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteExcuse(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </ScrollView>
      )}

      {history.length > 0 && (
        <TouchableOpacity 
          style={styles.showMoreButton}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.showMoreText}>
            {expanded ? 'Masquer l\'historique' : `Voir l'historique (${history.length} excuses)`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
    marginTop: 25,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: { 
    color: 'white',
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerContent: {
    flex: 1,
    marginRight: 10,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontStyle: 'italic',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 5,
    marginRight: 10,
  },
  clearButton: {
    padding: 5,
    marginRight: 10,
  },
  expandButton: {
    padding: 5,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  excuseContent: {
    flex: 1,
    marginRight: 10,
  },
  excuseText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 22,
  },
  excuseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterItem: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  credibilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  credibilityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    textAlign: 'left',
  },
  actionButtons: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 8,
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  showMoreText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 