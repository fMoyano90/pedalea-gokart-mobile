import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';
const BRAND_GREEN = '#10B981';
const BRAND_BLUE = '#3B82F6';
const BRAND_RED = '#EF4444';

interface PilotStatus {
  id: string;
  pilotName: string;
  kartType: string;
  kartEmoji: string;
  kartColor: string;
  status: 'waiting' | 'assigned' | 'ready';
  kartNumber?: number;
  assignedTime?: Date;
}

const MOCK_PILOTS: PilotStatus[] = [
  {
    id: '1',
    pilotName: 'Piloto Principal',
    kartType: 'Speed Demon',
    kartEmoji: '🏎️',
    kartColor: BRAND_RED,
    status: 'waiting'
  }
];

export default function GameWaitingScreen() {
  const [pilots, setPilots] = useState<PilotStatus[]>(MOCK_PILOTS);
  const [allReady, setAllReady] = useState(false);
  const [timeWaiting, setTimeWaiting] = useState(0);
  const pulseAnimations = useRef(pilots.map(() => new Animated.Value(1))).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulación de asignación automática de karts
    const assignmentTimer = setTimeout(() => {
      setPilots(prevPilots => 
        prevPilots.map(pilot => ({
          ...pilot,
          status: 'assigned',
          kartNumber: Math.floor(Math.random() * 99) + 1,
          assignedTime: new Date()
        }))
      );
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Después de 2 segundos más, marcar como listos
      setTimeout(() => {
        setPilots(prevPilots => 
          prevPilots.map(pilot => ({ ...pilot, status: 'ready' }))
        );
        setAllReady(true);
        
        // Animación de celebración
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 2000);
    }, 3000);

    return () => clearTimeout(assignmentTimer);
  }, [fadeAnimation]);

  useEffect(() => {
    // Cronómetro de espera
    const timer = setInterval(() => {
      setTimeWaiting(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Animaciones de pulso para pilotos en espera
    const animations = pilots.map((pilot, index) => {
      if (pilot.status === 'waiting') {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimations[index], {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimations[index], {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        );
      }
      return null;
    }).filter(Boolean);

    animations.forEach(animation => animation?.start());

    return () => animations.forEach(animation => animation?.stop());
  }, [pilots, pulseAnimations]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: PilotStatus['status']) => {
    switch (status) {
      case 'waiting': return '#FCD34D';
      case 'assigned': return BRAND_BLUE;
      case 'ready': return BRAND_GREEN;
    }
  };

  const getStatusText = (status: PilotStatus['status']) => {
    switch (status) {
      case 'waiting': return 'Esperando asignación...';
      case 'assigned': return '¡Kart asignado!';
      case 'ready': return '¡Listo para correr!';
    }
  };

  const startRace = () => {
    if (!allReady) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace('./game-active' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>🏁 Preparando la Carrera</ThemedText>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Tiempo de espera:</Text>
            <Text style={styles.timerText}>{formatTime(timeWaiting)}</Text>
          </View>
        </View>

        {/* Estado general */}
        <View style={styles.statusContainer}>
          {!allReady ? (
            <View style={styles.waitingStatus}>
              <ActivityIndicator size="large" color={BRAND_ORANGE} />
              <Text style={styles.waitingText}>
                Asignando karts disponibles...
              </Text>
              <Text style={styles.waitingSubtext}>
                Por favor espera mientras preparamos tu experiencia
              </Text>
            </View>
          ) : (
            <Animated.View style={[styles.readyStatus, { opacity: fadeAnimation }]}>
              <Text style={styles.readyEmoji}>🎉</Text>
              <Text style={styles.readyText}>¡Todos listos!</Text>
              <Text style={styles.readySubtext}>
                Tus karts están preparados y esperándote
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Lista de pilotos */}
        <ScrollView style={styles.pilotsContainer} showsVerticalScrollIndicator={false}>
          {pilots.map((pilot, index) => (
            <Animated.View
              key={pilot.id}
              style={[
                styles.pilotCard,
                { 
                  transform: [{ scale: pulseAnimations[index] }],
                  borderColor: getStatusColor(pilot.status)
                }
              ]}
            >
              <View style={styles.pilotHeader}>
                <Text style={styles.pilotEmoji}>{pilot.kartEmoji}</Text>
                <View style={styles.pilotInfo}>
                  <Text style={styles.pilotName}>{pilot.pilotName}</Text>
                  <Text style={[styles.kartType, { color: pilot.kartColor }]}>
                    {pilot.kartType}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(pilot.status) }]}>
                  <Text style={styles.statusBadgeText}>
                    {pilot.status === 'waiting' && '⏳'}
                    {pilot.status === 'assigned' && '✅'}
                    {pilot.status === 'ready' && '🏁'}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.statusText, { color: getStatusColor(pilot.status) }]}>
                {getStatusText(pilot.status)}
              </Text>
              
              {pilot.kartNumber && (
                <View style={styles.kartDetails}>
                  <Text style={styles.kartNumber}>Kart #{pilot.kartNumber}</Text>
                  {pilot.assignedTime && (
                    <Text style={styles.assignedTime}>
                      Asignado: {pilot.assignedTime.toLocaleTimeString()}
                    </Text>
                  )}
                </View>
              )}
            </Animated.View>
          ))}
        </ScrollView>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎯 ¿Qué sigue?</Text>
            <Text style={styles.infoText}>
              • Una vez asignados los karts, comenzará el cronómetro
            </Text>
            <Text style={styles.infoText}>
              • Podrás ver el mapa con zonas habilitadas y de riesgo
            </Text>
            <Text style={styles.infoText}>
              • ¡Diviértete y conduce con seguridad!
            </Text>
          </View>
        </View>

        {/* Botón de continuar */}
        <View style={styles.footer}>
          <Pressable
            onPress={startRace}
            style={[
              styles.continueButton,
              { 
                opacity: allReady ? 1 : 0.5,
                backgroundColor: allReady ? BRAND_GREEN : '#9CA3AF'
              }
            ]}
            disabled={!allReady}
          >
            <Text style={styles.continueButtonText}>
              {allReady ? '🚀 ¡Comenzar Aventura!' : '⏳ Preparando...'}
            </Text>
          </Pressable>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: BRAND_ASPHALT,
    textAlign: 'center',
    marginBottom: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_ASPHALT,
    fontFamily: 'monospace',
  },
  statusContainer: {
    marginBottom: 24,
  },
  waitingStatus: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
  },
  waitingText: {
    fontSize: 18,
    fontWeight: '600',
    color: BRAND_ASPHALT,
    marginTop: 12,
    textAlign: 'center',
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  readyStatus: {
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 20,
  },
  readyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  readyText: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND_GREEN,
    textAlign: 'center',
  },
  readySubtext: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
    textAlign: 'center',
  },
  pilotsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  pilotCard: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  pilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pilotEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  pilotInfo: {
    flex: 1,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_ASPHALT,
  },
  kartType: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  kartDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  kartNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_ASPHALT,
  },
  assignedTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BRAND_ASPHALT,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  footer: {
    paddingBottom: 20,
  },
  continueButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  continueButtonText: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
