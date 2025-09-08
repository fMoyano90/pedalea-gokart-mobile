import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
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
const BRAND_YELLOW = '#FCD34D';

interface ActivePilot {
  id: string;
  pilotName: string;
  kartNumber: number;
  kartEmoji: string;
  startTime: Date;
  elapsedTime: number;
  status: 'active' | 'finished';
}

interface MapZone {
  id: string;
  name: string;
  type: 'safe' | 'caution' | 'danger';
  position: { x: number; y: number };
  size: { width: number; height: number };
}

const MOCK_PILOTS: ActivePilot[] = [
  {
    id: '1',
    pilotName: 'Piloto Principal',
    kartNumber: 42,
    kartEmoji: '🏎️',
    startTime: new Date(),
    elapsedTime: 0,
    status: 'active'
  }
];

const MAP_ZONES: MapZone[] = [
  { id: 'start', name: 'Zona de Inicio', type: 'safe', position: { x: 10, y: 200 }, size: { width: 80, height: 40 } },
  { id: 'track1', name: 'Pista Principal', type: 'safe', position: { x: 100, y: 100 }, size: { width: 200, height: 60 } },
  { id: 'curve1', name: 'Curva Peligrosa', type: 'caution', position: { x: 300, y: 80 }, size: { width: 60, height: 60 } },
  { id: 'obstacle', name: 'Zona de Obstáculos', type: 'danger', position: { x: 150, y: 180 }, size: { width: 100, height: 40 } },
  { id: 'track2', name: 'Recta Final', type: 'safe', position: { x: 200, y: 260 }, size: { width: 150, height: 40 } },
  { id: 'finish', name: 'Meta', type: 'safe', position: { x: 320, y: 200 }, size: { width: 60, height: 40 } },
];

