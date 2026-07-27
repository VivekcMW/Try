import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BadgeCheck,
  Calendar,
  Car,
  Compass,
  HandHeart,
  Hammer,
  Map,
  Megaphone,
  Search,
  ShieldAlert,
  ShoppingBag,
  Store,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const MODULES = [
  { Icon: Store,       label: 'Services',        desc: 'Plumbers · electricians · maids',   route: '/(marketplace)/',         featureKey: 'services'         },
  { Icon: BadgeCheck,  label: 'Local Shops',     desc: 'Nearby shops & businesses',         route: '/(peer)/',                featureKey: 'shop_directory'   },
  { Icon: Car,         label: 'Carpool',         desc: 'Share rides with neighbours',       route: '/(discover)/carpool',     featureKey: 'carpool'          },
  { Icon: ShoppingBag, label: 'Group Buy',       desc: 'Buy together, save more',           route: '/(groupbuy)/index',       featureKey: 'group_buying'     },
  { Icon: Megaphone,   label: 'Classifieds',     desc: 'Buy · sell · free items',           route: '/(classifieds)/',         featureKey: 'classifieds'      },
  { Icon: Calendar,    label: 'Events',          desc: 'Society meet-ups & festivals',      route: '/(community)/events',     featureKey: 'events'           },
  { Icon: UsersRound,  label: 'Communities',     desc: 'Groups & interest clubs',           route: '/(groups)/discover',      featureKey: 'feed'             },
  { Icon: HandHeart,   label: 'Lost & Found',    desc: 'Report or find lost items',         route: '/(community)/lost-found', featureKey: 'lost_found'       },
  { Icon: Wallet,      label: 'Wallet',          desc: 'Payments & transactions',           route: '/(wallet)/',              featureKey: 'wallet'           },
  { Icon: ShieldAlert, label: 'Safety',          desc: 'Emergency contacts & SOS',          route: '/(tabs)/safety',          featureKey: 'safety_contacts'  },
  { Icon: Hammer,      label: 'Visitors',        desc: 'Gate entry management',             route: '/(community)/visitors',   featureKey: 'rwa_management'   },
  { Icon: Map,         label: 'Map',             desc: 'Discover nearby on the map',        route: '/(discover)/map',         featureKey: 'parking_sharing'  },
];

type SearchResults = {
  merchants:   { id: string; name: string; category: string }[];
  communities: { id: string; name: string; type: string; memberCount: number }[];
  listings:    { id: string; title: string; category: string; user: { id: string; name: string } }[];
};

export default function ExploreScreen() {
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const { isEnabled } = useFeatureFlags();
  const [q,       setQ]       = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter modules based on enabled feature flags
  const visibleModules = useMemo(
    () => MODULES.filter((m) => isEnabled(m.featureKey)),
    [isEnabled]
  );

  const search = useCallback(async (text: string) => {
    if (text.length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/search?q=${encodeURIComponent(text)}&pinCode=${pinCode}`);
      const data = await res.json();
      setResults(data.results ?? null);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  const handleChange = (text: string) => {
    setQ(text);
    search(text);
  };

  const hasResults = results &&
    (results.merchants.length > 0 || results.communities.length > 0 || results.listings.length > 0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <VStack gap={1.5}>
          <Text variant="h1" style={{ color: colors.surface.heading }}>Explore</Text>
          <Text variant="body" tone="secondary">
            Discover trusted neighbours, services & happenings around you.
          </Text>
        </VStack>

        {/* Live search box */}
        <Card padding={3.5} elevation="none" style={styles.search}>
          <HStack gap={2.5} align="center">
            <Search size={18} color={colors.surface.textSecondary} />
            <TextInput
              value={q}
              onChangeText={handleChange}
              placeholder="Search merchants, peer roles, communities…"
              placeholderTextColor={colors.surface.textSecondary}
              style={styles.searchInput}
              returnKeyType="search"
            />
            {loading && <ActivityIndicator size="small" color={colors.brand[500]} />}
          </HStack>
        </Card>

        {/* Search results */}
        {q.length >= 2 && (
          <VStack gap={3}>
            {!hasResults && !loading && (
              <Text variant="caption" tone="secondary" style={{ textAlign: 'center', paddingVertical: spacing[6] }}>
                No results for "{q}"
              </Text>
            )}

            {results && results.merchants.length > 0 && (
              <VStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>MERCHANTS</Text>
                {results.merchants.map((m) => (
                  <Pressable key={m.id} onPress={() => router.push(`/(marketplace)/merchant/${m.id}` as never)}>
                    <Card padding={3} elevation="xs">
                      <Text variant="body" style={{ fontWeight: '700' }}>{m.name}</Text>
                      <Text variant="caption" tone="secondary" style={{ textTransform: 'capitalize' }}>{m.category}</Text>
                    </Card>
                  </Pressable>
                ))}
              </VStack>
            )}

            {results && results.listings.length > 0 && (
              <VStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>PEER ROLES</Text>
                {results.listings.map((l) => (
                  <Pressable key={l.id} onPress={() => router.push(`/(peer)/profile/${l.user.id}` as never)}>
                    <Card padding={3} elevation="xs">
                      <Text variant="body" style={{ fontWeight: '700' }}>{l.title}</Text>
                      <Text variant="caption" tone="secondary">{l.user.name} · {l.category}</Text>
                    </Card>
                  </Pressable>
                ))}
              </VStack>
            )}

            {results && results.communities.length > 0 && (
              <VStack gap={2}>
                <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>COMMUNITIES</Text>
                {results.communities.map((c) => (
                  <Pressable key={c.id} onPress={() => router.push(`/(groups)/home/${c.id}` as never)}>
                    <Card padding={3} elevation="xs">
                      <Text variant="body" style={{ fontWeight: '700' }}>{c.name}</Text>
                      <Text variant="caption" tone="secondary">{c.memberCount} members · {c.type}</Text>
                    </Card>
                  </Pressable>
                ))}
              </VStack>
            )}
          </VStack>
        )}

        {/* Module grid (show when not searching) */}
        {q.length < 2 && (
          <VStack gap={3}>
            {visibleModules.map(({ Icon, label, desc, route }) => (
              <Pressable key={label} onPress={() => router.push(route as never)} accessibilityRole="button">
                <Card padding={4} elevation="sm">
                  <HStack gap={3} align="center">
                    <View style={[styles.iconBox, { backgroundColor: colors.brand[50] }]}>
                      <Icon size={20} color={colors.brand[700]} />
                    </View>
                    <VStack gap={0.5} style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{label}</Text>
                      <Text variant="caption" tone="secondary">{desc}</Text>
                    </VStack>
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  content:     { padding: spacing[5], gap: spacing[5], paddingBottom: spacing[16] },
  search:      { backgroundColor: colors.surface.background },
  searchInput: { flex: 1, height: 36, color: colors.surface.foreground, fontSize: 14 },
  iconBox: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
});
