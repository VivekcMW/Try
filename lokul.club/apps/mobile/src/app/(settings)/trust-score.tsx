// PRD §03 — Trust Score detail
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { computeTrust, TRUST_BAND_META } from '@/store/trustScore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function TrustScoreScreen() {
  const router = useRouter();
  const trust = computeTrust();
  const meta = TRUST_BAND_META[trust.band];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Trust Score</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card padding={6} elevation="sm" bordered style={{ alignItems: 'center', backgroundColor: meta.tint }}>
          <Text variant="caption" style={{ color: '#FFFFFFAA', fontWeight: '700', letterSpacing: 0.8 }}>LOKUL TRUST</Text>
          <Text style={{ color: '#fff', fontSize: 72, fontWeight: '800', marginTop: spacing[2] }}>{trust.total}</Text>
          <HStack gap={2} align="center" style={{ marginTop: -spacing[1] }}>
            <ShieldCheck size={16} color="#fff" />
            <Text variant="body" style={{ color: '#fff', fontWeight: '800' }}>{meta.label} band</Text>
          </HStack>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${trust.total}%` }]} />
          </View>
          <Text variant="caption" style={{ color: '#FFFFFFCC', marginTop: spacing[2] }}>
            Out of 100 · Updated continuously
          </Text>
        </Card>

        <Text variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase', color: colors.surface.textSecondary, letterSpacing: 0.6, marginTop: spacing[5] }}>
          What goes into your score
        </Text>

        <VStack gap={2.5} style={{ marginTop: spacing[2] }}>
          {trust.signals.map((s) => {
            const pct = (s.points / s.maxPoints) * 100;
            return (
              <Card key={s.label} padding={4} elevation="none" bordered>
                <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>{s.label}</Text>
                  <Text variant="body" style={{ fontWeight: '800', color: colors.brand[700] }}>
                    {s.points}<Text variant="caption" tone="secondary"> / {s.maxPoints}</Text>
                  </Text>
                </HStack>
                <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>{s.description}</Text>
                <View style={styles.signalBar}>
                  <View style={[styles.signalFill, { width: `${pct}%` }]} />
                </View>
              </Card>
            );
          })}
        </VStack>

        <Card padding={4} elevation="none" bordered style={{ marginTop: spacing[4], backgroundColor: colors.brand[50], borderColor: colors.brand[200] }}>
          <HStack gap={3} align="center">
            <View style={[styles.iconRing, { backgroundColor: colors.brand[100] }]}>
              <TrendingUp size={18} color={colors.brand[700]} />
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>Boost your score</Text>
              <Text variant="caption" tone="secondary">Complete Gold KYC, finish more peer orders, and keep ratings above 4.5.</Text>
            </VStack>
          </HStack>
        </Card>
      </ScrollView>
    </SafeAreaView>
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
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  bar: { width: '100%', height: 8, backgroundColor: '#FFFFFF33', borderRadius: 4, marginTop: spacing[4], overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: '#fff' },
  signalBar: { width: '100%', height: 6, backgroundColor: colors.gray[100], borderRadius: 3, marginTop: spacing[2], overflow: 'hidden' },
  signalFill: { height: 6, backgroundColor: colors.brand[600] },
  iconRing: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
