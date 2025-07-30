import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { historyService } from '../services/historyService';
import { settingsService } from '../services/settingsService';

interface SupportScreenProps {
  onGoBack: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({ onGoBack }) => {
  const { themeColors, isThemeInitialized } = useTheme();
  
  const gradientColors = isThemeInitialized ? themeColors.background as [string, string] : ['#667eea', '#764ba2'] as [string, string];
  const { user, logout } = useAuth();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Comment fonctionne le générateur d'excuses ?",
      answer: "L'application utilise l'intelligence artificielle pour créer des excuses personnalisées selon vos critères : catégorie, niveau de crédibilité et ton. Il suffit de sélectionner vos préférences et de cliquer sur 'Générer' !"
    },
    {
      question: "Mes excuses sont-elles sauvegardées ?",
      answer: "Oui ! Toutes vos excuses générées sont automatiquement sauvegardées dans votre historique personnel. Vous pouvez les consulter, les partager ou les supprimer à tout moment."
    },
    {
      question: "Comment passer en mode Premium ?",
      answer: "Le mode Premium vous donne accès à 50 excuses mythiques et à la personnalisation illimitée. Cette fonctionnalité sera bientôt disponible dans l'application !"
    },
    {
      question: "L'application fonctionne-t-elle hors ligne ?",
      answer: "L'application fonctionne partiellement hors ligne. La génération d'excuses nécessite une connexion internet pour l'IA, mais vous pouvez consulter votre historique sans connexion."
    },
    {
      question: "Comment supprimer mon compte ?",
      answer: "Pour supprimer votre compte, contactez-nous directement via l'email de support. Nous traiterons votre demande dans les plus brefs délais."
    }
  ];

  const supportOptions = [
    {
      title: "Contact par email",
      subtitle: "Réponse sous 24h",
      icon: "mail-outline",
      action: () => Linking.openURL('mailto:contact@academiaforkids.com?subject=Support - Générateur d\'Excuses')
    },
    {
      title: "Signaler un bug",
      subtitle: "Nous aider à améliorer l'app",
      icon: "bug-outline",
      action: () => Linking.openURL('mailto:contact@academiaforkids.com?subject=Bug Report - Générateur d\'Excuses')
    },
    {
      title: "Suggestion",
      subtitle: "Proposer une fonctionnalité",
      icon: "bulb-outline",
      action: () => Linking.openURL('mailto:contact@academiaforkids.com?subject=Suggestion - Générateur d\'Excuses')
    }
  ];

  const quickHelp = [
    {
      title: "Problème de connexion",
      description: "Vérifiez votre connexion internet et redémarrez l'application",
      icon: "wifi-outline",
      action: null
    },
    {
      title: "L'app ne répond plus",
      description: "Fermez complètement l'application et relancez-la",
      icon: "refresh-outline",
      action: null
    },
    {
      title: "Mise à jour disponible",
      description: "Vérifiez les mises à jour dans votre store d'applications",
      icon: "arrow-up-circle-outline",
      action: null
    },
    {
      title: "Supprimer toutes mes données",
      description: "Supprime définitivement votre compte et toutes vos données",
      icon: "trash-outline",
      action: "deleteData"
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleDeleteAllData = async () => {
    if (!user?.id) return;

    Alert.alert(
      '⚠️ Suppression définitive',
      'Êtes-vous absolument sûr de vouloir supprimer définitivement votre compte et toutes vos données ?\n\nCette action est irréversible et supprimera :\n• Votre compte utilisateur\n• Tout votre historique d\'excuses\n• Tous vos paramètres\n• Toutes vos données personnelles',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'SUPPRIMER DÉFINITIVEMENT',
          style: 'destructive',
          onPress: async () => {
            try {
              // Confirmation finale
              Alert.alert(
                '🔴 Dernière confirmation',
                'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'OUI, SUPPRIMER TOUT',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Supprimer l'historique
                        await historyService.clearUserHistory(user.id);
                        
                        // Supprimer les paramètres (réinitialiser aux valeurs par défaut)
                        await settingsService.resetSettings(user.id);
                        
                        // Supprimer le compte utilisateur
                        await logout();
                        
                        Alert.alert(
                          '✅ Compte supprimé',
                          'Votre compte et toutes vos données ont été supprimés avec succès.',
                          [{ text: 'OK' }]
                        );
                      } catch (error) {
                        console.error('Erreur lors de la suppression:', error);
                        Alert.alert(
                          'Erreur',
                          'Une erreur est survenue lors de la suppression. Veuillez réessayer ou contacter le support.'
                        );
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Erreur lors de la confirmation:', error);
            }
          }
        }
      ]
    );
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
          <Text style={styles.headerTitle}>❓ Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Quick Help */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Aide rapide</Text>
          
          {quickHelp.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helpItem}
              onPress={item.action === 'deleteData' ? handleDeleteAllData : undefined}
              disabled={!item.action}
            >
              <Ionicons 
                name={item.icon as any} 
                size={24} 
                color={item.action === 'deleteData' ? '#F44336' : 'white'} 
              />
              <View style={styles.helpContent}>
                <Text style={[
                  styles.helpTitle,
                  item.action === 'deleteData' && styles.deleteTitle
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.helpDescription}>{item.description}</Text>
              </View>
              {item.action === 'deleteData' && (
                <Ionicons name="chevron-forward" size={20} color="#F44336" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Nous contacter</Text>
          
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactItem}
              onPress={option.action}
            >
              <Ionicons name={option.icon as any} size={24} color="white" />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Questions fréquentes</Text>
          
          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="white" 
                />
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Dernière mise à jour</Text>
              <Text style={styles.infoValue}>28/07/2025</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Taille</Text>
              <Text style={styles.infoValue}>~15 MB</Text>
            </View>
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  helpContent: {
    marginLeft: 15,
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  deleteTitle: {
    color: '#F44336',
  },
  helpDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactContent: {
    marginLeft: 15,
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  faqItem: {
    marginBottom: 15,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    lineHeight: 20,
    paddingLeft: 10,
  },
  infoContainer: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  bottomSpacing: {
    height: 50,
  },
}); 