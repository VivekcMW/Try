/**
 * Refer a Helper
 * Route: /(domestic-help)/refer
 *
 * Lets a neighbour recommend a helper to the community pool. The helper is
 * added as "unverified" (same as any self-added helper) and the referrer
 * earns ₹100 once the helper completes verification — that payout happens
 * from the verification flow (verify.tsx), not here.
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Gift } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const ROLES = [
  { id: 'maid', label: 'Maid / Domestic Help' },
  { id: 'cook', label: 'Cook' },
  { id: 'driver', label: 'Driver' },
  { id: 'nanny', label: 'Nanny / Babysitter' },
  { id: 'caretaker', label: 'Elderly Caretaker' },
];

export default function ReferHelperScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState(ROLES[0].id);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) {
      Alert.alert('Missing info', "Please add the helper's name and phone number.");
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    const role = ROLES.find((r) => r.id === roleId);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: trimmedName,
          phone: trimmedPhone,
          roleId,
          role: role?.label ?? 'Domestic Help',
          workingHours: 'Not set',
          notes: notes.trim() || undefined,
          pinCode,
          isPoolListed: true,
        }),
      });
      if (!res.ok) throw new Error('failed');

      Alert.alert(
        'Referral submitted',
        `${trimmedName} has been added for verification. You'll earn ₹100 once they're verified.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch {
      Alert.alert('Failed to submit', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Refer a Helper</Text>
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <VStack gap="lg">
          <View style={styles.rewardCard}>
            <Gift size={22} color={colors.brand[600]} />
            <Text variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
              Recommend a helper you trust. Once they complete verification, you earn ₹100.
            </Text>
          </View>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Helper's name</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. Sunita Devi"
                placeholderTextColor={colors.textDisabled}
                value={name}
                onChangeText={setName}
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Phone number</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputFlat}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={colors.textDisabled}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Role</Text>
            <View style={styles.chipsWrap}>
              {ROLES.map((role) => (
                <Pressable
                  key={role.id}
                  onPress={() => setRoleId(role.id)}
                  style={[styles.chip, roleId === role.id && styles.chipActive]}
                >
                  <Text variant="caption" style={{ fontWeight: '600', color: roleId === role.id ? '#fff' : colors.foreground }}>
                    {role.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          <VStack gap="xs">
            <Text variant="label" tone="secondary">Notes (optional)</Text>
            <View style={[styles.inputRow, styles.textAreaRow]}>
              <TextInput
                style={[styles.inputFlat, styles.textArea]}
                placeholder="How do you know them? How long have they worked nearby?"
                placeholderTextColor={colors.textDisabled}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </VStack>

          <Button label={saving ? 'Submitting…' : 'Submit Referral'} onPress={handleSubmit} disabled={saving} fullWidth />
        </VStack>
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { flex: 1 },
  form: { padding: spacing.lg },
  rewardCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  textAreaRow: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  inputFlat: { flex: 1, paddingVertical: spacing.sm, fontSize: 15, color: colors.foreground },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  bottomPadding: { height: 100 },
});
