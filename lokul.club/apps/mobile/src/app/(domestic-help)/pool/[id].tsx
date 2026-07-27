import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Languages,
  MessageCircle,
  User,
} from 'lucide-react-native';
import { Card, HStack, Text, VStack, Avatar } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiHelper = {
  id: string;
  name: string;
  photo: string | null;
  role: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  rating: number;
  reviews: number;
  recommendedBy: number;
  experience: string | null;
  areas: string[];
  availability: string | null;
  workingHours: string;
  languages: string[];
  monthlyRateMinPaise: number | null;
  monthlyRateMaxPaise: number | null;
  monthlyPayPaise: number;
  owner: { id: string; name: string };
};

export default function HelperPoolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = useWalletStore((s) => s.userId);
  const [helper, setHelper] = useState<ApiHelper | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers/${id}`);
      const data = await res.json();
      setHelper(res.ok ? data.helper : null);
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
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Helper</Text>
          <View style={{ width: 24 }} />
        </HStack>
        <View style={styles.notFound}>
          <User size={48} color={colors.textSecondary} />
          <Text variant="bodyLg" style={{ fontWeight: '500', marginTop: spacing.md }}>Helper not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleContact = async () => {
    if (!userId) {
      Alert.alert('Error', 'You need to be signed in to contact a helper.');
      return;
    }
    setContacting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/chat/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipientId: helper.owner.id }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/(chat)/thread/${data.id}` as never);
      } else {
        throw new Error('no thread id');
      }
    } catch {
      Alert.alert('Error', 'Could not start a conversation. Please try again.');
    } finally {
      setContacting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Helper Details</Text>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <VStack gap={spacing.md} style={{ alignItems: 'center' }}>
            <Avatar size="xl" name={helper.name} source={helper.photo ? { uri: helper.photo } : undefined} />
            <VStack style={{ alignItems: 'center' }}>
              <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
                <Text variant="h2" style={{ fontWeight: '700' }}>{helper.name}</Text>
                {helper.verificationStatus === 'verified' && <ShieldCheck size={20} color={colors.success} />}
              </HStack>
              <Text variant="bodyLg" tone="secondary">{helper.role}</Text>
              <HStack gap={spacing.xs} style={{ alignItems: 'center', marginTop: spacing.xs }}>
                <Star size={16} color={colors.warning} fill={colors.warning} />
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>{helper.rating}</Text>
                <Text variant="bodyLg" tone="secondary">({helper.reviews} reviews)</Text>
              </HStack>
            </VStack>
          </VStack>

          <Pressable
            style={[styles.contactButton, contacting && { opacity: 0.6 }]}
            onPress={handleContact}
            disabled={contacting}
          >
            <MessageCircle size={20} color="#ffffff" />
            <Text variant="body" style={{ color: '#ffffff', fontWeight: '600' }}>
              {contacting ? 'Starting…' : 'Contact'}
            </Text>
          </Pressable>
        </Card>

        <VStack gap={spacing.md} style={styles.section}>
          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Users size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Recommended by</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.recommendedBy ?? 0} neighbors</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Briefcase size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Experience</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.experience ?? '—'}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Areas Covered</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{(helper.areas ?? []).join(', ') || '—'}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Clock size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Availability</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.availability ?? helper.workingHours}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Languages size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Languages</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{(helper.languages ?? []).join(', ') || '—'}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={[styles.detailCard, { backgroundColor: colors.brand[50] }]}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" tone="secondary">Monthly Rate</Text>
              <Text variant="bodyLg" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {helper.monthlyRateMinPaise != null && helper.monthlyRateMaxPaise != null
                  ? `₹${Math.round(helper.monthlyRateMinPaise / 100).toLocaleString()} - ₹${Math.round(helper.monthlyRateMaxPaise / 100).toLocaleString()}`
                  : `₹${Math.round(helper.monthlyPayPaise / 100).toLocaleString()}`}
              </Text>
            </HStack>
          </Card>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  profileCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  contactButton: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[600],
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  detailCard: {
    padding: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: { height: 100 },
});
