import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  CalendarPlus,
  Crown,
  Megaphone,
  Sparkles,
  Store,
  Trophy,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  HStack,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const UNLOCKS = [
  { Icon: Megaphone, label: 'Broadcast SOS to all neighbours' },
  { Icon: Store, label: 'List as a verified merchant' },
  { Icon: CalendarPlus, label: 'Host events & public meet-ups' },
  { Icon: Trophy, label: 'Eligible to become an RWA admin' },
];

export default function GoldGrantedScreen() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);

  return (
    <Screen padded={false} scroll>
      <View style={styles.body}>
        <VStack gap={6} align="center">
          <View style={styles.crownWrap}>
            <Crown size={60} color={colors.accent[600]} strokeWidth={1.5} />
            <View style={[styles.sparkle, { top: 4, right: 8 }]}>
              <Sparkles size={24} color={colors.accent[500]} />
            </View>
            <View style={[styles.sparkle, { bottom: 12, left: 4 }]}>
              <Sparkles size={18} color={colors.accent[400]} />
            </View>
            <View style={[styles.sparkle, { top: 24, left: -2 }]}>
              <Sparkles size={14} color={colors.brand[500]} />
            </View>
          </View>

          <VStack gap={2} align="center">
            <Badge label="Gold verified" tone="warning" size="md" />
            <Text variant="h1" style={{ textAlign: 'center' }}>
              You're now Gold, {name?.split(' ')[0] || 'neighbour'}!
            </Text>
            <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
              Your identity is verified end-to-end. You have the highest trust tier on Lokul —
              use it well.
            </Text>
          </VStack>
        </VStack>

        <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
          <Text
            variant="label"
            tone="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            New powers unlocked
          </Text>
          <VStack gap={2.5}>
            {UNLOCKS.map(({ Icon, label }, i) => (
              <HStack key={i} gap={3} align="center">
                <View style={styles.unlockIcon}>
                  <Icon size={18} color={colors.accent[700]} />
                </View>
                <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                  {label}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Card>

        <Card padding={4} elevation="none" style={styles.note}>
          <HStack gap={3} align="center">
            <Trophy size={20} color={colors.accent[700]} />
            <Text
              variant="caption"
              style={{ color: colors.accent[700], flex: 1, fontWeight: '600' }}
            >
              With great trust comes great responsibility. Misuse can downgrade your tier.
            </Text>
          </HStack>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          label="Open my feed"
          onPress={() => router.replace('/(tabs)')}
          rightIcon={<ArrowRight size={20} color="#fff" />}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[10],
    gap: spacing[6],
  },
  crownWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: colors.accent[200],
  },
  sparkle: { position: 'absolute' },
  unlockIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { backgroundColor: colors.accent[50] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
