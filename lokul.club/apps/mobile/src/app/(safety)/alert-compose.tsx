import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Check, Locate, MapPin, X } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { CATEGORY_META, SafetyCategory } from '@/data/safety-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: colors.semantic.success },
  { value: 'medium', label: 'Medium', color: colors.semantic.warning },
  { value: 'high', label: 'High', color: colors.semantic.danger },
];

// Saved/recent on-site locations a resident can pick without using GPS.
const SAVED_LOCATIONS = [
  'Tower A, Main Gate',
  'Tower B, Back Gate',
  'Clubhouse',
  'Children\'s Play Area',
  'Basement Parking — Level 1',
  'Garden / Podium Deck',
];

export default function AlertComposeScreen() {
  return (
    <FeatureGate featureKey="sos_alerts">
      <AlertComposeScreenInner />
    </FeatureGate>
  );
}

function AlertComposeScreenInner() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);
  const [category,   setCategory]   = useState<SafetyCategory>('fire');
  const [severity,   setSeverity]   = useState<'low' | 'medium' | 'high'>('medium');
  const [body,       setBody]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Tower A, Main Gate');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [locating,   setLocating]   = useState(false);

  const categories = Object.entries(CATEGORY_META) as [SafetyCategory, (typeof CATEGORY_META)[SafetyCategory]][];

  const handleSend = async () => {
    if (!body.trim() || !userId || !pinCode) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId, pinCode, type: 'safety',
          body: body.trim(),
          tags: [category, severity],
        }),
      });
      if (res.ok) router.back();
      else { const d = await res.json(); Alert.alert('Error', d.error ?? 'Failed'); }
    } catch { Alert.alert('Error', 'Network error'); } finally { setSubmitting(false); }
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location access to use your current position.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const label = place
        ? [place.name, place.street, place.district].filter(Boolean).join(', ')
        : `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
      setLocationLabel(label || 'Current location');
      setPickerOpen(false);
    } catch {
      Alert.alert('Error', 'Could not fetch your current location.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityRole="button">
          <X size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Report Alert</Text>
        <Button
          label={submitting ? 'Sending…' : 'Send'}
          size="sm"
          onPress={handleSend}
          disabled={body.trim().length === 0 || submitting}
        />
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Category */}
        <VStack gap={2}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600' }}>CATEGORY</Text>
          <View style={styles.catGrid}>
            {categories.map(([key, meta]) => {
              const Icon = meta.Icon;
              const isActive = category === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setCategory(key)}
                  style={[styles.catTile, isActive && styles.catTileActive]}
                  accessibilityRole="button"
                >
                  <Icon size={22} color={isActive ? colors.brand[600] : colors.surface.textSecondary} />
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '600',
                      color: isActive ? colors.brand[600] : colors.surface.foreground,
                      textAlign: 'center',
                    }}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </VStack>

        {/* Severity */}
        <VStack gap={2} style={{ marginTop: spacing[5] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600' }}>SEVERITY</Text>
          <HStack gap={3}>
            {SEVERITY_OPTIONS.map((s) => (
              <Pressable
                key={s.value}
                onPress={() => setSeverity(s.value as 'low' | 'medium' | 'high')}
                style={[
                  styles.sevChip,
                  severity === s.value && { borderColor: s.color, backgroundColor: s.color + '18' },
                ]}
                accessibilityRole="button"
              >
                <View style={[styles.sevDot, { backgroundColor: s.color }]} />
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: severity === s.value ? s.color : colors.surface.foreground }}
                >
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>

        {/* Description */}
        <VStack gap={2} style={{ marginTop: spacing[5] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600' }}>DESCRIPTION</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what you observed…"
            placeholderTextColor={colors.surface.textSecondary}
            multiline
            maxLength={1000}
            value={body}
            onChangeText={setBody}
            autoFocus
          />
        </VStack>

        {/* Location */}
        <Pressable style={styles.locationRow} onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel="Change alert location">
          <MapPin size={18} color={colors.brand[600]} />
          <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
            {locationLabel} · Tap to change
          </Text>
        </Pressable>

        <View style={styles.warningBox}>
          <Text variant="caption" style={{ color: '#92400E' }}>
            This alert will be visible to all residents in Kumar Sienna. For life-threatening emergencies, call 112 immediately.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <HStack gap={2} align="center" justify="between" style={{ marginBottom: spacing[3] }}>
              <Text variant="h3" style={{ color: colors.surface.heading }}>Set alert location</Text>
              <Pressable onPress={() => setPickerOpen(false)} accessibilityRole="button" accessibilityLabel="Close">
                <X size={20} color={colors.surface.textSecondary} />
              </Pressable>
            </HStack>

            <Pressable onPress={useCurrentLocation} style={styles.currentLocBtn} disabled={locating} accessibilityRole="button">
              {locating ? <ActivityIndicator size="small" color={colors.brand[600]} /> : <Locate size={18} color={colors.brand[600]} />}
              <Text variant="body" style={{ color: colors.brand[600], fontWeight: '700' }}>
                {locating ? 'Fetching your location…' : 'Use my current location'}
              </Text>
            </Pressable>

            <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600', marginTop: spacing[4] }}>
              SAVED LOCATIONS
            </Text>
            <ScrollView style={{ maxHeight: 260 }}>
              {SAVED_LOCATIONS.map((loc) => (
                <Pressable
                  key={loc}
                  onPress={() => { setLocationLabel(loc); setPickerOpen(false); }}
                  style={styles.savedLocRow}
                  accessibilityRole="button"
                >
                  <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{loc}</Text>
                  {locationLabel === loc && <Check size={16} color={colors.brand[600]} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: spacing[5], gap: spacing[2], paddingBottom: spacing[16] },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catTile: {
    width: '30%',
    aspectRatio: 1.2,
    borderRadius: 12,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  catTileActive: {
    borderColor: colors.brand[300],
    backgroundColor: colors.brand[50],
  },
  sevChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: 8, backgroundColor: colors.gray[50],
    borderWidth: 1.5, borderColor: colors.surface.border,
  },
  sevDot: { width: 8, height: 8, borderRadius: 4 },
  textArea: {
    minHeight: 120, backgroundColor: colors.gray[50], borderRadius: 12,
    padding: spacing[4], fontSize: 15, color: colors.surface.heading,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: colors.brand[50], borderRadius: 10, padding: spacing[3],
    marginTop: spacing[4],
  },
  warningBox: {
    backgroundColor: '#FEF3C7', borderRadius: 10, padding: spacing[3], marginTop: spacing[3],
  },
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: colors.surface.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: spacing[5], paddingBottom: spacing[8],
  },
  currentLocBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    backgroundColor: colors.brand[50], borderRadius: 12, padding: spacing[4],
  },
  savedLocRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
});
