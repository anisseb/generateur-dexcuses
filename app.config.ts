import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
    name: "Générateur d'Excuses IA",
    slug: "generateur-dexcuses",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anisse3000.generateurdexcuses"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#fa6010"
      },
      package: "com.anisse3000.generateurdexcuses"
    },
    plugins: [
      "expo-font",
      [
        "expo-splash-screen",
        {
          "enableFullScreenImage_legacy": true,
          "resizeMode": "contain",
          "ios": {
            "backgroundColor": "#fa6010",
            "image": "./assets/logo.png"
          },
          "android": {
            "backgroundColor": "#fa6010",
            "image": "./assets/logo-android.png",
            "imageWidth": 195
          }
        }
      ],
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713",
          "iosAppId": "ca-app-pub-3940256099942544~1458002511"
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "706923c4-4d53-475e-b82c-0a8421ae7d88"
      }
    }
}); 