export default function GameActiveScreen() {
  const [pilots, setPilots] = useState<ActivePilot[]>(MOCK_PILOTS);
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const windowWidth = Dimensions.get('window').width;
  const mapWidth = windowWidth - 40;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
      setPilots(prevPilots => 
        prevPilots.map(pilot => 
          pilot.status === 'active' 
            ? { ...pilot, elapsedTime: pilot.elapsedTime + 1 }
            : pilot
        )
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    // Animación de pulso para botón de emergencia
    const emergencyPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    );

    emergencyPulse.start();
    return () => emergencyPulse.stop();
  }, [pulseAnimation]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getZoneColor = (type: MapZone['type']) => {
    switch (type) {
      case 'safe': return BRAND_GREEN;
      case 'caution': return BRAND_YELLOW;
      case 'danger': return BRAND_RED;
    }
  };

  const getZoneIcon = (type: MapZone['type']) => {
    switch (type) {
      case 'safe': return '✅';
      case 'caution': return '⚠️';
      case 'danger': return '🚫';
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergencia',
      '¿Necesitas ayuda inmediata?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Solicitar Ayuda', 
          style: 'destructive',
          onPress: () => {
            setShowEmergency(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      ]
    );
  };

  const finishSession = () => {
    Alert.alert(
      '🏁 Finalizar Sesión',
      '¿Estás seguro de que quieres terminar la carrera?',
      [
        { text: 'Continuar Corriendo', style: 'cancel' },
        { 
          text: 'Finalizar', 
          style: 'default',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            router.replace('/(tabs)' as any);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header con cronómetro principal */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>🏁 Carrera Activa</ThemedText>
          <View style={styles.mainTimer}>
            <Text style={styles.sessionLabel}>Tiempo de Sesión</Text>
            <Text style={styles.sessionTime}>{formatTime(sessionTime)}</Text>
          </View>
        </View>

        {/* Controles de sesión */}
        <View style={styles.controlsContainer}>
          <Pressable onPress={togglePause} style={[styles.controlButton, styles.pauseButton]}>
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
            </Text>
          </Pressable>
          
          <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
            <Pressable onPress={handleEmergency} style={[styles.controlButton, styles.emergencyButton]}>
              <Text style={styles.controlButtonText}>🚨 Emergencia</Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Información de pilotos */}
        <View style={styles.pilotsSection}>
          <Text style={styles.sectionTitle}>👥 Pilotos Activos</Text>
          {pilots.map((pilot) => (
            <View key={pilot.id} style={styles.pilotStatus}>
              <Text style={styles.pilotEmoji}>{pilot.kartEmoji}</Text>
              <View style={styles.pilotDetails}>
                <Text style={styles.pilotName}>{pilot.pilotName}</Text>
                <Text style={styles.kartInfo}>Kart #{pilot.kartNumber}</Text>
              </View>
              <View style={styles.pilotTimer}>
                <Text style={styles.pilotTime}>{formatTime(pilot.elapsedTime)}</Text>
                <View style={[styles.statusDot, { 
                  backgroundColor: pilot.status === 'active' ? BRAND_GREEN : '#9CA3AF' 
                }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Mapa del circuito */}
        <View style={styles.mapSection}>
          <Text style={styles.sectionTitle}>🗺️ Mapa del Circuito</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.mapContainer, { width: Math.max(mapWidth, 400) }]}>
              {/* Fondo del mapa */}
              <View style={styles.mapBackground} />
              
              {/* Zonas del mapa */}
              {MAP_ZONES.map((zone) => (
                <View
                  key={zone.id}
                  style={[
                    styles.mapZone,
                    {
                      left: zone.position.x,
                      top: zone.position.y,
                      width: zone.size.width,
                      height: zone.size.height,
                      backgroundColor: getZoneColor(zone.type),
                    }
                  ]}
                >
                  <Text style={styles.zoneIcon}>{getZoneIcon(zone.type)}</Text>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                </View>
              ))}
              
              {/* Indicadores de pilotos (simulados) */}
              {pilots.map((pilot, index) => (
                <View
                  key={`pilot-${pilot.id}`}
                  style={[
                    styles.pilotMarker,
                    {
                      left: 120 + (index * 50) + (sessionTime % 300), // Movimiento simulado
                      top: 150 + Math.sin(sessionTime / 10) * 20,
                    }
                  ]}
                >
                  <Text style={styles.pilotMarkerText}>{pilot.kartEmoji}</Text>
                  <Text style={styles.pilotMarkerNumber}>#{pilot.kartNumber}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Leyenda del mapa */}
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Leyenda:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: BRAND_GREEN }]} />
              <Text style={styles.legendText}>Zona Segura</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: BRAND_YELLOW }]} />
              <Text style={styles.legendText}>Precaución</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: BRAND_RED }]} />
              <Text style={styles.legendText}>Peligro</Text>
            </View>
          </View>
        </View>

        {/* Botón de finalizar */}
        <View style={styles.footer}>
          <Pressable onPress={finishSession} style={styles.finishButton}>
            <Text style={styles.finishButtonText}>🏁 Finalizar Carrera</Text>
          </Pressable>
        </View>

        {/* Overlay de emergencia */}
        {showEmergency && (
          <View style={styles.emergencyOverlay}>
            <View style={styles.emergencyModal}>
              <Text style={styles.emergencyTitle}>🚨 Ayuda en Camino</Text>
              <Text style={styles.emergencyText}>
                Hemos notificado al personal de seguridad. 
                Permanece en tu ubicación actual.
              </Text>
              <Pressable 
                onPress={() => setShowEmergency(false)} 
                style={styles.emergencyCloseButton}
              >
                <Text style={styles.emergencyCloseText}>Entendido</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: BRAND_ASPHALT,
    textAlign: 'center',
    marginBottom: 16,
  },
  mainTimer: {
    backgroundColor: BRAND_ASPHALT,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sessionLabel: {
    fontSize: 14,
    color: BRAND_WHITE,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 32,
    fontWeight: '900',
    color: BRAND_ORANGE,
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: BRAND_BLUE,
  },
  emergencyButton: {
    backgroundColor: BRAND_RED,
  },
  controlButtonText: {
    color: BRAND_WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  pilotsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_ASPHALT,
    marginBottom: 12,
  },
  pilotStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  pilotEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  pilotDetails: {
    flex: 1,
  },
  pilotName: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_ASPHALT,
  },
  kartInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  pilotTimer: {
    alignItems: 'flex-end',
  },
  pilotTime: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_ASPHALT,
    fontFamily: 'monospace',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  mapSection: {
    flex: 1,
    marginBottom: 16,
  },
  mapContainer: {
    height: 320,
    position: 'relative',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  mapZone: {
    position: 'absolute',
    borderRadius: 8,
    opacity: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  zoneIcon: {
    fontSize: 16,
  },
  zoneName: {
    fontSize: 10,
    fontWeight: '600',
    color: BRAND_ASPHALT,
    textAlign: 'center',
    marginTop: 2,
  },
  pilotMarker: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: BRAND_WHITE,
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pilotMarkerText: {
    fontSize: 20,
  },
  pilotMarkerNumber: {
    fontSize: 8,
    fontWeight: '700',
    color: BRAND_ASPHALT,
  },
  legendSection: {
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_ASPHALT,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    paddingBottom: 20,
  },
  finishButton: {
    backgroundColor: BRAND_ORANGE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  finishButtonText: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emergencyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyModal: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BRAND_RED,
    marginBottom: 12,
  },
  emergencyText: {
    fontSize: 16,
    color: BRAND_ASPHALT,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  emergencyCloseButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emergencyCloseText: {
    color: BRAND_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});
