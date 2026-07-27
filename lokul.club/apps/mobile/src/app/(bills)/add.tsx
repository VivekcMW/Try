// Add a saved biller.
import { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORY_OPTIONS = [
  { id: 'electricity', label: 'Electricity' },
  { id: 'gas', label: 'Gas' },
  { id: 'water', label: 'Water' },
  { id: 'broadband', label: 'Broadband' },
  { id: 'dth', label: 'DTH / Cable' },
  { id: 'mobile', label: 'Mobile Postpaid' },
  { id: 'creditcard', label: 'Credit Card' },
  { id: 'society', label: 'Society Maintenance' },
];

export default function AddBillerScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].id);
  const [provider, setProvider] = useState('');
  const [nickname, setNickname] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!provider.trim()) {
      Alert.alert('Missing biller name', 'Please enter the biller/provider name.');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Missing account number', 'Please enter the account/consumer number.');
      return;
    }
    const parsedAmount = amount.trim() ? Number(amount) : undefined;
    if (amount.trim() && (Number.isNaN(parsedAmount) || (parsedAmount ?? 0) < 0)) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/bills/billers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          category,
          provider: provider.trim(),
          accountNumber: accountNumber.trim(),
          nickname: nickname.trim() || provider.trim(),
          lastBillAmountPaise: parsedAmount != null ? Math.round(parsedAmount * 100) : undefined,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');

      Alert.alert('Biller added', `${provider.trim()} has been saved.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save the biller — please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack align="center" gap={3} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Add Biller</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Field label="Category">
            <View style={styles.chipRow}>
              {CATEGORY_OPTIONS.map((opt) => {
                const active = category === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setCategory(opt.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text variant="caption" style={{ color: active ? '#fff' : colors.surface.foreground, fontWeight: '600' }}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>

          <Field label="Biller / Provider Name">
            <TextInput
              style={styles.input}
              placeholder="e.g. Adani Electricity"
              placeholderTextColor={colors.surface.textSecondary}
              value={provider}
              onChangeText={setProvider}
            />
          </Field>

          <Field label="Nickname (optional)">
            <TextInput
              style={styles.input}
              placeholder="e.g. Home Electricity"
              placeholderTextColor={colors.surface.textSecondary}
              value={nickname}
              onChangeText={setNickname}
            />
          </Field>

          <Field label="Account / Consumer Number">
            <TextInput
              style={styles.input}
              placeholder="Enter account number"
              placeholderTextColor={colors.surface.textSecondary}
              value={accountNumber}
              onChangeText={setAccountNumber}
              autoCapitalize="characters"
            />
          </Field>

          <Field label="Last Bill Amount (optional)">
            <TextInput
              style={styles.input}
              placeholder="₹0"
              placeholderTextColor={colors.surface.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </Field>

          <Button label={saving ? 'Saving…' : 'Save Biller'} onPress={handleSave} loading={saving} disabled={saving} fullWidth />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <VStack gap={2}>
      <Text variant="label" tone="secondary">{label}</Text>
      {children}
    </VStack>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: colors.surface.foreground,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
