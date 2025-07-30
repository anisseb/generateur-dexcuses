# 🤖 Générateur d'Excuses IA

Une application mobile React Native qui génère des excuses crédibles, drôles et parfois surréalistes grâce à l'IA ! Parfait pour sauver votre réputation quand vous êtes en retard, que vous avez ghosté quelqu'un, ou que vous n'avez pas rendu vos devoirs.

## ✨ Fonctionnalités

### 🎯 Niveaux de crédibilité
- **Réaliste** : Des excuses plausibles et crédibles
- **Crédible** : Des excuses un peu plus créatives mais acceptables
- **Mytho** : Des excuses complètement délirantes et amusantes

### 🎭 Tons disponibles
- **Sérieux** : Pour les situations importantes
- **Drôle** : Pour dédramatiser la situation
- **Surréaliste** : Pour les excuses les plus créatives
- **Limite** : Pour les excuses vraiment audacieuses

### 📂 Catégories d'excuses
- ⏰ **Retard** : Pour les rendez-vous manqués
- 👻 **Ghost** : Pour expliquer vos disparitions
- 📚 **Devoir** : Pour les travaux non rendus
- 💼 **Travail** : Pour les absences professionnelles
- 🤝 **Rendez-vous** : Pour les rencontres ratées
- ❓ **Autre** : Pour toutes les autres situations

### 💰 Monétisation
- **Publicités non-intrusives** : Bannières publicitaires pour les utilisateurs gratuits
- **Mode Premium** : Suppression des publicités et fonctionnalités avancées

## 🚀 Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Un compte Firebase

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd generateur-dexcuses
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**
   - Créez un projet Firebase
   - Activez l'authentification par email/mot de passe
   - Créez une base de données Firestore
   - Remplacez les valeurs dans `src/config/firebase.ts` par vos propres clés

4. **Lancer l'application**
```bash
npm start
```

## 🔧 Configuration

### Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez l'authentification par email/mot de passe
4. Créez une base de données Firestore
5. Récupérez vos clés de configuration et remplacez-les dans `src/config/firebase.ts`
6. Configurez les règles Firestore (voir section "Règles Firestore" ci-dessous)

### Mistral AI (Optionnel mais recommandé)
1. Allez sur [Mistral Console](https://console.mistral.ai/)
2. Créez un compte et obtenez votre clé API
3. Créez un fichier `.env` à la racine du projet
4. Ajoutez votre clé API : `EXPO_PUBLIC_MISTRAL_API_KEY=votre_cle_api`

### Google Mobile Ads (Pour la monétisation)
1. Allez sur [Google AdMob](https://admob.google.com/)
2. Créez un compte et une nouvelle application
3. Créez des unités publicitaires (Banner, Rewarded, Interstitial)
4. Copiez le fichier `ads.example.js` vers `ads.config.js`
5. Remplacez les IDs par vos vrais IDs AdMob
6. Mettez à jour `app.json` avec votre App ID

### RevenueCat (Pour les achats in-app)
1. Allez sur [RevenueCat](https://app.revenuecat.com/)
2. Créez un compte et une nouvelle application
3. Configurez vos produits dans l'App Store Connect et Google Play Console
4. Créez des entités (entitlements) pour le premium
5. Copiez le fichier `env.example` vers `.env`
6. Remplacez les clés API par vos vraies clés RevenueCat

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Règles Firestore
Dans Firebase Console > Firestore Database > Règles, remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    match /excuses/{excuseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    match /premiumPacks/{packId} {
      allow read: if request.auth != null;
    }
  }
}
```

## 📱 Utilisation

1. **Créer un compte** ou se connecter
2. **Choisir une catégorie** d'excuse
3. **Sélectionner le niveau de crédibilité** souhaité
4. **Choisir le ton** de l'excuse
5. **Générer** votre excuse personnalisée
6. **Partager** l'excuse sur vos réseaux sociaux

## 💰 Monétisation

### Version gratuite
- Accès aux excuses de base
- Génération limitée par jour
- Publicités intégrées
- Persistance de connexion

### Version Premium (à venir)
- 50 excuses mythiques exclusives
- Personnalisation illimitée
- Pas de publicités
- Sauvegarde de vos excuses favorites
- Statistiques d'utilisation
- Synchronisation cloud

## 🛠️ Technologies utilisées

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **Firebase** pour l'authentification et la base de données
- **Mistral AI** pour la génération d'excuses intelligentes
- **Expo Linear Gradient** pour les effets visuels
- **React Native Paper** pour les composants UI
- **AsyncStorage** pour le cache local
- **Google Mobile Ads** pour la monétisation publicitaire
- **RevenueCat** pour la gestion des achats in-app

## 📁 Structure du projet

```
src/
├── components/          # Composants React Native
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── ExcuseGeneratorScreen.tsx
├── contexts/           # Contextes React
│   └── AuthContext.tsx
├── services/           # Services métier
│   ├── authService.ts
│   ├── excuseService.ts
│   ├── mistralExcuseService.ts
│   └── persistenceService.ts
├── types/              # Types TypeScript
│   └── index.ts
└── config/             # Configuration
    └── firebase.ts
```

## 🎨 Design

L'application utilise un design moderne avec :
- Dégradés colorés pour l'arrière-plan
- Animations fluides
- Interface intuitive et responsive
- Emojis pour une expérience ludique
- Cartes avec ombres pour la profondeur

## 🚀 Déploiement

### Pour Android
```bash
expo build:android
```

### Pour iOS
```bash
expo build:ios
```

### Pour le web
```bash
expo build:web
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Ajouter de nouvelles excuses
- Améliorer le design

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

- [x] Intégration d'une vraie IA (Mistral AI)
- [ ] Système de favoris
- [ ] Historique des excuses générées
- [ ] Mode hors ligne
- [ ] Notifications push
- [ ] Intégration avec les réseaux sociaux
- [ ] Système de badges et récompenses
- [ ] Mode sombre
- [ ] Support multilingue
- [ ] Personnalisation avancée des excuses
- [ ] Statistiques d'utilisation

## 📞 Support

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur GitHub ou à nous contacter.

---

**Développé avec ❤️ pour sauver votre réputation !** 🤖✨ 