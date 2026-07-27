import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button, HStack, Input, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const VEHICLE_KINDS: { id: 'car' | 'bike'; label: string }[] = [
  { id: 'car', label: 'Car' },
  { id: 'bike', label: 'Bike' },
];

export default function AddVehicleScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [number, setNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [color, setColor] = useState('');
  const [slotNumber, setSlotNumber] = useState('');
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState<'car' | 'bike'>('car');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = number.trim() && slotNumber.trim() && location.trim();

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing info', 'Please fill in vehicle number, slot number and location.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/parking/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          number: number.trim().toUpperCase(),
          vehicleType: vehicleType.trim() || (kind === 'car' ? 'Sedan' : 'Scooter'),
          color: color.trim() || 'Unspecified',
          slotNumber: slotNumber.trim().toUpperCase(),
          location: location.trim(),
          type: kind,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save the vehicle — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap="md" align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
          <ArrowLeft size={24} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>Add Vehicle</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Vehicle type</Text>
            <HStack gap="sm">
              {VEHICLE_KINDS.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setKind(v.id)}
                  style={[styles.chip, kind === v.id && styles.chipActive]}
                  accessibilityRole="button"
                >
                  {kind === v.id && <Check size={14} color={colors.brand[600]} />}
                  <Text variant="body" style={{ fontWeight: '600', color: kind === v.id ? colors.brand[700] : colors.surface.foreground }}>
                    {v.label}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          <Input label="Vehicle number *" value={number} onChangeText={(t) => setNumber(t.toUpperCase())} placeholder="MH 02 AB 1234" autoCapitalize="characters" />
          <Input label="Make / model" value={vehicleType} onChangeText={setVehicleType} placeholder="e.g. Sedan, Scooter" />
          <Input label="Color" value={color} onChangeText={setColor} placeholder="e.g. White" />
          <Input label="Slot number *" value={slotNumber} onChangeText={setSlotNumber} placeholder="e.g. A-101" autoCapitalize="characters" />
          <Input label="Location *" value={location} onChangeText={setLocation} placeholder="e.g. Basement 1, Section A" />

          <Button label={submitting ? 'Saving…' : 'Save vehicle'} onPress={handleSubmit} disabled={!canSubmit || submitting} loading={submitting} fullWidth />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing[12] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
});
