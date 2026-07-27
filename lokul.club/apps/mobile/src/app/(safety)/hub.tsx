/**
 * Safety Hub — Main Screen
 * Route: /(safety)/hub  (also mounted as (tabs)/safety)
 *
 * Sections:
 *   - SOS panic button (full-width, always visible)
 *   - Status card (journey active / contacts online)
 *   - Quick action row (Safe Journey, Report, Call Help, Evidence)
 *   - Volunteer banner (opt-in CTA)
 *   - Community alerts feed
 */
import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  Waypoints,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { OfflineBanner } from '@/components/OfflineBanner';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore } from '@/store/safetyStore';
import { useIncidentStore, type CommunityAlert } from '@/store/incidentStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#DC2626', high: '#EA580C', medium: '#D97706', low: '#059669',
};

function AlertSeparator() { return <View style={{ height: spacing[2] }} />; }

function AlertCard({ item }: { readonly item: CommunityAlert }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/(safety)/incident/[id]', params: { id: item.id } })}
      style={[styles.alertCard, { borderLeftColor: SEVERITY_COLOR[item.severity] ?? colors.gray[300] }]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <HStack gap={3} align="center">
        <View style={[styles.alertDot, { backgroundColor: SEVERITY_COLOR[item.severity] ?? colors.gray[300] }]} />
        <VStack gap={0} style={{ flex: 1 }}>
          <HStack gap={2} align="center">
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, flex: 1 }}>{item.title}</Text>
            {item.status === 'verified' && (
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={10} color={colors.brand[600]} />
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.brand[600] }}>Verified</Text>
              </View>
            )}
          </HStack>
          <Text variant="caption" tone="secondary" numberOfLines={2}>{item.body}</Text>
          <HStack gap={1} align="center" style={{ marginTop: 2 }}>
            <MapPin size={10} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">{item.pinCode}</Text>
            <Text variant="caption" tone="secondary">
              {' · '}{new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </HStack>
        </VStack>
        <ChevronRight size={16} color={colors.gray[400]} />
      </HStack>
    </Pressable>
  );
}

