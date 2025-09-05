import React, { useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Text,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';
import { authService, loginWithEmail } from '@/lib/auth.service';
import { useAuth } from '@/lib/hooks/useAuth';

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';

export default function LoginScreen() {
  const [pilotName, setPilotName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const kartX = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const { saveAuthData } = useAuth();

  const isFormValid = useMemo(() => pilotName.trim().length > 0 && password.trim().length > 0, [pilotName, password]);

  async function handleEmailLogin() {
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    try {
      const response = await loginWithEmail(pilotName.trim(), password);
      console.log('Login exitoso:', response);
      
      // Guardar datos de autenticación
      await saveAuthData(response);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playKartAnimation();
    } catch (error: any) {
      console.error('Error en login:', error);
      Alert.alert('Error de Login', error.message || 'No se pudo iniciar sesión');
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authService.initializeGoogleSignIn();
      const response = await authService.signInWithGoogle();
      console.log('Login con Google exitoso:', response);
      
      await saveAuthData(response);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      playKartAnimation();
    } catch (error: any) {
      console.error('Error en Google login:', error);
      Alert.alert('Error de Login con Google', error.message || 'No se pudo iniciar sesión con Google');
      setIsLoading(false);
    }
  }

  function playKartAnimation() {
    // Playful kart sprint animation across the screen
    kartX.setValue(0);
    rotation.setValue(0);
    Animated.parallel([
      Animated.timing(kartX, {
        toValue: windowWidth - 120,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(rotation, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: -1, duration: 250, useNativeDriver: true }),
        Animated.timing(rotation, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(({ finished }) => {
      if (finished) {
        setIsLoading(false);
        router.replace('/');
      }
    });
  }

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Background decorations: racing stripes */}
        <View style={styles.decorationsContainer} pointerEvents="none">
          <View style={[styles.stripeLight, { left: -30, transform: [{ rotate: '-15deg' }] }]} />
          <View style={[styles.stripeLight, { right: -30, transform: [{ rotate: '15deg' }] }]} />
        </View>

        {/* Brand logo */}
        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/pedalea-logo.webp')}
            style={styles.brandLogo}
            contentFit="contain"
            accessible
            accessibilityLabel="Logo Pedalea Go Kart"
          />
          <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.tagline}>
            ¡Enciende motores y entra a la pista!
          </ThemedText>
        </View>

        {/* Playful kart */}
        <Animated.View
          accessible
          accessibilityLabel="kart animado"
          style={[styles.kartContainer, { transform: [{ translateX: kartX }, { rotate: rotateInterpolate }] }]}>
          <Text style={styles.kartEmoji}>🏎️</Text>
          <View style={styles.kartShadow} />
        </Animated.View>

        {/* Form Card */}
        <View style={styles.card}>
          <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.inputLabel}>
            Email
          </ThemedText>
          <TextInput
            value={pilotName}
            onChangeText={setPilotName}
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
            value={password}
            onChangeText={setPassword}
            placeholder="••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={styles.input}
            editable={!isLoading}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleEmailLogin}
            disabled={!isFormValid || isLoading}
            style={({ pressed }) => [
              styles.goButton,
              { opacity: (isFormValid && !isLoading) ? (pressed ? 0.85 : 1) : 0.5 },
            ]}
          >
            <Text style={styles.goButtonText}>
              {isLoading ? 'Arrancando...' : '¡GO!'}
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
              onPress={handleGoogleLogin}
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
            <Text style={styles.helperText}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.helperLink}> Recuperar</Text>
          </View>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>¿No tienes cuenta?</Text>
            <Pressable onPress={() => router.push('./register' as any)}>
              <Text style={styles.helperLink}> Crear cuenta</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer note */}
        <ThemedText lightColor={BRAND_ASPHALT} darkColor={BRAND_ASPHALT} style={styles.footerNote}>
          Pedalea Go Kart 🏁 2025
        </ThemedText>
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
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'flex-start',
  },
  decorationsContainer: {
    position: 'absolute',
    top: -40,
    left: 0,
    right: 0,
    height: 240,
  },
  stripeLight: {
    position: 'absolute',
    top: 0,
    width: 140,
    height: 240,
    backgroundColor: '#FFE6D3',
    borderRadius: 24,
    opacity: 1,
  },
  headerContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  brandLogo: {
    width: '70%',
    height: 80,
    alignSelf: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
  },
  kartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    height: 56,
  },
  kartEmoji: {
    fontSize: 44,
    textShadowColor: '#00000055',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  kartShadow: {
    position: 'absolute',
    width: 52,
    height: 12,
    backgroundColor: '#00000055',
    borderRadius: 999,
    bottom: -2,
    left: 4,
    transform: [{ scaleX: 1.2 }],
  },
  card: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
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
  goButton: {
    marginTop: 10,
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
  goButtonText: {
    color: BRAND_WHITE,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
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
    marginTop: 10,
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
    marginTop: 18,
    opacity: 0.8,
  },
});
