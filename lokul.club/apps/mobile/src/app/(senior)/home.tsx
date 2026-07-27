/**
 * Senior Simplified Home
 * Route: /(senior)/home
 *
 * Shown when Simplified / Senior Mode is ON.
 * Design: large greeting, 4 oversized action tiles, recent alerts list.
 * All tap targets >= 64px. All text >= 18px.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Newspaper,
  Settings,
  Siren,
  Wallet,
  Wrench,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { OfflineBanner } from '@/components/OfflineBanner';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { HC_COLORS } from '@/hooks/useAccessibility';
import { fetchLocalityNews, type LocalityNewsItem } from '@/services/newsService';

function greeting(name: string | null) {
  const h = new Date().getHours();
  let timeOfDay: string;
  if (h < 12) {
    timeOfDay = 'Good Morning';
  } else if (h < 17) {
    timeOfDay = 'Good Afternoon';
  } else {
    timeOfDay = 'Good Evening';
  }
  const suffix = name ? ', ' + name : '';
  return timeOfDay + suffix;
}

interface ActionTile {
  id: string;
  label: string;
  sub: string;
  icon: typeof Newspaper;
  bg: string;
  route: string;
}

const TILES: ActionTile[] = [
  {
    id: 'feed',
    label: 'My Feed',
    sub: 'Neighbourhood news & updates',
    icon: Newspaper,
    bg: colors.brand[600],
    route: '/(tabs)/',
  },
  {
    id: 'services',
    label: 'Find Help',
    sub: 'Plumbers, electricians & more',
    icon: Wrench,
    bg: '#0D9488',
    route: '/(marketplace)/',
  },
  {
    id: 'sos',
    label: 'Emergency SOS',
    sub: 'Alert trusted contacts',
    icon: Siren,
    bg: '#DC2626',
    route: '/(safety)/hub',
  },
  {
    id: 'wallet',
    label: 'My Wallet',
    sub: 'Balance & transactions',
    icon: Wallet,
    bg: '#059669',
    route: '/(wallet)/',
  },
];

export default function SeniorHomeScreen() {
  const router     = useRouter();
  const name       = useOnboardingStore((s) => s.name);
  const pin        = useOnboardingStore((s) => s.pin);
  const city       = useOnboardingStore((s) => s.city) ?? undefined;
  const hc         = useAccessibilityStore((s) => s.highContrast);

  const bg = hc ? HC_COLORS.surface.background : colors.surface.surfaceMuted;

  const [alerts,     setAlerts]     = useState<LocalityNewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!pin) return;
    try {
      const items = await fetchLocalityNews({ pinCode: pin, city, lang: 'en' });
      setAlerts(items.filter((n) => n.isAlert).slice(0, 5));
    } catch {
      // non-critical
    }
  }, [pin, city]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load().finally(() => setTimeout(() => setRefreshing(false), 600));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <OfflineBanner />

      {/* Top bar */}
      <HStack gap={2} align="center" style={styles.topBar}>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => router.push('/(settings)/accessibility')}
          hitSlop={12}
          style={styles.settingsBtn}
          accessibilityRole="button"
          accessibilityLabel="Accessibility settings"
        >
          <Settings size={22} color={hc ? HC_COLORS.surface.heading : colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[600]]} />}
      >
        {/* Greeting */}
        <VStack gap={1} style={styles.greetWrap}>
          <Text style={[styles.greetText, hc && { color: HC_COLORS.surface.heading }]}>
            {greeting(name)}
          </Text>
          <Text style={[styles.greetSub, hc && { color: HC_COLORS.surface.textSecondary }]}>
            What would you like to do today?
          </Text>
        </VStack>

        {/* Action tiles — 2x2 grid */}
        <View style={styles.tilesGrid}>
          {TILES.map((tile) => (
            <Pressable
              key={tile.id}
              onPress={() => router.push(tile.route as any)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: tile.bg, opacity: pressed ? 0.88 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
              accessibilityHint={tile.sub}
            >
              <View style={styles.tileIconWrap}>
                <tile.icon size={32} color="#fff" strokeWidth={2} />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
              <Text style={styles.tileSub}>{tile.sub}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent alerts */}
        {alerts.length > 0 && (
          <VStack gap={3}>
            <HStack gap={2} align="center">
              <AlertTriangle size={18} color="#DC2626" />
              <Text style={[styles.sectionTitle, hc && { color: HC_COLORS.surface.heading }]}>
                Active Alerts
              </Text>
            </HStack>
            <VStack gap={2}>
              {alerts.map((a) => (
                <View
                  key={a.id}
                  style={[
                    styles.alertCard,
                    hc && { borderColor: HC_COLORS.surface.border, backgroundColor: HC_COLORS.surface.background },
                  ]}
                >
                  <Text style={[styles.alertTitle, hc && { color: HC_COLORS.surface.heading }]}>
                    {a.headline}
                  </Text>
                  {a.summary ? (
                    <Text style={[styles.alertSub, hc && { color: HC_COLORS.surface.textSecondary }]}>
                      {a.summary}
                    </Text>
                  ) : null}
                </View>
              ))}
            </VStack>
          </VStack>
        )}

        {/* Switch back to normal mode */}
        <Pressable
          onPress={() => router.push('/(tabs)/')}
          style={[styles.normalModeBtn, hc && { borderColor: HC_COLORS.surface.border }]}
          accessibilityRole="button"
          accessibilityLabel="Switch to standard mode"
        >
          <Text style={{ color: colors.brand[600], fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
            Switch to Standard Mode
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  topBar:     { paddingHorizontal: spacing[4], paddingTop: spacing[2], paddingBottom: spacing[1] },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface.background, alignItems: 'center', justifyContent: 'center' },
  scroll:     { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[16] },

  // Greeting
  greetWrap: { paddingVertical: spacing[2] },
  greetText: { fontSize: 28, fontWeight: '900', color: colors.surface.heading, lineHeight: 34 },
  greetSub:  { fontSize: 16, color: colors.surface.textSecondary, fontWeight: '500' },

  // Tiles
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  tile: {
    width: '47.5%', borderRadius: radius.xl,
    padding: spacing[4], gap: spacing[2],
    minHeight: 140,
  },
  tileIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  tileLabel: { fontSize: 18, fontWeight: '800', color: '#ffffff', lineHeight: 22 },
  tileSub:   { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 16, fontWeight: '500' },

  // Section
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.surface.heading },

  // Alerts
  alertCard: {
    backgroundColor: colors.surface.background, borderRadius: radius.lg,
    padding: spacing[4], borderWidth: 1, borderColor: '#FCA5A5',
    borderLeftWidth: 4, borderLeftColor: '#DC2626',
    gap: spacing[1],
  },
  alertTitle: { fontSize: 16, fontWeight: '700', color: colors.surface.heading },
  alertSub:   { fontSize: 14, color: colors.surface.textSecondary, lineHeight: 20 },

  // Normal mode
  normalModeBtn: {
    borderWidth: 2, borderColor: colors.surface.border,
    borderRadius: radius.xl, paddingVertical: spacing[4],
    backgroundColor: colors.surface.background,
  },
});
