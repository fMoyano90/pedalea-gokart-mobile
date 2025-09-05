import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, AuthResponse } from '@/lib/auth.service';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  // Inicializar el estado de autenticación al cargar la app
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const saveAuthData = async (authResponse: AuthResponse) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authResponse.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authResponse.refreshToken),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authResponse.user)),
      ]);

      setAuthState({
        isAuthenticated: true,
        user: authResponse.user,
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error guardando datos de autenticación:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Cerrar sesión en Google si estaba autenticado con Google
      if (authState.user?.googleId) {
        await authService.signOut();
      }

      // Limpiar AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      ]);

      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: Partial<AuthResponse['user']>) => {
    if (!authState.user) return;

    const newUser = { ...authState.user, ...updatedUser };
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
      setAuthState(prev => ({
        ...prev,
        user: newUser,
      }));
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  };

  const refreshAuthToken = async (): Promise<string | null> => {
    if (!authState.refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      // Aquí implementarías la llamada al backend para renovar el token
      // Por ahora retornamos null como placeholder
      console.log('Renovando token con:', authState.refreshToken);
      return null;
    } catch (error) {
      console.error('Error renovando token:', error);
      await logout(); // Si no se puede renovar, cerrar sesión
      throw error;
    }
  };

  return {
    ...authState,
    saveAuthData,
    logout,
    updateUser,
    refreshAuthToken,
    initializeAuth,
  };
}

export default useAuth;
