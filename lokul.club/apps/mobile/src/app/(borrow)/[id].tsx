// Borrow item detail — fetches a single item from the real API.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, HandCoins } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiBorrowItem = {
  id: string;
  name: string;
  description: string;
  condition: 'excellent' | 'good' | 'fair';
  rentalType: 'free' | 'deposit' | 'rent';
  depositAmountPaise: number | null;
  rentPerDayPaise: number | null;
  maxDays: number;
  available: boolean;
  rating: number;
  borrowCount: number;
  owner: { id: string; name: string };
};

export default function BorrowItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [item, setItem] = useState<ApiBorrowItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/borrow/items/${id}`);
      const data = await res.json();
      setItem(res.ok ? data.item : null);
    } catch {
      setItem(null);
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

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack align="center" gap={3} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <ArrowLeft size={22} color={colors.surface.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Item not found</Text>
        </HStack>
        <View style={styles.notFound}>
          <Text variant="body" tone="secondary">This item is no longer listed.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRequestBorrow = () => {
    if (!item.available) {
      Alert.alert('Unavailable', 'This item is currently borrowed by someone else.');
      return;
    }
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    Alert.alert(
      'Request to borrow?',
      `Send a borrow request to ${item.owner.name} for "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async () => {
            setRequesting(true);
            try {
              const res = await fetch(`${BASE}/api/mobile/borrow/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  itemId: item.id,
                  requesterId: userId,
                  duration: `${item.maxDays} days`,
                }),
              });
              if (!res.ok) throw new Error('failed');
              Alert.alert('Request sent', `${item.owner.name} will be notified of your borrow request.`, [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Failed to send request', 'Please try again.');
            } finally {
              setRequesting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack align="center" gap={3} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>{item.name}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <HStack align="center" gap={2}>
          <Star size={16} color={colors.semantic.warning} fill={colors.semantic.warning} />
          <Text variant="body" style={{ fontWeight: '700' }}>{item.rating}</Text>
          <Text variant="caption" tone="secondary">• Borrowed {item.borrowCount}x</Text>
          {!item.available && (
            <View style={styles.unavailableBadge}>
              <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700' }}>Unavailable</Text>
            </View>
          )}
        </HStack>

        <Text variant="body" tone="secondary" style={{ marginTop: spacing[3] }}>{item.description}</Text>

        <Card padding={4} elevation="xs" bordered style={{ marginTop: spacing[4], gap: spacing[3] }}>
          <Row label="Owner" value={item.owner.name} />
          <Row label="Condition" value={item.condition} />
          <Row label="Max borrow duration" value={`${item.maxDays} days`} />
          <Row
            label="Terms"
            value={
              item.rentalType === 'free'
                ? 'Free to borrow'
                : item.rentalType === 'deposit'
                ? `₹${Math.round((item.depositAmountPaise ?? 0) / 100)} refundable deposit`
                : `₹${Math.round((item.rentPerDayPaise ?? 0) / 100)}/day + ₹${Math.round((item.depositAmountPaise ?? 0) / 100)} deposit`
            }
          />
        </Card>

        <View style={{ marginTop: spacing[6] }}>
          <Button
            label={item.available ? (requesting ? 'Sending…' : 'Request to Borrow') : 'Currently Unavailable'}
            onPress={handleRequestBorrow}
            disabled={!item.available || requesting}
            loading={requesting}
            fullWidth
            leftIcon={<HandCoins size={16} color="#fff" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <HStack style={{ justifyContent: 'space-between' }}>
      <Text variant="body" tone="secondary">{label}</Text>
      <Text variant="body" style={{ fontWeight: '700', textTransform: 'capitalize' }}>{value}</Text>
    </HStack>
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
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  unavailableBadge: {
    backgroundColor: colors.semantic.dangerBg,
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: radius.full,
    marginLeft: spacing[2],
  },
});
