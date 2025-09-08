import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

const BRAND_WHITE = '#FFFFFF';
const BRAND_ORANGE = '#E56E1E';
const BRAND_ASPHALT = '#1C1B17';
const BRAND_GREEN = '#10B981';
const BRAND_BLUE = '#3B82F6';
const BRAND_PURPLE = '#8B5CF6';
const BRAND_RED = '#EF4444';

const KART_TYPES = [
  {
    id: 'speed',
    name: 'Speed Demon',
    emoji: '🏎️',
    color: BRAND_RED,
    description: 'Máxima velocidad',
    stats: { speed: 5, control: 3, comfort: 2 }
  },
  {
    id: 'balanced',
    name: 'All-Rounder',
    emoji: '🏁',
    color: BRAND_BLUE,
    description: 'Equilibrio perfecto',
    stats: { speed: 4, control: 4, comfort: 4 }
  },
  {
    id: 'control',
    name: 'Precision',
    emoji: '🎯',
    color: BRAND_GREEN,
    description: 'Control total',
    stats: { speed: 3, control: 5, comfort: 3 }
  },
  {
    id: 'comfort',
    name: 'Cruiser',
    emoji: '✨',
    color: BRAND_PURPLE,
    description: 'Comodidad máxima',
    stats: { speed: 2, control: 3, comfort: 5 }
  }
];

interface SelectedKart {
  kartType: typeof KART_TYPES[0];
  pilotName: string;
}

export default function GameSelectScreen() {
  const [selectedKarts, setSelectedKarts] = useState<SelectedKart[]>([]);
  const [newPilotName, setNewPilotName] = useState('');
  const [isAddingPilot, setIsAddingPilot] = useState(false);
  const scaleAnimations = useRef(KART_TYPES.map(() => new Animated.Value(1))).current;

  const handleKartSelect = (kartType: typeof KART_TYPES[0]) => {
    if (selectedKarts.length === 0) {
      // Primer kart - usar el usuario actual
      setSelectedKarts([{ kartType, pilotName: 'Piloto Principal' }]);
    } else if (newPilotName.trim()) {
      // Kart adicional con nuevo piloto
      setSelectedKarts([...selectedKarts, { kartType, pilotName: newPilotName.trim() }]);
      setNewPilotName('');
      setIsAddingPilot(false);
    } else {
      Alert.alert('Nombre requerido', 'Ingresa el nombre del piloto adicional');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animación de selección
    const index = KART_TYPES.findIndex(k => k.id === kartType.id);
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
  };

  const removeKart = (index: number) => {
    setSelectedKarts(selectedKarts.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const startRace = () => {
    if (selectedKarts.length === 0) {
      Alert.alert('Selección requerida', 'Selecciona al menos un kart para continuar');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push('./game-waiting' as any);
  };

  const StatBar = ({ value, max = 5 }: { value: number; max?: number }) => (
    <View style={styles.statBarContainer}>
      {Array.from({ length: max }, (_, i) => (
        <View
          key={i}
          style={[
            styles.statBarItem,
            { backgroundColor: i < value ? BRAND_ORANGE : '#E5E7EB' }
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>🏁 Selecciona tu Kart</ThemedText>
          <ThemedText style={styles.subtitle}>
            Elige el kart perfecto para tu aventura
          </ThemedText>
        </View>

        {/* Karts seleccionados */}
        {selectedKarts.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>Karts Seleccionados</Text>
            {selectedKarts.map((selected, index) => (
              <View key={index} style={styles.selectedKart}>
                <Text style={styles.selectedKartEmoji}>{selected.kartType.emoji}</Text>
                <View style={styles.selectedKartInfo}>
                  <Text style={styles.selectedKartName}>{selected.kartType.name}</Text>
                  <Text style={styles.selectedPilotName}>{selected.pilotName}</Text>
                </View>
                <Pressable onPress={() => removeKart(index)} style={styles.removeButton}>
                  <Text style={styles.removeButtonText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Input para nuevo piloto */}
        {selectedKarts.length > 0 && (
          <View style={styles.addPilotSection}>
            {!isAddingPilot ? (
              <Pressable onPress={() => setIsAddingPilot(true)} style={styles.addPilotButton}>
                <Text style={styles.addPilotButtonText}>+ Añadir otro piloto</Text>
              </Pressable>
            ) : (
              <View style={styles.pilotInputContainer}>
                <Text style={styles.inputLabel}>Nombre del piloto adicional:</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={newPilotName}
                    onChangeText={setNewPilotName}
                    placeholder="Nombre del piloto"
                    style={styles.pilotInput}
                  />
                  <Pressable onPress={() => setIsAddingPilot(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Grid de Karts */}
        <ScrollView style={styles.kartsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.kartsGrid}>
            {KART_TYPES.map((kart, index) => (
              <Animated.View
                key={kart.id}
                style={[
                  styles.kartCard,
                  { transform: [{ scale: scaleAnimations[index] }] }
                ]}
              >
                <Pressable
                  onPress={() => handleKartSelect(kart)}
                  style={[styles.kartButton, { borderColor: kart.color }]}
                >
                  <Text style={styles.kartEmoji}>{kart.emoji}</Text>
                  <Text style={[styles.kartName, { color: kart.color }]}>{kart.name}</Text>
                  <Text style={styles.kartDescription}>{kart.description}</Text>
                  
                  {/* Stats */}
                  <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Velocidad</Text>
                      <StatBar value={kart.stats.speed} />
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Control</Text>
                      <StatBar value={kart.stats.control} />
                    </View>
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Confort</Text>
                      <StatBar value={kart.stats.comfort} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </ScrollView>

        {/* Botón de iniciar */}
        <View style={styles.footer}>
          <Pressable
            onPress={startRace}
            style={[
              styles.startButton,
              { opacity: selectedKarts.length > 0 ? 1 : 0.5 }
            ]}
          >
            <Text style={styles.startButtonText}>
              🚦 ¡Comenzar Carrera! ({selectedKarts.length})
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: BRAND_ASPHALT,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND_ASPHALT,
    marginBottom: 12,
  },
  selectedKart: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  selectedKartEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  selectedKartInfo: {
    flex: 1,
  },
  selectedKartName: {
    fontSize: 16,
    fontWeight: '600',
    color: BRAND_ASPHALT,
  },
  selectedPilotName: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BRAND_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: BRAND_WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  addPilotSection: {
    marginBottom: 20,
  },
  addPilotButton: {
    backgroundColor: BRAND_BLUE,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  addPilotButtonText: {
    color: BRAND_WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  pilotInputContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_ASPHALT,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pilotInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: BRAND_WHITE,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: BRAND_WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  kartsContainer: {
    flex: 1,
  },
  kartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  kartCard: {
    width: '48%',
  },
  kartButton: {
    backgroundColor: BRAND_WHITE,
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  kartEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  kartName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  kartDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsContainer: {
    width: '100%',
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  statBarContainer: {
    flexDirection: 'row',
    gap: 2,
    flex: 1,
    marginLeft: 8,
  },
  statBarItem: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  footer: {
    paddingVertical: 20,
  },
  startButton: {
    backgroundColor: BRAND_ORANGE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  startButtonText: {
    color: BRAND_WHITE,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
