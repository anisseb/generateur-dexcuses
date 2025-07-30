import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface InfoScreenProps {
  onGoBack: () => void;
  initialSection?: 'about' | 'legal' | 'privacy' | 'terms';
}

export const InfoScreen: React.FC<InfoScreenProps> = ({ onGoBack, initialSection = 'about' }) => {
  const { themeColors, isThemeInitialized } = useTheme();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const [activeSection, setActiveSection] = useState(initialSection);

  const sections = [
    {
      id: 'about',
      title: 'À propos',
      icon: 'information-circle-outline'
    },
    {
      id: 'legal',
      title: 'Mentions légales',
      icon: 'document-text-outline'
    },
    {
      id: 'privacy',
      title: 'Confidentialité',
      icon: 'shield-checkmark-outline'
    },
    {
      id: 'terms',
      title: 'Conditions',
      icon: 'list-outline'
    }
  ];

  const aboutContent = {
    title: 'Générateur d\'Excuses IA',
    version: 'Version 1.0.0',
    description: 'Une application amusante et innovante qui utilise l\'intelligence artificielle pour générer des excuses créatives et personnalisées.',
    features: [
      '🤖 Génération d\'excuses par IA',
      '📱 Interface intuitive et moderne',
      '💾 Historique personnel des excuses',
      '🎨 Personnalisation complète',
      '📊 Statistiques d\'utilisation',
      '🔒 Respect de la vie privée'
    ],
    team: 'Développé avec ❤️ par une équipe passionnée',
    contact: 'contact@academiaforkids.com'
  };

  const legalContent = {
    title: 'Mentions légales',
    sections: [
      {
        subtitle: 'Éditeur',
        content: 'Générateur d\'Excuses IA\nApplication mobile développée en France'
      },
      {
        subtitle: 'Hébergement',
        content: 'Firebase (Google)\nDonnées hébergées en Europe'
      },
      {
        subtitle: 'Technologies',
        content: 'React Native, Expo, Firebase, Mistral AI'
      },
      {
        subtitle: 'Droits d\'auteur',
        content: '© 2025 Tous droits réservés\nCette application est faite par l\'équipe de Academia For Kids'
      },
      {
        subtitle: 'Utilisation',
        content: 'Les excuses générées sont à des fins de divertissement uniquement et ne constituent pas des justifications valides.'
      }
    ]
  };

  const privacyContent = {
    title: 'Politique de confidentialité',
    sections: [
      {
        subtitle: 'Collecte de données',
        content: 'Nous collectons uniquement les données nécessaires au fonctionnement de l\'application : email, nom d\'affichage et historique des excuses.'
      },
      {
        subtitle: 'Stockage',
        content: 'Vos données sont stockées de manière sécurisée sur Firebase avec chiffrement en transit et au repos.'
      },
      {
        subtitle: 'Partage',
        content: 'Aucune donnée personnelle n\'est partagée avec des tiers. Les excuses générées restent privées.'
      },
      {
        subtitle: 'RGPD',
        content: 'Nous respectons le Règlement Général sur la Protection des Données (RGPD) et vos droits de suppression et de portabilité.'
      },
      {
        subtitle: 'Cookies',
        content: 'L\'application n\'utilise pas de cookies de tracking. Seuls les cookies techniques nécessaires sont utilisés.'
      }
    ]
  };

  const termsContent = {
    title: 'Conditions d\'utilisation',
    sections: [
      {
        subtitle: 'Acceptation',
        content: 'En utilisant cette application, vous acceptez les présentes conditions d\'utilisation dans leur intégralité.'
      },
      {
        subtitle: 'Utilisation autorisée',
        content: 'L\'application est destinée à un usage personnel et de divertissement. Toute utilisation commerciale est interdite.'
      },
      {
        subtitle: 'Responsabilité',
        content: 'L\'utilisateur est seul responsable de l\'utilisation des excuses générées. L\'application ne peut être tenue responsable des conséquences.'
      },
      {
        subtitle: 'Disponibilité',
        content: 'Nous nous efforçons de maintenir l\'application disponible 24h/24, mais ne garantissons pas une disponibilité continue.'
      },
      {
        subtitle: 'Modifications',
        content: 'Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements.'
      }
    ]
  };

  const getContent = () => {
    switch (activeSection) {
      case 'about':
        return aboutContent;
      case 'legal':
        return legalContent;
      case 'privacy':
        return privacyContent;
      case 'terms':
        return termsContent;
      default:
        return aboutContent;
    }
  };

  const currentContent = getContent();

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
          <Text style={styles.headerTitle}>ℹ️ Informations</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[
                  styles.tab,
                  activeSection === section.id && styles.activeTab
                ]}
                onPress={() => setActiveSection(section.id as any)}
              >
                <Ionicons 
                  name={section.icon as any} 
                  size={20} 
                  color={activeSection === section.id ? '#667eea' : 'white'} 
                />
                <Text style={[
                  styles.tabText,
                  activeSection === section.id && styles.activeTabText
                ]}>
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>{currentContent.title}</Text>
          
          {activeSection === 'about' && (
            <View style={styles.aboutContent}>
              <Text style={styles.versionText}>{(currentContent as any).version}</Text>
              <Text style={styles.descriptionText}>{(currentContent as any).description}</Text>
              
              <Text style={styles.featuresTitle}>Fonctionnalités principales :</Text>
              {(currentContent as any).features.map((feature: string, index: number) => (
                <Text key={index} style={styles.featureItem}>{feature}</Text>
              ))}
              
              <Text style={styles.teamText}>{(currentContent as any).team}</Text>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={() => Linking.openURL(`mailto:${(currentContent as any).contact}`)}
              >
                <Ionicons name="mail-outline" size={20} color="white" />
                <Text style={styles.contactButtonText}>Nous contacter</Text>
              </TouchableOpacity>
            </View>
          )}

          {(activeSection === 'legal' || activeSection === 'privacy' || activeSection === 'terms') && (
            <View style={styles.legalContent}>
              {(currentContent as any).sections.map((section: any, index: number) => (
                <View key={index} style={styles.legalSection}>
                  <Text style={styles.legalSubtitle}>{section.subtitle}</Text>
                  <Text style={styles.legalText}>{section.content}</Text>
                </View>
              ))}
            </View>
          )}
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
  tabsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#667eea',
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  aboutContent: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  featureItem: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  teamText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  legalContent: {
    gap: 20,
  },
  legalSection: {
    marginBottom: 20,
  },
  legalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  legalText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 50,
  },
}); 