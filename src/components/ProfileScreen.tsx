import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface ProfileScreenProps {
  onGoBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onGoBack }) => {
  const { user } = useAuth();
  const { themeColors, isThemeInitialized } = useTheme();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mettre à jour le nom d'affichage quand l'utilisateur change
  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user?.displayName]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Erreur', 'Le nom d\'affichage ne peut pas être vide');
      return;
    }

    setLoading(true);
    try {
      if (user?.id) {
        await authService.updateUserDisplayName(user.id, displayName.trim());
        Alert.alert('Succès', 'Profil mis à jour avec succès !');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

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
          <Text style={styles.headerTitle}>👤 Profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{displayName || user?.email?.split('@')[0] || 'Utilisateur'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom d'affichage</Text>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Votre nom d'affichage"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              ) : (
                <View style={styles.displayValue}>
                  <Text style={styles.displayText}>{displayName || 'Non défini'}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.displayValue}>
                <Text style={styles.displayText}>{user?.email}</Text>
                <Text style={styles.readOnlyText}>Non modifiable</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Statut</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: user?.isPremium ? '#FFD700' : '#4CAF50' }]}>
                  <Text style={styles.statusText}>
                    {user?.isPremium ? 'Premium' : 'Gratuit'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Stats */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Statistiques du compte</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Jours d'utilisation</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="star-outline" size={24} color="white" />
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Excuses favorites</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            
            {isEditing ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]} 
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="checkmark-outline" size={20} color="white" />
                  )}
                  <Text style={styles.actionButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]} 
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Ionicons name="close-outline" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.editButtonText}>Modifier le profil</Text>
              </TouchableOpacity>
            )}
          </View>
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
    padding: isTablet ? 40 : 20,
    paddingTop: isTablet ? 80 : 60,
  },
  backButton: {
    padding: isTablet ? 12 : 8,
  },
  headerTitle: {
    fontSize: isTablet ? 28 : 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 60,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: isTablet ? 40 : 30,
  },
  avatar: {
    width: isTablet ? 120 : 100,
    height: isTablet ? 120 : 100,
    borderRadius: isTablet ? 60 : 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isTablet ? 20 : 15,
  },
  avatarText: {
    fontSize: isTablet ? 48 : 40,
    fontWeight: 'bold',
    color: 'white',
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
  formContainer: {
    paddingHorizontal: isTablet ? 40 : 20,
  },
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isTablet ? 20 : 15,
    padding: isTablet ? 30 : 20,
    marginBottom: isTablet ? 30 : 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 25 : 20,
  },
  inputGroup: {
    marginBottom: isTablet ? 30 : 20,
  },
  inputLabel: {
    fontSize: isTablet ? 18 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: isTablet ? 12 : 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: isTablet ? 15 : 10,
    padding: isTablet ? 20 : 15,
    fontSize: isTablet ? 18 : 16,
    color: 'white',
  },
  displayValue: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
  },
  displayText: {
    fontSize: 16,
    color: 'white',
  },
  readOnlyText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 50,
  },
}); 