export default function SafetyHubScreen() {
  const router        = useRouter();
  const setupComplete = useSafetyStore((s) => s.setupComplete);
  const contacts      = useSafetyStore((s) => s.contacts);
  const journey       = useSafetyStore((s) => s.journey);
  const isVolunteer   = useSafetyStore((s) => s.isVolunteer);
  const pin           = useOnboardingStore((s) => s.pin);

  const { alerts, setAlerts, setLastFetched } = useIncidentStore();
  const [refreshing, setRefreshing] = useState(false);

  const loadAlerts = useCallback(async () => {
    if (!pin) return;
    try {
      const res  = await fetch(`${BASE}/api/mobile/safety/incidents?pinCode=${pin}&status=all`);
      const data = await res.json();
      setAlerts(data.items ?? []);
      setLastFetched();
    } catch { /* offline */ }
  }, [pin, setAlerts, setLastFetched]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts().finally(() => setTimeout(() => setRefreshing(false), 600));
  };

  // Gate: redirect to setup if not complete
  if (!setupComplete) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <VStack gap={5} align="center" style={styles.gateBody}>
          <Shield size={64} color={colors.brand[600]} />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.surface.heading, textAlign: 'center' }}>
            Set up your Safety Hub
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', lineHeight: 22 }}>
            Takes 2 minutes. Adds trusted contacts, medical ID and SOS triggers.
          </Text>
          <Pressable
            onPress={() => router.push('/(safety-setup)/welcome')}
            style={styles.setupBtn}
            accessibilityRole="button"
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Set Up Now</Text>
          </Pressable>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <OfflineBanner />

      <FlatList
        data={alerts}
        keyExtractor={(a) => a.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand[600]]} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <VStack gap={4}>
            {/* Page title */}
            <HStack gap={3} align="center" justify="between" style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Safety Hub</Text>
              <Pressable
                onPress={() => router.push('/(safety)/contacts')}
                style={styles.contactsBtn}
                accessibilityRole="button"
                accessibilityLabel="Manage trusted contacts"
              >
                <Users size={16} color={colors.brand[600]} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand[600] }}>
                  {contacts.length} contacts
                </Text>
              </Pressable>
            </HStack>

            {/* SOS Button — must be the biggest, most prominent thing */}
            <Pressable
              onPress={() => router.push('/(safety)/sos-active')}
              style={styles.sosBtn}
              accessibilityRole="button"
              accessibilityLabel="Activate SOS emergency alert"
              accessibilityHint="Sends your location to trusted contacts and calls nearby police"
            >
              <ShieldAlert size={40} color="#fff" strokeWidth={1.5} />
              <Text style={styles.sosLabel}>SOS</Text>
              <Text style={styles.sosSub}>Tap to send emergency alert</Text>
            </Pressable>

            {/* Journey active banner */}
            {journey && (
              <Pressable
                onPress={() => router.push('/(safety)/journey')}
                style={styles.journeyBanner}
                accessibilityRole="button"
              >
                <HStack gap={3} align="center">
                  <Waypoints size={20} color={colors.brand[600]} />
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                      Journey Active
                    </Text>
                    <Text variant="caption" tone="secondary">
                      To: {journey.destination} · Check-in due soon
                    </Text>
                  </VStack>
                  <ChevronRight size={16} color={colors.brand[600]} />
                </HStack>
              </Pressable>
            )}

            {/* Quick actions */}
            <VStack gap={2}>
              <Text variant="label" tone="secondary" style={styles.sectionLabel}>Quick Actions</Text>
              <HStack gap={2}>
                {[
                  { icon: Waypoints, label: 'Safe Journey', color: colors.brand[600],  route: '/(safety)/journey'         },
                  { icon: AlertTriangle, label: 'Report',   color: '#EA580C',            route: '/(safety)/incident-report' },
                  { icon: Phone,      label: 'Call Help',   color: '#059669',            route: '/(safety)/call-help'       },
                  { icon: Camera,     label: 'Evidence',    color: '#7C3AED',            route: '/(safety)/evidence'        },
                ].map(({ icon: Icon, label, color, route }) => (
                  <Pressable
                    key={label}
                    onPress={() => router.push(route as any)}
                    style={styles.quickTile}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                  >
                    <View style={[styles.quickIcon, { backgroundColor: `${color}15` }]}>
                      <Icon size={20} color={color} />
                    </View>
                    <Text style={styles.quickLabel}>{label}</Text>
                  </Pressable>
                ))}
              </HStack>
            </VStack>

            {/* Volunteer CTA */}
            {!isVolunteer && (
              <Pressable
                onPress={() => router.push('/(safety)/volunteer')}
                style={styles.volunteerBanner}
                accessibilityRole="button"
              >
                <HStack gap={3} align="center">
                  <ShieldCheck size={22} color="#059669" />
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '700', color: '#059669' }}>
                      Become a First Responder
                    </Text>
                    <Text variant="caption" tone="secondary">
                      Opt-in to help neighbours in emergencies
                    </Text>
                  </VStack>
                  <ChevronRight size={16} color="#059669" />
                </HStack>
              </Pressable>
            )}

            {/* Alerts header */}
            <HStack gap={2} align="center" justify="between">
              <Text variant="label" tone="secondary" style={styles.sectionLabel}>
                Community Alerts
              </Text>
              <Pressable
                onPress={() => router.push('/(safety)/incident-report')}
                accessibilityRole="button"
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.brand[600] }}>+ Report</Text>
              </Pressable>
            </HStack>
          </VStack>
        }
        renderItem={({ item }) => <AlertCard item={item} />}
        ItemSeparatorComponent={AlertSeparator}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShieldCheck size={40} color="#059669" />
            <Text variant="body" style={{ fontWeight: '700', color: '#059669', marginTop: spacing[3] }}>
              All clear in your locality
            </Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              No active safety alerts in your area
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  list:       { padding: spacing[4], paddingBottom: spacing[16] },
  pageHeader: { paddingTop: spacing[2] },
  pageTitle:  { fontSize: 24, fontWeight: '900', color: colors.surface.heading },
  contactsBtn:{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: `${colors.brand[600]}10`, paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, fontWeight: '700', color: colors.surface.textSecondary },

  // SOS Button
  sosBtn:  { backgroundColor: '#DC2626', borderRadius: radius.xl, padding: spacing[6], alignItems: 'center', gap: spacing[2], shadowColor: '#DC2626', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20, elevation: 10 },
  sosLabel:{ fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  sosSub:  { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },

  // Journey banner
  journeyBanner: { backgroundColor: `${colors.brand[600]}10`, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: `${colors.brand[600]}30` },

  // Quick actions
  quickTile:  { flex: 1, backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[3], alignItems: 'center', gap: spacing[1] },
  quickIcon:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '700', color: colors.surface.heading, textAlign: 'center' },

  // Volunteer
  volunteerBanner: { backgroundColor: '#ECFDF5', borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: '#A7F3D0' },

  // Alert cards
  alertCard:    { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], borderLeftWidth: 4 },
  alertDot:     { width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 4 },
  verifiedBadge:{ flexDirection: 'row', gap: 3, alignItems: 'center', backgroundColor: `${colors.brand[600]}10`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm },

  // Gate
  gateBody:  { flex: 1, padding: spacing[8] },
  setupBtn:  { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], paddingHorizontal: spacing[10] },

  // Empty
  empty: { alignItems: 'center', paddingVertical: spacing[10] },
});
