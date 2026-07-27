// List a new item to lend.
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

type ItemCondition = 'excellent' | 'good' | 'fair';
type RentalType = 'free' | 'deposit' | 'rent';

const CATEGORY_OPTIONS = [
  { id: 'tools', label: 'Tools' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'games', label: 'Games' },
  { id: 'baby', label: 'Baby & Kids' },
  { id: 'sports', label: 'Sports' },
  { id: 'books', label: 'Books' },
  { id: 'camera', label: 'Camera' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'other', label: 'Other' },
];

const CONDITION_OPTIONS: { id: ItemCondition; label: string }[] = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
];

const RENTAL_OPTIONS: { id: RentalType; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'deposit', label: 'Deposit only' },
  { id: 'rent', label: 'Rent + deposit' },
];

export default function AddBorrowItemScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);

  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].id);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('good');
  const [rentalType, setRentalType] = useState<RentalType>('free');
  const [depositAmount, setDepositAmount] = useState('');
  const [rentPerDay, setRentPerDay] = useState('');
  const [maxDays, setMaxDays] = useState('3');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing item name', 'Please enter the item name.');
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    const maxDaysNum = Number(maxDays) || 1;
    const depositNum = depositAmount.trim() ? Math.round(Number(depositAmount) * 100) : undefined;
    const rentNum = rentPerDay.trim() ? Math.round(Number(rentPerDay) * 100) : undefined;

    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/borrow/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId,
          name: name.trim(),
          category,
          description: description.trim() || undefined,
          condition,
          rentalType,
          depositAmountPaise: rentalType === 'free' ? undefined : depositNum,
          rentPerDayPaise: rentalType === 'rent' ? rentNum : undefined,
          maxDays: maxDaysNum,
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      Alert.alert('Item listed', `${name.trim()} is now available to borrow.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Failed to list item', 'Please try again.');
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
        <Text variant="h3" style={{ fontWeight: '700' }}>List an Item</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Field label="Item Name">
            <TextInput
              style={styles.input}
              placeholder="e.g. Drill Machine"
              placeholderTextColor={colors.surface.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </Field>

          <Field label="Category">
            <ChipRow options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
          </Field>

          <Field label="Description">
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Describe the item and any usage notes"
              placeholderTextColor={colors.surface.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </Field>

          <Field label="Condition">
            <ChipRow options={CONDITION_OPTIONS} value={condition} onChange={(v) => setCondition(v as ItemCondition)} />
          </Field>

          <Field label="Rental Type">
            <ChipRow options={RENTAL_OPTIONS} value={rentalType} onChange={(v) => setRentalType(v as RentalType)} />
          </Field>

          {rentalType !== 'free' && (
            <Field label="Deposit Amount (₹)">
              <TextInput
                style={styles.input}
                placeholder="e.g. 500"
                placeholderTextColor={colors.surface.textSecondary}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
              />
            </Field>
          )}

          {rentalType === 'rent' && (
            <Field label="Rent per Day (₹)">
              <TextInput
                style={styles.input}
                placeholder="e.g. 200"
                placeholderTextColor={colors.surface.textSecondary}
                value={rentPerDay}
                onChangeText={setRentPerDay}
                keyboardType="numeric"
              />
            </Field>
          )}

          <Field label="Max Borrow Duration (days)">
            <TextInput
              style={styles.input}
              value={maxDays}
              onChangeText={setMaxDays}
              keyboardType="numeric"
            />
          </Field>

          <Button label={saving ? 'Listing…' : 'List Item'} onPress={handleSave} loading={saving} disabled={saving} fullWidth />
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

function ChipRow({ options, value, onChange }: { readonly options: { id: string; label: string }[]; readonly value: string; readonly onChange: (v: string) => void }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable key={opt.id} onPress={() => onChange(opt.id)} style={[styles.chip, active && styles.chipActive]}>
            <Text variant="caption" style={{ color: active ? '#fff' : colors.surface.foreground, fontWeight: '600' }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
