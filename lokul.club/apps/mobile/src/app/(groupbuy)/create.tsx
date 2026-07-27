// PRD §08 — Create group buy
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORIES = [
  { v: 'produce', label: 'Produce', emoji: '🍅' },
  { v: 'staples', label: 'Staples', emoji: '🌾' },
  { v: 'electronics', label: 'Electronics', emoji: '🔌' },
  { v: 'home', label: 'Home', emoji: '🛋' },
  { v: 'apparel', label: 'Apparel', emoji: '👗' },
  { v: 'other', label: 'Other', emoji: '📦' },
] as const;

const RADII: GbRadius[] = [0.5, 1, 2, 5];
type GbRadius = 0.5 | 1 | 2 | 5;

export default function CreateGroupBuy() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [market, setMarket] = useState('');
  const [unit, setUnit] = useState('piece');
  const [minQty, setMinQty] = useState('20');
  const [target, setTarget] = useState('50');
  const [hours, setHours] = useState('48');
  const [cat, setCat] = useState<typeof CATEGORIES[number]['v']>('produce');
  const [r, setR] = useState<GbRadius>(2);

  const [submitting, setSubmitting] = useState(false);

  const meta = CATEGORIES.find((c) => c.v === cat)!;

  const submit = async () => {
    if (!userId || !pinCode) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/group-buys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId: userId, pinCode, title, description: desc,
          pricePaise: Math.round((Number(price) || 0) * 100),
          marketPricePaise: Math.round((Number(market) || 0) * 100),
          unit, minQty: Number(minQty) || 1,
          targetQty: Number(target) || 1,
          closesAt: new Date(Date.now() + (Number(hours) || 24) * 3600000).toISOString(),
        }),
      });
      if (!res.ok) throw new Error('launch failed');
      router.replace('/(groupbuy)/' as never);
    } catch {
      Alert.alert('Error', 'Could not launch group buy — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PlusGate
      feature="group_buy_create"
      title="Plus feature: Group Buying"
      subtitle="Create and organise group buys for your community with Lokul Plus."
    >
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>New group buy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. Alphonso Mangoes (Devgad)" />
          <Field label="Describe the deal" value={desc} onChange={setDesc} placeholder="Source, quality, why bulk…" multiline />

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Category</Text>
            <View style={styles.row}>
              {CATEGORIES.map((c) => {
                const a = cat === c.v;
                return (
                  <Pressable key={c.v} onPress={() => setCat(c.v)} style={[styles.chip, a && styles.chipActive]}>
                    <Text variant="caption" style={{ fontWeight: '600' }}>{c.emoji} {c.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </VStack>

          <HStack gap={3}>
            <View style={{ flex: 1 }}><Field label="Group price (₹)" value={price} onChange={setPrice} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Field label="Market price (₹)" value={market} onChange={setMarket} keyboardType="numeric" /></View>
          </HStack>
          <Field label="Unit (kg / box / piece)" value={unit} onChange={setUnit} />

          <HStack gap={3}>
            <View style={{ flex: 1 }}><Field label="Min qty" value={minQty} onChange={setMinQty} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Field label="Target qty" value={target} onChange={setTarget} keyboardType="numeric" /></View>
            <View style={{ flex: 1 }}><Field label="Closes in (h)" value={hours} onChange={setHours} keyboardType="numeric" /></View>
          </HStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Radius</Text>
            <View style={styles.row}>
              {RADII.map((rad) => (
                <Pressable key={rad} onPress={() => setR(rad)} style={[styles.chip, r === rad && styles.chipActive]}>
                  <Text variant="caption" style={{ fontWeight: '600' }}>{rad < 1 ? `${rad * 1000}m` : `${rad}km`}</Text>
                </Pressable>
              ))}
            </View>
          </VStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label={submitting ? 'Launching…' : 'Launch group buy'} onPress={submit} disabled={!title || !price || submitting} fullWidth />
        </View>
      </View>
    </SafeAreaView>
    </PlusGate>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, multiline }: any) {
  return (
    <VStack gap={1.5}>
      <Text variant="caption" style={{ fontWeight: '700' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.surface.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
      />
    </VStack>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2.5],
    fontSize: 15, color: colors.surface.foreground, backgroundColor: colors.surface.background,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  chipActive: { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
  footer: {
    padding: spacing[4], paddingBottom: spacing[6], flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
});
