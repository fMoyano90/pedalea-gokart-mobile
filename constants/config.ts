import { Platform } from 'react-native';

// URL del backend. Puede sobreescribirse con EXPO_PUBLIC_API_URL.
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');


