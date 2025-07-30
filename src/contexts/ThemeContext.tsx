import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { settingsService, UserSettings, DEFAULT_SETTINGS } from '../services/settingsService';

export interface ThemeColors {
  primary: string[];
  secondary: string[];
  background: string[];
  card: string;
  text: string;
  textSecondary: string;
}

export const THEMES: { [key: string]: ThemeColors } = {
  auto: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#74b9ff', '#0984e3'],
    background: ['#667eea', '#764ba2'],
    card: 'rgba(255, 255, 255, 0.1)',
    text: 'white',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  light: {
    primary: ['#74b9ff', '#0984e3'],
    secondary: ['#667eea', '#764ba2'],
    background: ['#74b9ff', '#0984e3'],
    card: 'rgba(255, 255, 255, 0.1)',
    text: 'white',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  dark: {
    primary: ['#2d3436', '#636e72'],
    secondary: ['#667eea', '#764ba2'],
    background: ['#2d3436', '#636e72'],
    card: 'rgba(255, 255, 255, 0.1)',
    text: 'white',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  purple: {
    primary: ['#a29bfe', '#6c5ce7'],
    secondary: ['#667eea', '#764ba2'],
    background: ['#a29bfe', '#6c5ce7'],
    card: 'rgba(255, 255, 255, 0.1)',
    text: 'white',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  },
  green: {
    primary: ['#00b894', '#00a085'],
    secondary: ['#667eea', '#764ba2'],
    background: ['#00b894', '#00a085'],
    card: 'rgba(255, 255, 255, 0.1)',
    text: 'white',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  }
};

interface ThemeContextType {
  currentTheme: string;
  themeColors: ThemeColors;
  settings: UserSettings;
  isLoading: boolean;
  isThemeInitialized: boolean;
  updateTheme: (theme: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [currentTheme, setCurrentTheme] = useState<string>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  const themeColors = THEMES[currentTheme] || THEMES.auto;

  // Charger le thème depuis AsyncStorage au démarrage
  const loadLocalTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('user_theme');
      if (savedTheme && savedTheme !== currentTheme) {
        setCurrentTheme(savedTheme);
      }
      setIsThemeInitialized(true);
    } catch (error) {
      console.error('Erreur lors du chargement du thème local:', error);
      setIsThemeInitialized(true);
    }
  };

  const loadSettings = async () => {
    if (!user?.id) {
      return;
    }

    try {
      const userSettings = await settingsService.getUserSettings(user.id);
      setSettings(userSettings);
      
      // Synchroniser le thème local avec celui de Firestore
      if (userSettings.theme !== currentTheme) {
        await AsyncStorage.setItem('user_theme', userSettings.theme);
        setCurrentTheme(userSettings.theme);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

  const updateTheme = async (theme: string) => {
    try {
      // Sauvegarder immédiatement dans AsyncStorage pour éviter le flash
      await AsyncStorage.setItem('user_theme', theme);
      setCurrentTheme(theme);
      
      // Mettre à jour dans Firestore si l'utilisateur est connecté
      if (user?.id) {
        await settingsService.updateSetting(user.id, 'theme', theme);
        setSettings(prev => ({ ...prev, theme }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du thème:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      // Mettre à jour le thème localement si nécessaire
      if (newSettings.theme) {
        await AsyncStorage.setItem('user_theme', newSettings.theme);
        setCurrentTheme(newSettings.theme);
      }
      
      // Mettre à jour dans Firestore si l'utilisateur est connecté
      if (user?.id) {
        await settingsService.updateUserSettings(user.id, newSettings);
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
    }
  };

  useEffect(() => {
    const initializeTheme = async () => {
      // Charger d'abord le thème local pour éviter le flash
      await loadLocalTheme();
      
      if (user?.id) {
        // Ensuite charger les paramètres depuis Firestore
        await loadSettings();
      } else {
        // Si pas d'utilisateur, utiliser le thème par défaut
        if (!isThemeInitialized) {
          setCurrentTheme(DEFAULT_SETTINGS.theme);
        }
      }
      
      setIsLoading(false);
    };

    initializeTheme();
  }, [user?.id, isThemeInitialized]);

  const value: ThemeContextType = {
    currentTheme,
    themeColors,
    settings,
    updateTheme,
    updateSettings,
    loadSettings,
    isLoading,
    isThemeInitialized
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 