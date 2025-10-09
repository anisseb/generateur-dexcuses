#!/bin/bash

# Script d'aide pour ajouter le widget au projet Xcode
# Ce script prépare les fichiers et donne des instructions pour Xcode

echo "🎯 Installation du Widget iOS 'Générateur d'Excuses'"
echo "================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "GnrateurdExcusesIA" ]; then
    echo "❌ Erreur: Exécutez ce script depuis le dossier ios/"
    exit 1
fi

echo "📁 Vérification de la structure du projet..."

# Vérifier que les fichiers du widget existent
WIDGET_DIR="GnrateurdExcusesIA/ExcuseWidget"

if [ ! -d "$WIDGET_DIR" ]; then
    echo "❌ Erreur: Le dossier ExcuseWidget n'existe pas"
    exit 1
fi

# Lister les fichiers requis
REQUIRED_FILES=(
    "ExcuseWidget.swift"
    "ExcuseWidgetBundle.swift" 
    "ExcuseGenerator.swift"
    "ExcuseConfigurationIntent.swift"
    "ExcuseConfigurationIntent.intentdefinition"
    "Info.plist"
)

echo "✅ Vérification des fichiers du widget:"
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$WIDGET_DIR/$file" ]; then
        echo "  ✓ $file"
    else
        echo "  ❌ $file (manquant)"
    fi
done

echo ""
echo "📋 Étapes suivantes à effectuer dans Xcode:"
echo ""
echo "1️⃣ Ouvrir le projet:"
echo "   ➜ Ouvrez GnrateurdExcusesIA.xcworkspace dans Xcode"
echo ""
echo "2️⃣ Ajouter un nouveau target Widget Extension:"
echo "   ➜ Projet > + (en bas des targets) > Widget Extension"
echo "   ➜ Product Name: ExcuseWidget"
echo "   ➜ Include Configuration Intent: ✅ OUI"
echo ""
echo "3️⃣ Remplacer les fichiers générés par les nôtres:"
echo "   ➜ Supprimez les fichiers générés par Xcode"
echo "   ➜ Glissez nos fichiers du dossier ExcuseWidget/"
echo "   ➜ Assurez-vous qu'ils sont dans le target ExcuseWidget"
echo ""
echo "4️⃣ Compiler et tester:"
echo "   ➜ Sélectionnez le scheme 'ExcuseWidget'"
echo "   ➜ Compilez (Cmd+B)"
echo "   ➜ Lancez sur simulateur iOS 14+"
echo ""
echo "📖 Pour plus de détails, consultez:"
echo "   ➜ WIDGET_INSTALLATION_GUIDE.md"
echo "   ➜ ExcuseWidget/README.md"
echo ""

# Vérifier si Xcode est installé
if command -v xcodebuild &> /dev/null; then
    echo "✅ Xcode est installé ($(xcodebuild -version | head -1))"
    
    # Vérifier si le workspace existe
    if [ -f "GnrateurdExcusesIA.xcworkspace/contents.xcworkspacedata" ]; then
        echo "✅ Workspace détecté"
        echo ""
        echo "🚀 Prêt à ouvrir dans Xcode? (y/n)"
        read -r response
        if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
            echo "🔄 Ouverture dans Xcode..."
            open GnrateurdExcusesIA.xcworkspace
        fi
    else
        echo "⚠️  Workspace non trouvé, vérifiez votre configuration"
    fi
else
    echo "⚠️  Xcode n'est pas installé ou non accessible"
fi

echo ""
echo "🎉 Installation prête!"
echo "N'oubliez pas de suivre le guide d'installation pour les étapes Xcode."