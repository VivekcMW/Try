// PRD §06 — Customer-facing business storefront page
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, MapPin, Phone, Star } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMerchant = {
  id: string; name: string; emoji?: string; category?: string; merchantType?: string;
  rating?: number; reviewCount?: number; isOpen?: boolean; phone?: string;
  bio?: string; tags?: string[];
};

export default function StorefrontPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [biz,     setBiz]     = useState<ApiMerchant | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/merchants/${id}`);
      const data = await res.json();
      setBiz(data);
    } catch { setBiz(null); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!biz) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Not found</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centerBox}>
          <Text variant="body" tone="secondary">Business not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleCTA() {
    if (biz?.merchantType === 'appointment') {
      router.push((`/(business)/book-slot/${biz.id}`) as never);
    } else if (biz?.merchantType === 'services') {
      router.push((`/(business)/request-quote/${biz.id}`) as never);
    }
  }

  let ctaLabel = '';
  if (biz.merchantType === 'retail')      ctaLabel = 'Browse & Order';
  else if (biz.merchantType === 'food')   ctaLabel = 'View Menu';
  else if (biz.merchantType === 'appointment') ctaLabel = 'Book Appointment';
  else if (biz.merchantType === 'services')    ctaLabel = 'Request a Quote';
  else                                         ctaLabel = 'Enquire / Enrol';

  const showCTA = biz.merchantType !== 'education';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>{biz.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: colors.brand[50] }]}>
          <HStack gap={3} align="center">
            <View style={styles.logoBox}>
              <Text style={{ fontSize: 36 }}>{biz.emoji ?? '🏪'}</Text>
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <Text variant="h2" style={{ fontWeight: '800' }}>{biz.name}</Text>
              <HStack gap={2} align="center">
                <Text variant="caption" tone="secondary">{biz.category}</Text>
                <Badge label={biz.isOpen ? 'OPEN' : 'CLOSED'} tone={biz.isOpen ? 'success' : 'neutral'} />
              </HStack>
              <HStack gap={1} align="center">
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Text variant="body" style={{ fontWeight: '700' }}>{(biz.rating ?? 0).toFixed(1)}</Text>
                <Text variant="caption" tone="secondary">({biz.reviewCount ?? 0} reviews)</Text>
              </HStack>
            </VStack>
          </HStack>
        </View>

        {/* Info strip */}
        <Card padding={4} elevation="xs" bordered style={{ marginBottom: spacing[3] }}>
          <VStack gap={2}>
            {biz.phone && (
              <HStack gap={2} align="center">
                <Phone size={15} color={colors.surface.textSecondary} />
                <Text variant="caption">{biz.phone}</Text>
              </HStack>
            )}
            {biz.bio && (
              <HStack gap={2} align="start">
                <MapPin size={15} color={colors.surface.textSecondary} style={{ marginTop: 1 }} />
                <Text variant="caption" style={{ flex: 1 }}>{biz.bio}</Text>
              </HStack>
            )}
          </VStack>
        </Card>

        {/* Tags */}
        {(biz.tags ?? []).length > 0 && (
          <View style={styles.tagRow}>
            {(biz.tags ?? []).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text variant="caption" style={{ fontWeight: '600', color: colors.brand[700] }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {showCTA && (
          <View style={{ marginTop: spacing[4] }}>
            <Button label={ctaLabel} onPress={handleCTA} fullWidth />
          </View>
        )}
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
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  banner: { borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[3] },
  logoBox: {
    width: 72, height: 72, borderRadius: radius.lg,
    backgroundColor: colors.brand[100], alignItems: 'center', justifyContent: 'center',
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] },
  tag: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1],
    borderRadius: radius.full, backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[100],
  },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
