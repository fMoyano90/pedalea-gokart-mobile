import React from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/hooks/useAuth';
import { router } from 'expo-router';

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido a Pedalea Go Kart! 🏎️</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>
              Hola, {user.firstName || user.fullName || 'Piloto'}! 👋
            </Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.googleId && (
              <Text style={styles.googleInfo}>✅ Autenticado con Google</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={() => Alert.alert('Proximamente', 'Funcionalidad en desarrollo')}>
            <Text style={styles.buttonText}>Ver Carreras</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => Alert.alert('Proximamente', 'Funcionalidad en desarrollo')}>
            <Text style={styles.buttonText}>Mi Perfil</Text>
          </Pressable>

          <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Cerrar Sesión</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_WHITE,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BRAND_ASPHALT,
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_ASPHALT,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  googleInfo: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: BRAND_ORANGE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: BRAND_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    marginTop: 20,
  },
  logoutButtonText: {
    color: BRAND_WHITE,
  },
});
