// Bill reminders — lists upcoming (non-paid) bills with a reminder toggle.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, BellOff } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { type SavedBiller } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function BillRemindersScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [billers, setBillers] = useState<SavedBiller[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/bills/billers?ownerId=${userId}`);
      const data = await res.json();
      setBillers(res.ok ? data.billers : []);
    } catch {
      setBillers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const toggleReminder = async (id: string) => {
    setBillers((prev) => prev.map((b) => (b.id === id ? { ...b, reminderEnabled: !b.reminderEnabled } : b)));
    try {
      await fetch(`${BASE}/api/mobile/bills/billers/${id}`, { method: 'PATCH' });
    } catch {
      load();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  const upcoming = billers.filter((b) => b.status !== 'paid');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack align="center" gap={3} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>Bill Reminders</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        {upcoming.length === 0 && (
          <Card padding={6} elevation="none" bordered>
            <VStack align="center" gap={2}>
              <Bell size={40} color={colors.surface.textSecondary} />
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                No upcoming bills right now
              </Text>
            </VStack>
          </Card>
        )}

        <VStack gap={3}>
          {upcoming.map((biller) => (
            <Card key={biller.id} padding={4} elevation="xs" bordered>
              <HStack align="center" gap={3}>
                <View style={styles.icon}>
                  {biller.reminderEnabled
                    ? <Bell size={18} color={colors.brand[600]} />
                    : <BellOff size={18} color={colors.surface.textSecondary} />}
                </View>
                <VStack style={{ flex: 1 }} gap={0}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{biller.nickname}</Text>
                  <Text variant="caption" tone="secondary">
                    {biller.provider}{biller.dueDate ? ` • Due ${new Date(biller.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}
                  </Text>
                  {biller.lastBillAmountPaise != null && (
                    <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                      ₹{Math.round(biller.lastBillAmountPaise / 100).toLocaleString()}
                    </Text>
                  )}
                </VStack>
                <Switch
                  value={biller.reminderEnabled}
                  onValueChange={() => toggleReminder(biller.id)}
                  trackColor={{ true: colors.brand[400], false: colors.gray[300] }}
                />
              </HStack>
            </Card>
          ))}
        </VStack>
      </ScrollView>
    </SafeAreaView>
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
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
