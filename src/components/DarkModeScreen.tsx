import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface DarkModeScreenProps {
  onGoBack: () => void;
}

export const DarkModeScreen: React.FC<DarkModeScreenProps> = ({ onGoBack }) => {
  const { currentTheme, themeColors, settings, updateTheme, isThemeInitialized } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const insets = useSafeAreaInsets();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];

  const themes = [
    {
      id: 'auto',
      name: 'Automatique',
      description: 'Suit les paramètres système',
      icon: 'phone-portrait-outline',
      gradient: ['#667eea', '#764ba2']
    },
    {
      id: 'light',
      name: 'Clair',
      description: 'Thème clair par défaut',
      icon: 'sunny-outline',
      gradient: ['#74b9ff', '#0984e3']
    },
    {
      id: 'dark',
      name: 'Sombre',
      description: 'Thème sombre élégant',
      icon: 'moon-outline',
      gradient: ['#2d3436', '#636e72']
    },
    {
      id: 'purple',
      name: 'Violet',
      description: 'Thème violet mystérieux',
      icon: 'color-palette-outline',
      gradient: ['#a29bfe', '#6c5ce7']
    },
    {
      id: 'green',
      name: 'Vert',
      description: 'Thème vert nature',
      icon: 'leaf-outline',
      gradient: ['#00b894', '#00a085']
    }
  ];

  const handleThemeChange = async (themeId: string) => {
    try {
      await updateTheme(themeId);
      setSelectedTheme(themeId);
      
      Alert.alert(
        'Thème changé',
        `Le thème "${themes.find(t => t.id === themeId)?.name}" a été appliqué !`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de changer le thème');
    }
  };

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌙 Mode sombre</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisir un thème</Text>
          
          <View style={styles.themesGrid}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[styles.themeCard, selectedTheme === theme.id && styles.selectedThemeCard]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <LinearGradient
                   colors={theme.gradient as [string, string]}
                   style={styles.themeGradient}
                 >
                  <Ionicons name={theme.icon as any} size={32} color="white" />
                  <Text style={styles.themeName}>{theme.name}</Text>
                  {selectedTheme === theme.id && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={24} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
    padding: 20,
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
  },
  toggleContainer: {
    gap: 15,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleText: {
    marginLeft: 15,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  toggleDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedThemeCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  themeGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  themeDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  previewSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bottomSpacing: {
    height: 50,
  },
}); 