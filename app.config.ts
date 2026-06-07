// app.config.ts
import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "OLStar-Mobile-app",
  slug: "OLStar-Mobile-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: false,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.olstar.travelapp",
    deploymentTarget: "15.1",
    infoPlist: {
      NSPhotoLibraryUsageDescription: "Allow OLStar to access your photos to save booking receipts.",
      NSPhotoLibraryAddUsageDescription: "Allow OLStar to save booking receipts to your gallery."
    }
  },
  android: {
    package: "com.olstar.travelapp",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    edgeToEdgeEnabled: true,
    permissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE"
    ]
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-secure-store",
    // "expo-web-browser", // REMOVED - causing the error
    [
      "expo-media-library",
      {
        "photosPermission": "Allow OLStar to access your photos to save booking receipts.",
        "savePhotosPermission": "Allow OLStar to save booking receipts to your gallery.",
        "isAccessMediaLocationEnabled": true
      }
    ],
    "expo-localization",
    "expo-build-properties"
  ],
  extra: {
    eas: {
      projectId: "6c2579f1-cae5-4855-b7ec-bece42f01b0e"
    },
    geoapifyApiKey: process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY
  }
});