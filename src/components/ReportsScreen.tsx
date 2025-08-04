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
import { reportService, ReportData } from '../services/reportService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface ReportsScreenProps {
  onGoBack: () => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ onGoBack }) => {
  const { user } = useAuth();
  const { themeColors, isThemeInitialized } = useTheme();
  const insets = useSafeAreaInsets();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userReports = await reportService.getUserReports(user.id);
      setReports(userReports);
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
      Alert.alert('Erreur', 'Impossible de charger vos signalements');
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  useEffect(() => {
    loadReports();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'reviewed': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'reviewed': return 'Examiné';
      case 'resolved': return 'Résolu';
      default: return 'En attente';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'reviewed': return 'eye-outline';
      case 'resolved': return 'checkmark-circle-outline';
      default: return 'time-outline';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'retard': return '⏰';
      case 'ghost': return '👻';
      case 'devoir': return '📚';
      case 'travail': return '💼';
      case 'rendez-vous': return '🤝';
      case 'autre': return '❓';
      default: return '❓';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'realiste': return '#4CAF50';
      case 'credule': return '#FF9800';
      case 'mytho': return '#F44336';
      default: return '#4CAF50';
    }
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
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🚩 Mes Signalements</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.status === 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>Résolus</Text>
          </View>
        </View>

        {/* Reports List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Chargement des signalements...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={isTablet ? 80 : 64} color="rgba(255, 255, 255, 0.5)" />
            <Text style={styles.emptyText}>Aucun signalement pour le moment</Text>
            <Text style={styles.emptySubtext}>
              Vos signalements d'excuses inappropriées apparaîtront ici
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {reports.map((report, index) => (
              <View key={index} style={styles.reportCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardMeta}>
                    <View style={styles.metaRow}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                        <Ionicons 
                          name={getStatusIcon(report.status) as any} 
                          size={isTablet ? 20 : 16} 
                          color="white" 
                        />
                        <Text style={styles.statusText}>{getStatusText(report.status)}</Text>
                      </View>
                      <Text style={styles.dateText}>{formatDate(report.reportedAt)}</Text>
                    </View>
                    <View style={styles.filtersRow}>
                      <View style={styles.filterItem}>
                        <Text style={styles.filterEmoji}>{getCategoryEmoji(report.category)}</Text>
                        <Text style={styles.filterText}>{report.category}</Text>
                      </View>
                      <View style={[styles.filterItem, { backgroundColor: getCredibilityColor(report.credibility) }]}>
                        <Text style={styles.filterText}>{report.credibility}</Text>
                      </View>
                      <View style={styles.filterItem}>
                        <Text style={styles.filterEmoji}>{getToneEmoji(report.tone)}</Text>
                        <Text style={styles.filterText}>{report.tone}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.excuseText}>"{report.excuse}"</Text>
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
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: isTablet ? 40 : 20,
    marginBottom: isTablet ? 30 : 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: isTablet ? 20 : 15,
    borderRadius: isTablet ? 16 : 12,
    alignItems: 'center',
    minWidth: isTablet ? 100 : 80,
  },
  statNumber: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: isTablet ? 5 : 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 60,
  },
  loadingText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    marginTop: isTablet ? 20 : 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isTablet ? 100 : 60,
  },
  emptyText: {
    color: 'white',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '600',
    marginTop: isTablet ? 20 : 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: isTablet ? 16 : 14,
    marginTop: isTablet ? 10 : 8,
    textAlign: 'center',
    paddingHorizontal: isTablet ? 40 : 20,
  },
  reportsList: {
    paddingHorizontal: isTablet ? 40 : 20,
  },
  reportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: isTablet ? 25 : 20,
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
  },
  cardHeader: {
    marginBottom: isTablet ? 15 : 12,
  },
  cardMeta: {
    gap: isTablet ? 12 : 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isTablet ? 12 : 8,
    paddingVertical: isTablet ? 6 : 4,
    borderRadius: isTablet ? 12 : 8,
    gap: isTablet ? 6 : 4,
  },
  statusText: {
    color: 'white',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },
  dateText: {
    color: '#666',
    fontSize: isTablet ? 14 : 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: isTablet ? 12 : 8,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: isTablet ? 10 : 6,
    paddingVertical: isTablet ? 4 : 2,
    borderRadius: isTablet ? 8 : 6,
    gap: isTablet ? 4 : 2,
  },
  filterEmoji: {
    fontSize: isTablet ? 14 : 12,
  },
  filterText: {
    color: '#333',
    fontSize: isTablet ? 12 : 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  excuseText: {
    fontSize: isTablet ? 18 : 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: isTablet ? 24 : 20,
  },
  bottomSpacing: {
    height: 50,
  },
}); 