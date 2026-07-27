// PRD §06 — Edit business profile (name / category / hours)
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import {
  BIZ_CATEGORY_META,
  CATEGORY_GROUPS,
  MERCHANT_TYPE_MAP,
  useBusinessStore,
  type BizCategory,
} from '@/store/businessStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function EditBusinessPage() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const localBiz = useBusinessStore((s) => s.myBusiness);
  const updateBusiness = useBusinessStore((s) => s.updateBusiness);

  const [name, setName] = useState(localBiz?.name ?? '');
  const [category, setCategory] = useState<BizCategory>(localBiz?.category ?? 'kirana');
  const [hoursOpen, setHoursOpen] = useState(localBiz?.hoursOpen ?? '08:00');
  const [hoursClose, setHoursClose] = useState(localBiz?.hoursClose ?? '22:00');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants?userId=${userId}`);
      const data = await res.json();
      const list = Array.isArray(data?.merchants) ? data.merchants : [];
      const first = list[0];
      if (first) {
        if (first.name) setName(first.name);
        if (first.category) setCategory(first.category as BizCategory);
        if (first.hoursOpen) setHoursOpen(first.hoursOpen);
        if (first.hoursClose) setHoursClose(first.hoursClose);
      }
    } catch {
      // network failure — keep whatever was pre-filled from the local business store
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!userId || !name.trim()) {
      Alert.alert('Missing info', 'Business name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const merchantType = MERCHANT_TYPE_MAP[category];
      const res = await fetch(`${BASE}/api/mobile/merchants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userId, pinCode, name: name.trim(), category, merchantType,
          hoursOpen, hoursClose,
        }),
      });
      if (!res.ok) throw new Error('update failed');
      updateBusiness({ name: name.trim(), category, merchantType, hoursOpen, hoursClose });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save changes — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Edit business</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Business name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Business name"
              placeholderTextColor={colors.surface.textSecondary}
              style={styles.input}
            />
          </VStack>

          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Category</Text>
            {CATEGORY_GROUPS.map((group) => (
              <VStack key={group.type} gap={2}>
                <Text
                  variant="caption"
                  style={{ fontWeight: '700', color: colors.surface.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}
                >
                  {group.label}
                </Text>
                <View style={styles.catGrid}>
                  {group.categories.map((c) => {
                    const meta = BIZ_CATEGORY_META[c];
                    const active = category === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCategory(c)}
                        style={[styles.catBtn, active && { borderColor: meta.tint, backgroundColor: meta.tint + '18' }]}
                      >
                        <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
                        <Text variant="caption" style={{ fontWeight: '600', textAlign: 'center', fontSize: 11 }}>
                          {meta.label}
                        </Text>
                        {active && (
                          <View style={[styles.catCheck, { backgroundColor: meta.tint }]}>
                            <Check size={10} color="#fff" strokeWidth={3} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </VStack>
            ))}
          </VStack>

          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Hours</Text>
            <HStack gap={3}>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary" style={{ marginBottom: spacing[1] }}>Opens</Text>
                <TextInput value={hoursOpen} onChangeText={setHoursOpen} placeholder="08:00" style={styles.input} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary" style={{ marginBottom: spacing[1] }}>Closes</Text>
                <TextInput value={hoursClose} onChangeText={setHoursClose} placeholder="22:00" style={styles.input} />
              </View>
            </HStack>
          </VStack>

          <Button
            label={submitting ? 'Saving…' : 'Save changes'}
            onPress={save}
            disabled={submitting || loading}
            fullWidth
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    fontSize: 15,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catBtn: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    padding: spacing[1.5],
    position: 'relative',
  },
  catCheck: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
