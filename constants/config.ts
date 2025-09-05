import { Platform } from 'react-native';

// URL del backend. Puede sobreescribirse con EXPO_PUBLIC_API_URL.
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3030' : 'http://localhost:3030');

// Google OAuth Configuration
export const GOOGLE_CLIENT_IDS = {
  // Reemplaza estos valores con tus Client IDs reales de Google Cloud Console
  WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_WEB_CLIENT_ID.googleusercontent.com',
  ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'YOUR_ANDROID_CLIENT_ID.googleusercontent.com',
  IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'YOUR_IOS_CLIENT_ID.googleusercontent.com',
};


