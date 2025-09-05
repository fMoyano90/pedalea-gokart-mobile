import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  Alert,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/lib/hooks/useAuth';
import { apiFetch } from '@/lib/api';
import { authService } from '@/lib/auth.service';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    profilePhotoUrl?: string;
    googleId?: string;
  };
};

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { saveAuthData } = useAuth();

  const isFormValid = 
    formData.firstName.trim().length > 0 &&
    formData.lastName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  const updateFormData = (field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  async function handleEmailRegister() {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      };

      const response = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: registerData,
      });

      console.log('Registro exitoso:', response);
      await saveAuthData(response);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      router.replace('/');
    } catch (error: any) {
      console.error('Error en registro:', error);
      Alert.alert('Error de Registro', error.message || 'No se pudo crear la cuenta');
    }
    setIsLoading(false);
  }

  async function handleGoogleRegister() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authService.initializeGoogleSignIn();
      const response = await authService.signInWithGoogle();
      console.log('Registro con Google exitoso:', response);
      
      await saveAuthData(response);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Alert.alert('¡Registro exitoso!', 'Bienvenido a Pedalea Go Kart', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error: any) {
      console.error('Error en registro con Google:', error);
      Alert.alert('Error de Registro con Google', error.message || 'No se pudo crear la cuenta con Google');
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <Image
              source={require('@/assets/images/pedalea-logo.webp')}
              style={styles.brandLogo}
              contentFit="contain"
              accessible
              accessibilityLabel="Logo Pedalea Go Kart"
            />
            <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.title}>
              ¡Únete a la pista!
            </ThemedText>
            <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.subtitle}>
              Crea tu cuenta de piloto
            </ThemedText>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
                  Nombre
                </ThemedText>
                <TextInput
                  value={formData.firstName}
                  onChangeText={updateFormData('firstName')}
                  placeholder="Ej: Juan"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!isLoading}
                />
              </View>
              <View style={styles.nameField}>
                <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
                  Apellido
                </ThemedText>
                <TextInput
                  value={formData.lastName}
                  onChangeText={updateFormData('lastName')}
                  placeholder="Ej: Pérez"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                  style={styles.input}
                  editable={!isLoading}
                />
              </View>
            </View>

            <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
              Email
            </ThemedText>
            <TextInput
              value={formData.email}
              onChangeText={updateFormData('email')}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              editable={!isLoading}
            />

            <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
              Contraseña
            </ThemedText>
            <TextInput
              value={formData.password}
              onChangeText={updateFormData('password')}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
              editable={!isLoading}
            />

            <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
              Confirmar contraseña
            </ThemedText>
            <TextInput
              value={formData.confirmPassword}
              onChangeText={updateFormData('confirmPassword')}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={[
                styles.input,
                formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && styles.inputError
              ]}
              editable={!isLoading}
            />

            {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}

            <Pressable
              accessibilityRole="button"
              onPress={handleEmailRegister}
              disabled={!isFormValid || isLoading}
              style={({ pressed }) => [
                styles.registerButton,
                { opacity: (isFormValid && !isLoading) ? (pressed ? 0.85 : 1) : 0.5 },
              ]}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creando cuenta...' : '¡Crear cuenta!'}
              </Text>
            </Pressable>

            {/* Separador */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Google Sign-In Button */}
            <View style={styles.googleButtonContainer}>
              <Pressable
                onPress={handleGoogleRegister}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.googleButton,
                  { opacity: isLoading ? 0.5 : (pressed ? 0.85 : 1) }
                ]}
              >
                <Text style={styles.googleButtonText}>
                  � Continuar con Google
                </Text>
              </Pressable>
            </View>

            <View style={styles.helperRow}>
              <Text style={styles.helperText}>¿Ya tienes cuenta?</Text>
              <Pressable onPress={() => router.push('./login' as any)}>
                <Text style={styles.helperLink}> Iniciar sesión</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer note */}
          <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.footerNote}>
            Pedalea Go Kart 🏁 2025
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: BRAND_WHITE,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  brandLogo: {
    width: '60%',
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: BRAND_ASPHALT,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
  },
  registerButton: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    backgroundColor: BRAND_ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  registerButtonText: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  googleButtonContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  googleButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: BRAND_ASPHALT,
    fontSize: 16,
    fontWeight: '600',
  },
  helperRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 14,
  },
  helperLink: {
    color: BRAND_ORANGE,
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.8,
  },
});
