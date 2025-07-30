import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768; // iPad et tablettes

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
    } catch (error: any) {
      Alert.alert('Erreur d\'inscription', error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>🤖</Text>
            <Text style={styles.appName}>Rejoignez l'aventure</Text>
            <Text style={styles.subtitle}>Créez votre compte pour commencer</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nom d'utilisateur (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Votre nom d'utilisateur"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="votre@email.com"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe *</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Votre mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirmer le mot de passe *</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmez votre mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={onSwitchToLogin}
              >
                <Text style={styles.switchText}>
                  Déjà un compte ? Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: isTablet ? 40 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height,
  },
  title: {
    fontSize: isTablet ? 120 : 80,
    marginBottom: isTablet ? 30 : 20,
  },
  appName: {
    fontSize: isTablet ? 42 : 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isTablet ? 15 : 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet ? 24 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: isTablet ? 60 : 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: isTablet ? 500 : 350,
  },
  inputContainer: {
    marginBottom: isTablet ? 30 : 20,
  },
  label: {
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: isTablet ? 12 : 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 20 : 15,
    fontSize: isTablet ? 18 : 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 20 : 15,
    alignItems: 'center',
    marginTop: isTablet ? 15 : 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: isTablet ? 22 : 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: isTablet ? 30 : 20,
    alignItems: 'center',
  },
  switchText: {
    color: 'white',
    fontSize: isTablet ? 18 : 16,
    textDecorationLine: 'underline',
  },
}); 