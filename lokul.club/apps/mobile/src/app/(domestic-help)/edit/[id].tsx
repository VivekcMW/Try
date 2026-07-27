import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiHelper = {
  id: string;
  name: string;
  phone: string | null;
  roleId: string | null;
  role: string;
  workingDays: string[];
  workingHours: string;
  monthlyPayPaise: number;
  photo: string | null;
};

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

export default function EditHelperScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [helper, setHelper] = useState<ApiHelper | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    role: '',
    workingHours: '',
    monthlyPay: '',
    photo: null as string | null,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers/${id}`);
      const data = await res.json();
      const h: ApiHelper | null = res.ok ? data.helper : null;
      setHelper(h);
      if (h) {
        setForm({
          name: h.name,
          phone: h.phone ?? '',
          role: h.roleId ?? '',
          workingHours: h.workingHours,
          monthlyPay: String(Math.round(h.monthlyPayPaise / 100)),
          photo: h.photo,
        });
        setSelectedDays(h.workingDays);
      }
    } catch {
      setHelper(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!helper) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Edit Helper</Text>
          <View style={{ width: 24 }} />
        </HStack>
        <View style={styles.notFound}>
          <User size={48} color={colors.textSecondary} />
          <Text variant="bodyLg" style={{ fontWeight: '500', marginTop: spacing.md }}>Helper not found</Text>
        </View>
      </SafeAreaView>
    );
  }

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

    setIsSubmitting(true);
    const selectedRoleMeta = HELPER_ROLES.find(r => r.id === form.role);

    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers/${helper.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          roleId: form.role,
          role: selectedRoleMeta?.label ?? form.role,
          workingDays: selectedDays,
          workingHours: form.workingHours.trim(),
          monthlyPayPaise: Math.round((Number(form.monthlyPay) || 0) * 100),
          photo: form.photo,
        }),
      });
      if (!res.ok) throw new Error('failed');
      router.back();
    } catch {
      Alert.alert('Failed to save', 'Please try again.');
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
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Edit Helper</Text>
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

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <Button
          label={isSubmitting ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit}
          disabled={isSubmitting}
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
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
});
