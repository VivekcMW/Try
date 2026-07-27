import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Car,
  Clock,
  Calendar,
  MessageSquare,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const VEHICLE_TYPES = [
  { id: 'car', label: 'Car', icon: '🚗' },
  { id: 'suv', label: 'SUV', icon: '🚙' },
  { id: 'bike', label: 'Bike', icon: '🏍️' },
  { id: 'scooter', label: 'Scooter', icon: '🛵' },
  { id: 'auto', label: 'Auto', icon: '🛺' },
];

const DURATION_OPTIONS = [
  { id: '1h', label: '1 Hour' },
  { id: '2h', label: '2 Hours' },
  { id: '4h', label: '4 Hours' },
  { id: '8h', label: '8 Hours (Half Day)' },
  { id: 'day', label: 'Full Day' },
];

const PURPOSE_OPTIONS = [
  'Family visit',
  'Friend visit',
  'Delivery',
  'Service/Repair',
  'Guest',
  'Other',
];

export default function BookVisitorParkingScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [form, setForm] = useState({
    visitorName: '',
    vehicleNumber: '',
    vehicleType: 'car',
    date: 'Today',
    time: '',
    duration: '2h',
    purpose: 'Family visit',
    notes: '',
  });

  const [showVehicleTypes, setShowVehicleTypes] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showPurpose, setShowPurpose] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = VEHICLE_TYPES.find((v) => v.id === form.vehicleType);
  const selectedDuration = DURATION_OPTIONS.find((d) => d.id === form.duration);

  const handleSubmit = async () => {
    if (!form.visitorName.trim()) {
      Alert.alert('Missing Info', 'Please enter visitor name');
      return;
    }
    if (!form.vehicleNumber.trim()) {
      Alert.alert('Missing Info', 'Please enter vehicle number');
      return;
    }
    if (!form.time.trim()) {
      Alert.alert('Missing Info', 'Please enter expected arrival time');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/parking/visitor-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requesterId: userId,
          visitorName: form.visitorName.trim(),
          vehicleNumber: form.vehicleNumber.trim(),
          vehicleType: selectedVehicle?.label ?? form.vehicleType,
          purpose: form.purpose,
          requestedTime: `${form.date}, ${form.time.trim()}`,
          duration: selectedDuration?.label ?? form.duration,
          notes: form.notes.trim() || undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();

      Alert.alert(
        'Booking Confirmed',
        `Visitor parking booked for ${data.request.visitorName} — Slot ${data.request.requestedSlot}. Awaiting approval from the security desk.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert('Error', 'Could not book visitor parking — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap="md" align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Book Visitor Parking</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <VStack gap="lg" style={styles.form}>
          {/* Visitor Name */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Visitor Name *</Text>
            <HStack style={styles.inputRow}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.visitorName}
                onChangeText={(t) => setForm({ ...form, visitorName: t })}
                placeholder="e.g., Rahul Sharma"
                placeholderTextColor={colors.textSecondary}
              />
            </HStack>
          </VStack>

          {/* Vehicle Number */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Vehicle Number *</Text>
            <HStack style={styles.inputRow}>
              <Car size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.vehicleNumber}
                onChangeText={(t) => setForm({ ...form, vehicleNumber: t.toUpperCase() })}
                placeholder="e.g., MH 01 AB 1234"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </HStack>
          </VStack>

          {/* Vehicle Type */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Vehicle Type</Text>
            <Pressable onPress={() => setShowVehicleTypes(!showVehicleTypes)}>
              <HStack style={styles.inputRow}>
                <Text style={styles.inputEmoji}>{selectedVehicle?.icon}</Text>
                <Text style={styles.input}>{selectedVehicle?.label}</Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </HStack>
            </Pressable>

            {showVehicleTypes && (
              <Card style={styles.dropdown}>
                {VEHICLE_TYPES.map((type) => (
                  <Pressable
                    key={type.id}
                    style={[styles.dropdownItem, form.vehicleType === type.id && styles.dropdownItemSelected]}
                    onPress={() => {
                      setForm({ ...form, vehicleType: type.id });
                      setShowVehicleTypes(false);
                    }}
                  >
                    <Text style={styles.dropdownEmoji}>{type.icon}</Text>
                    <Text variant="body" style={{ flex: 1 }}>{type.label}</Text>
                    {form.vehicleType === type.id && <Check size={18} color={colors.brand[600]} />}
                  </Pressable>
                ))}
              </Card>
            )}
          </VStack>

          {/* Date & Time */}
          <HStack gap="md">
            <VStack gap="xs" style={{ flex: 1 }}>
              <Text variant="label" tone="secondary">Date</Text>
              <HStack style={styles.inputRow}>
                <Calendar size={20} color={colors.textSecondary} />
                <Text style={styles.input}>{form.date}</Text>
              </HStack>
            </VStack>
            <VStack gap="xs" style={{ flex: 1 }}>
              <Text variant="label" tone="secondary">Time *</Text>
              <HStack style={styles.inputRow}>
                <Clock size={20} color={colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  value={form.time}
                  onChangeText={(t) => setForm({ ...form, time: t })}
                  placeholder="e.g., 3:00 PM"
                  placeholderTextColor={colors.textSecondary}
                />
              </HStack>
            </VStack>
          </HStack>

          {/* Duration */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Duration</Text>
            <Pressable onPress={() => setShowDuration(!showDuration)}>
              <HStack style={styles.inputRow}>
                <Clock size={20} color={colors.textSecondary} />
                <Text style={styles.input}>{selectedDuration?.label}</Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </HStack>
            </Pressable>

            {showDuration && (
              <Card style={styles.dropdown}>
                {DURATION_OPTIONS.map((duration) => (
                  <Pressable
                    key={duration.id}
                    style={[styles.dropdownItem, form.duration === duration.id && styles.dropdownItemSelected]}
                    onPress={() => {
                      setForm({ ...form, duration: duration.id });
                      setShowDuration(false);
                    }}
                  >
                    <Text variant="body" style={{ flex: 1 }}>{duration.label}</Text>
                    {form.duration === duration.id && <Check size={18} color={colors.brand[600]} />}
                  </Pressable>
                ))}
              </Card>
            )}
          </VStack>

          {/* Purpose */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Purpose of Visit</Text>
            <Pressable onPress={() => setShowPurpose(!showPurpose)}>
              <HStack style={styles.inputRow}>
                <MessageSquare size={20} color={colors.textSecondary} />
                <Text style={styles.input}>{form.purpose}</Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </HStack>
            </Pressable>

            {showPurpose && (
              <Card style={styles.dropdown}>
                {PURPOSE_OPTIONS.map((purpose) => (
                  <Pressable
                    key={purpose}
                    style={[styles.dropdownItem, form.purpose === purpose && styles.dropdownItemSelected]}
                    onPress={() => {
                      setForm({ ...form, purpose });
                      setShowPurpose(false);
                    }}
                  >
                    <Text variant="body" style={{ flex: 1 }}>{purpose}</Text>
                    {form.purpose === purpose && <Check size={18} color={colors.brand[600]} />}
                  </Pressable>
                ))}
              </Card>
            )}
          </VStack>

          {/* Notes */}
          <VStack gap="xs">
            <Text variant="label" tone="secondary">Additional Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={form.notes}
              onChangeText={(t) => setForm({ ...form, notes: t })}
              placeholder="Any special instructions..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </VStack>
        </VStack>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text variant="label">📱 Visitor Entry</Text>
          <Text variant="caption" tone="secondary" style={styles.infoText}>
            Your visitor will receive an SMS with a QR code for gate entry.
            Ensure the phone number is correct.
          </Text>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={isSubmitting ? 'Booking…' : 'Book Parking'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          loading={isSubmitting}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.surface.foreground,
    paddingVertical: spacing.xs,
  },
  inputEmoji: { fontSize: 20 },
  dropdown: {
    padding: spacing.xs,
    marginTop: spacing.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  dropdownItemSelected: {
    backgroundColor: colors.brand[50],
  },
  dropdownEmoji: { fontSize: 20 },
  textArea: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.surface.foreground,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoCard: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.brand[50],
  },
  infoText: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  bottomPadding: { height: 100 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
