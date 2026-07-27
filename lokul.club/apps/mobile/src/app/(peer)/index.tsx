// PRD §05 — Peer roles hub
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { ROLE_META, usePeerStore, type PeerRole } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface RoleSection {
  readonly title: string;
  readonly roles: readonly PeerRole[];
}

const SECTIONS: RoleSection[] = [
  {
    title: '🍳 Home & Kitchen',
    roles: ['cook', 'tiffin_maker', 'baker', 'pickle_maker', 'caterer'],
  },
  {
    title: '📚 Education & Coaching',
    roles: ['tutor', 'coach', 'music_teacher', 'art_teacher', 'language_teacher', 'dance_teacher'],
  },
  {
    title: '🏥 Health & Wellness',
    roles: ['caretaker', 'physiotherapist', 'dietitian', 'home_nurse', 'yoga_instructor', 'massage_therapist', 'nanny'],
  },
  {
    title: '💅 Beauty & Lifestyle',
    roles: ['beautician', 'photographer', 'mehendi_artist', 'decorator', 'dj', 'pandit'],
  },
  {
    title: '🔧 Repairs & Technical',
    roles: ['handyman', 'mobile_repair', 'computer_repair', 'tailor', 'cobbler', 'watch_repair'],
  },
  {
    title: '🚚 Logistics & Commerce',
    roles: ['rider', 'reseller', 'courier', 'kiryana_agent', 'kabadiwala', 'laundry_person'],
  },
  {
    title: '💼 Professional Services',
    roles: ['accountant', 'legal_helper', 'interior_designer', 'graphic_designer'],
  },
];

export default function PeerHub() {
  const router = useRouter();
  const roles = usePeerStore((s) => s.roles);
  const tier = useVerificationStore((s) => s.tier);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>My Roles</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card padding={4} elevation="none" style={styles.intro}>
          <HStack gap={3} align="center">
            <View style={styles.introIcon}>
              <Sparkles size={20} color={colors.brand[700]} />
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>One profile, many roles</Text>
              <Text variant="caption" tone="secondary">
                Toggle a role to start earning from your neighbors. Silver KYC required.
              </Text>
            </VStack>
          </HStack>
        </Card>

        {tier === 'bronze' && (
          <Pressable onPress={() => router.push('/(verification)/silver-proof')}>
            <Card padding={3.5} elevation="none" bordered style={styles.lockCard}>
              <Text variant="caption" style={{ color: colors.semantic.warning, fontWeight: '700' }}>
                Complete Silver KYC to activate roles →
              </Text>
            </Card>
          </Pressable>
        )}

        <VStack gap={3} style={{ marginTop: spacing[4] }}>
          {SECTIONS.map((section) => (
            <VStack key={section.title} gap={2}>
              <Text variant="caption" style={styles.sectionTitle}>{section.title}</Text>
              {section.roles.map((r) => {
                const meta = ROLE_META[r];
                const state = roles[r];
                return (
                  <Pressable
                    key={r}
                    onPress={() => router.push(`/(peer)/${r}` as never)}
                    style={({ pressed }) => [pressed && { opacity: 0.85 }]}
                  >
                    <Card padding={4} elevation="xs" bordered>
                      <HStack gap={3} align="center">
                        <View style={[styles.roleIcon, { backgroundColor: meta.tint + '1A' }]}>
                          <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                        </View>
                        <VStack gap={1} style={{ flex: 1 }}>
                          <HStack gap={2} align="center">
                            <Text variant="body" style={{ fontWeight: '700' }}>{meta.label}</Text>
                            {state.active ? (
                              <Badge label="Active" tone="success" />
                            ) : (
                              <Badge label="Not active" tone="neutral" />
                            )}
                          </HStack>
                          <Text variant="caption" tone="secondary">{meta.tagline}</Text>
                          {state.active && (
                            <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '600' }}>
                              ₹ {(state.earningsPaise / 100).toLocaleString('en-IN')} earned · {state.completedOrders} orders
                            </Text>
                          )}
                        </VStack>
                        <ChevronRight size={18} color={colors.surface.textSecondary} />
                      </HStack>
                    </Card>
                  </Pressable>
                );
              })}
            </VStack>
          ))}
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
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  intro: { backgroundColor: colors.brand[50], borderColor: colors.brand[100], borderWidth: 1 },
  introIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCard: { marginTop: spacing[3], backgroundColor: colors.semantic.warningBg, borderColor: '#FCD34D' },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.surface.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing[2],
  },
});
