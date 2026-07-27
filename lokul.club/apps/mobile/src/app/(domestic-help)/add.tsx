import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera,
  User,
  Phone,
  Briefcase,
  Clock,
  IndianRupee,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const HELPER_ROLES = [
  { id: 'maid', label: 'Maid / Domestic Help', icon: '🧹' },
  { id: 'cook', label: 'Cook', icon: '👨‍🍳' },
  { id: 'driver', label: 'Driver', icon: '🚗' },
  { id: 'nanny', label: 'Nanny / Babysitter', icon: '👶' },
  { id: 'caretaker', label: 'Elderly Caretaker', icon: '👴' },
  { id: 'gardener', label: 'Gardener', icon: '🌱' },
  { id: 'security', label: 'Security Guard', icon: '🛡️' },
  { id: 'watchman', label: 'Watchman', icon: '👁️' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AddHelperScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: '',
    workingHours: '',
    monthlyPay: '',
    photo: null as string | null,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]) {
      setForm((f) => ({ ...f, photo: result.assets[0].uri }));
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert('Missing Info', 'Please enter helper name');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Missing Info', 'Please enter phone number');
      return;
    }
    if (!form.role) {
      Alert.alert('Missing Info', 'Please select a role');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setIsSubmitting(true);

    const selectedRole = HELPER_ROLES.find(r => r.id === form.role);

    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: form.name.trim(),
          phone: form.phone.trim(),
          roleId: form.role,
          role: selectedRole?.label ?? form.role,
          workingDays: selectedDays,
          workingHours: form.workingHours.trim(),
          monthlyPayPaise: Math.round((Number(form.monthlyPay) || 0) * 100),
          photo: form.photo,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();

      Alert.alert(
        'Helper Added',
        `${data.helper.name} has been added to your helpers list. Would you like to verify them now?`,
        [
          { text: 'Later', onPress: () => router.back() },
          { text: 'Verify Now', onPress: () => router.replace('/(domestic-help)/verify') },
        ]
      );
    } catch {
      Alert.alert('Failed to add helper', 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = HELPER_ROLES.find(r => r.id === form.role);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Add Helper</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Photo Upload */}
        <View style={styles.photoSection}>
          <Pressable
            style={styles.photoPlaceholder}
            onPress={pickPhoto}
          >
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.photo} />
            ) : (
              <>
                <Camera size={32} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">Add Photo</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Form Fields */}
        <VStack gap={spacing.lg} style={styles.form}>
          {/* Name */}
          <VStack gap={spacing.xs}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Full Name *</Text>
            <HStack style={styles.inputRow}>
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="e.g., Sunita Devi"
                placeholderTextColor={colors.textSecondary}
              />
            </HStack>
          </VStack>

          {/* Phone */}
          <VStack gap={spacing.xs}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Phone Number *</Text>
            <HStack style={styles.inputRow}>
              <Phone size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </HStack>
          </VStack>

          {/* Role */}
          <VStack gap={spacing.xs}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Role / Work Type *</Text>
            <Pressable onPress={() => setShowRolePicker(!showRolePicker)}>
              <HStack style={styles.inputRow}>
                <Briefcase size={20} color={colors.textSecondary} />
                <Text
                  style={[styles.input, !selectedRole && { color: colors.textSecondary }]}
                >
                  {selectedRole ? `${selectedRole.icon} ${selectedRole.label}` : 'Select role'}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </HStack>
            </Pressable>

            {showRolePicker && (
              <Card style={styles.rolePicker}>
                {HELPER_ROLES.map((role) => (
                  <Pressable
                    key={role.id}
                    style={[
                      styles.roleOption,
                      form.role === role.id && styles.roleOptionSelected,
                    ]}
                    onPress={() => {
                      setForm({ ...form, role: role.id });
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={styles.roleEmoji}>{role.icon}</Text>
                    <Text
                      variant="body"
                      style={{ fontWeight: form.role === role.id ? '600' : '400' }}
                    >
                      {role.label}
                    </Text>
                    {form.role === role.id && (
                      <Check size={18} color={colors.brand[600]} style={styles.checkIcon} />
                    )}
                  </Pressable>
                ))}
              </Card>
            )}
          </VStack>

          {/* Working Days */}
          <VStack gap={spacing.sm}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Working Days</Text>
            <HStack style={styles.daysRow}>
              {DAYS.map((day) => (
                <Pressable
                  key={day}
                  style={[
                    styles.dayChip,
                    selectedDays.includes(day) && styles.dayChipSelected,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '600',
                      color: selectedDays.includes(day) ? '#ffffff' : colors.textSecondary,
                    }}
                  >
                    {day}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          {/* Working Hours */}
          <VStack gap={spacing.xs}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Working Hours</Text>
            <HStack style={styles.inputRow}>
              <Clock size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.workingHours}
                onChangeText={(t) => setForm({ ...form, workingHours: t })}
                placeholder="e.g., 8:00 AM - 12:00 PM"
                placeholderTextColor={colors.textSecondary}
              />
            </HStack>
          </VStack>

          {/* Monthly Pay */}
          <VStack gap={spacing.xs}>
            <Text variant="body" style={{ fontWeight: '500', color: colors.textSecondary }}>Monthly Pay (₹)</Text>
            <HStack style={styles.inputRow}>
              <IndianRupee size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                value={form.monthlyPay}
                onChangeText={(t) => setForm({ ...form, monthlyPay: t })}
                placeholder="e.g., 8000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </HStack>
          </VStack>
        </VStack>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text variant="body" style={{ fontWeight: '500' }}>💡 Tip</Text>
          <Text variant="caption" tone="secondary" style={styles.infoText}>
            After adding a helper, you can verify their background for ₹199.
            This includes Aadhaar verification, police records check, and address verification.
          </Text>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          label={isSubmitting ? 'Adding...' : 'Add Helper'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing[6],
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  form: {
    paddingHorizontal: spacing.lg,
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
    color: colors.foreground,
    paddingVertical: spacing.xs,
  },
  rolePicker: {
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  roleOptionSelected: {
    backgroundColor: colors.brand[50],
  },
  roleEmoji: {
    fontSize: 24,
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  daysRow: {
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipSelected: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
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
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  submitButton: {
    width: '100%',
  },
});
