# Guide d'Installation du Widget iOS "Générateur d'Excuses"

Ce guide vous explique comment ajouter le widget iOS à votre projet Xcode existant.

## 📋 Prérequis

- Xcode 15.0 ou supérieur
- iOS 14.0 ou supérieur pour les widgets
- Projet iOS configuré avec SwiftUI

## 🚀 Étapes d'Installation

### 1. Ajouter un nouveau Target Widget Extension

1. Ouvrez votre projet dans Xcode : `ios/GnrateurdExcusesIA.xcworkspace`
2. Cliquez sur le projet dans le navigateur (en haut)
3. Cliquez sur le bouton `+` en bas de la liste des targets
4. Sélectionnez **"Widget Extension"**
5. Configurez le widget :
   - **Product Name**: `ExcuseWidget`
   - **Bundle Identifier**: `votre.bundle.id.ExcuseWidget`
   - **Language**: Swift
   - **Use Core Data**: Non
   - **Include Configuration Intent**: ✅ OUI (important)

### 2. Remplacer les fichiers générés

Après la création du target, remplacez les fichiers générés par ceux que nous avons créés :

1. Supprimez les fichiers générés dans le dossier `ExcuseWidget/`
2. Copiez nos fichiers créés :
   - `ExcuseWidget.swift`
   - `ExcuseWidgetBundle.swift`
   - `ExcuseGenerator.swift`
   - `ExcuseConfigurationIntent.swift`
   - `ExcuseConfigurationIntent.intentdefinition`
   - `Info.plist`

### 3. Ajouter les fichiers au Target

1. Sélectionnez tous les fichiers Swift dans le dossier `ExcuseWidget/`
2. Dans l'inspecteur de fichier (panneau de droite), cochez **"ExcuseWidget"** dans "Target Membership"

### 4. Configurer les Capabilities

1. Sélectionnez le target **ExcuseWidget**
2. Allez dans l'onglet **"Signing & Capabilities"**
3. Ajoutez la capability : **"App Groups"** (si vous voulez partager des données avec l'app principale)

### 5. Mettre à jour le schéma de build

1. Allez dans **Product > Scheme > Edit Scheme**
2. Assurez-vous que le target `ExcuseWidget` est inclus dans le build

## 🔧 Configuration des Paramètres

### Intent Configuration

Le widget utilise un système d'Intent pour permettre aux utilisateurs de configurer :

- **Catégorie** : Retard, Ghost, Devoir, Travail, Rendez-vous, Autre
- **Crédibilité** : Réaliste, Crédule, Mytho
- **Ton** : Sérieux, Drôle, Surréaliste, Limite

### Tailles de Widget Supportées

- **Small** (2x2) : Excuse simple avec paramètres visibles
- **Medium** (4x2) : Excuse complète avec plus de détails
- **Large** (4x4) : Excuse enrichie avec contexte supplémentaire

## 📱 Utilisation

### Pour l'utilisateur final :

1. **Ajouter le widget** :
   - Maintenez appuyé sur l'écran d'accueil
   - Tapez le bouton `+` en haut à gauche
   - Recherchez "Générateur d'Excuses"
   - Sélectionnez la taille souhaitée

2. **Configurer le widget** :
   - Maintenez appuyé sur le widget ajouté
   - Sélectionnez "Modifier le widget"
   - Choisissez vos paramètres préférés :
     - Catégorie d'excuse
     - Niveau de crédibilité
     - Ton souhaité

3. **Utiliser le widget** :
   - Le widget se met à jour automatiquement toutes les heures
   - Tapez sur le widget pour ouvrir l'application principale
   - Une nouvelle excuse est générée selon vos paramètres

## 🎨 Personnalisation

### Modifier les excuses

Pour ajouter de nouvelles excuses, éditez le fichier `ExcuseGenerator.swift` :

```swift
private let excuseTemplates: [String: [String: [String: [String]]]] = [
    "nouvelle_categorie": [
        "realiste": [
            "serieux": [
                "Votre nouvelle excuse sérieuse et réaliste",
                // Ajoutez plus d'excuses...
            ]
        ]
    ]
]
```

### Modifier l'apparence

Éditez le fichier `ExcuseWidget.swift` dans la struct `ExcuseWidgetEntryView` pour personnaliser :

- Couleurs
- Polices
- Disposition
- Animations

### Ajouter de nouvelles catégories

1. Modifiez l'enum `ExcuseCategory` dans `ExcuseConfigurationIntent.swift`
2. Mettez à jour le fichier `ExcuseConfigurationIntent.intentdefinition`
3. Ajoutez les nouvelles excuses dans `ExcuseGenerator.swift`

## 🐛 Dépannage

### Problèmes courants :

1. **Le widget ne s'affiche pas** :
   - Vérifiez que le target est bien inclus dans le build
   - Assurez-vous que tous les fichiers sont dans le bon target

2. **Erreurs de compilation** :
   - Vérifiez que le fichier `.intentdefinition` est bien ajouté au target
   - Nettoyez le build (`Cmd+Shift+K`) et rebuilder

3. **Configuration ne fonctionne pas** :
   - Vérifiez que "Include Configuration Intent" était coché lors de la création
   - Assurez-vous que les enums correspondent entre les fichiers

4. **Excuses ne se génèrent pas** :
   - Vérifiez la logique dans `ExcuseGenerator.swift`
   - Testez les différentes combinaisons de paramètres

## 📊 Test et Validation

### Tester le widget :

1. **Simulateur** :
   - Utilisez le simulateur iOS 14+ 
   - Ajoutez le widget à l'écran d'accueil
   - Testez toutes les tailles et configurations

2. **Device physique** :
   - Installez sur un appareil réel
   - Testez les mises à jour automatiques
   - Vérifiez les performances

### Validation des fonctionnalités :

- ✅ Génération d'excuses selon les paramètres
- ✅ Interface responsive sur toutes les tailles
- ✅ Configuration utilisateur fonctionnelle
- ✅ Mises à jour automatiques
- ✅ Integration avec l'app principale

## 🚀 Déploiement

Pour publier sur l'App Store avec le widget :

1. Assurez-vous que le widget est inclus dans votre App Store Connect bundle
2. Testez avec TestFlight
3. Soumettez pour review en mentionnant les fonctionnalités du widget

## 📝 Notes Techniques

- Le widget utilise `TimelineProvider` pour les mises à jour automatiques
- Les excuses sont générées localement (pas d'appel réseau requis)
- Compatible avec le mode sombre automatiquement
- Optimisé pour les performances et la batterie

## 🎯 Fonctionnalités Futures

Suggestions d'améliorations :

- Synchronisation avec l'historique de l'app principale
- Widgets interactifs (iOS 17+)
- Thèmes personnalisables
- Excuses basées sur la localisation ou l'heure