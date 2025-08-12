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
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/ThemedText';

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';

export default function LoginScreen() {
  const [pilotName, setPilotName] = useState('');
  const [password, setPassword] = useState('');
  const windowWidth = Dimensions.get('window').width;
  const kartX = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const isFormValid = useMemo(() => pilotName.trim().length > 0 && password.trim().length > 0, [pilotName, password]);

  function handleGoPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

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
            Nombre de piloto
          </ThemedText>
          <TextInput
            value={pilotName}
            onChangeText={setPilotName}
            placeholder="Ej: Super Nico"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="words"
            style={styles.input}
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
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleGoPress}
            disabled={!isFormValid}
            style={({ pressed }) => [
              styles.goButton,
              { opacity: isFormValid ? (pressed ? 0.85 : 1) : 0.5 },
            ]}
          >
            <Text style={styles.goButtonText}>¡GO!</Text>
          </Pressable>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.helperLink}> Recuperar</Text>
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
