import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowRight,
  Award,
  CalendarCheck,
  MessageCircle,
  PencilLine,
  ShoppingBag,
  Sparkles,
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
  { Icon: PencilLine, label: 'Post in the feed' },
  { Icon: MessageCircle, label: 'Chat unmuted' },
  { Icon: CalendarCheck, label: 'RSVP to events' },
  { Icon: ShoppingBag, label: 'Browse marketplace' },
];

export default function SilverGrantedScreen() {
  const router = useRouter();
  const name = useOnboardingStore((s) => s.name);

  return (
    <Screen padded={false} scroll>
      <View style={styles.body}>
        <VStack gap={6} align="center">
          <View style={styles.medal}>
            <Award size={56} color={colors.brand[600]} strokeWidth={1.5} />
            <View style={[styles.sparkle, { top: 6, right: 10 }]}>
              <Sparkles size={22} color={colors.accent[500]} />
            </View>
            <View style={[styles.sparkle, { bottom: 14, left: 4 }]}>
              <Sparkles size={16} color={colors.brand[500]} />
            </View>
          </View>

          <VStack gap={2} align="center">
            <Badge label="Silver verified" tone="brand" size="md" />
            <Text variant="h1" style={{ textAlign: 'center' }}>
              You're Silver, {name?.split(' ')[0] || 'neighbour'}! 🎉
            </Text>
            <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
              Your address proof was approved. Your neighbours can see your tier and you can
              now contribute to the community.
            </Text>
          </VStack>
        </VStack>

        <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
          <Text
            variant="label"
            tone="secondary"
            style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}
          >
            Unlocked just now
          </Text>
          <VStack gap={2.5}>
            {UNLOCKS.map(({ Icon, label }, i) => (
              <HStack key={i} gap={3} align="center">
                <View style={styles.unlockIcon}>
                  <Icon size={18} color={colors.brand[700]} />
                </View>
                <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                  {label}
                </Text>
              </HStack>
            ))}
          </VStack>
        </Card>

        <Card padding={4} elevation="none" bordered style={styles.upsell}>
          <HStack gap={3} align="center">
            <View style={styles.goldIcon}>
              <Award size={22} color={colors.accent[600]} />
            </View>
            <VStack gap={1} style={{ flex: 1 }}>
              <HStack gap={2} align="center">
                <Text variant="body" style={{ fontWeight: '700' }}>
                  Aim for Gold next?
                </Text>
                <Badge label="Gold" tone="warning" />
              </HStack>
              <Text variant="caption" tone="secondary">
                Aadhaar + selfie unlocks SOS broadcast, classifieds &gt; ₹10k and hosting events.
              </Text>
            </VStack>
          </HStack>
          <View style={{ height: spacing[3] }} />
          <Button
            label="Verify identity for Gold"
            variant="secondary"
            onPress={() => router.replace('/(verification)/gold-consent')}
            rightIcon={<ArrowRight size={18} color={colors.surface.foreground} />}
            fullWidth
          />
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
  medal: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkle: { position: 'absolute' },
  unlockIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  upsell: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[200],
  },
  goldIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
