// Configuration des publicités Google Mobile Ads
// Copiez ce fichier vers ads.config.js et remplacez les IDs par vos vrais IDs

export const ADS_CONFIG = {
  // ID de l'application (remplacez par votre vrai ID)
  APP_ID: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx~wwwwwwwwww',
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx~wwwwwwwwww',
  },
  
  // ID de l'unité publicitaire pour les bannières
  BANNER_AD_UNIT_ID: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy',
  },
  
  // ID de l'unité publicitaire pour les publicités récompensées
  REWARDED_AD_UNIT_ID: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz',
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz',
  },
  
  // ID de l'unité publicitaire pour les publicités interstitielles
  INTERSTITIAL_AD_UNIT_ID: {
    android: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa',
    ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa',
  },
};

// Instructions pour obtenir vos IDs :
// 1. Créez un compte Google AdMob : https://admob.google.com/
// 2. Créez une nouvelle application
// 3. Créez des unités publicitaires pour chaque type de publicité
// 4. Remplacez les IDs dans ce fichier
// 5. Renommez ce fichier en ads.config.js
// 6. Importez la configuration dans adService.ts 