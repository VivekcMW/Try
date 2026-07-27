/**
 * Help & Support Screen
 * Route: /(settings)/help-support
 *
 * Static FAQ + a real "Email support" action that opens the device mail
 * client addressed to Lokul's support inbox (same address used on the
 * lokul.club marketing site's Contact link).
 */
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, MessageCircleQuestion } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const SUPPORT_EMAIL = 'hello@lokul.club';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I trigger an SOS alert?',
    a: 'Open the Safety tab and tap the large SOS button. It counts down for a few seconds (so you can cancel accidental taps) before broadcasting your live location to your trusted contacts and nearby neighbours.',
  },
  {
    q: 'How do I add or edit trusted contacts?',
    a: 'Go to Safety → Trusted Contacts to add up to 5 people who are notified during an SOS or a missed Safe Journey check-in.',
  },
  {
    q: 'Why can\'t I add money to my wallet?',
    a: 'Wallet top-ups require at least Silver verification. Complete verification from the Verification screen, then retry Add Money.',
  },
  {
    q: 'How do I change my profile details?',
    a: 'Go to Settings → Edit Profile to update your name, photo and address details.',
  },
  {
    q: 'How is my data used?',
    a: 'See Settings → Privacy for full control over what other residents can see, and what is shared for analytics or ads.',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();

  const emailSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Lokul Support Request')}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Help & Support</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={emailSupport} style={styles.emailCard} accessibilityRole="button" accessibilityLabel="Email support">
          <View style={styles.iconWrap}>
            <Mail size={20} color={colors.brand[600]} />
          </View>
          <VStack gap={0} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Email support</Text>
            <Text variant="caption" tone="secondary">{SUPPORT_EMAIL}</Text>
          </VStack>
        </Pressable>

        <VStack gap={2} style={{ marginTop: spacing[5] }}>
          <HStack gap={2} align="center">
            <MessageCircleQuestion size={16} color={colors.gray[500]} />
            <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700', letterSpacing: 0.6 }}>
              FREQUENTLY ASKED QUESTIONS
            </Text>
          </HStack>
          <View style={styles.faqCard}>
            {FAQS.map((f, i) => (
              <VStack key={f.q} gap={1} style={StyleSheet.flatten([styles.faqRow, i < FAQS.length - 1 ? styles.faqRowBorder : undefined])}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{f.q}</Text>
                <Text variant="caption" tone="secondary" style={{ lineHeight: 18 }}>{f.a}</Text>
              </VStack>
            ))}
          </View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray[50] },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], paddingBottom: spacing[16] },
  emailCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: colors.surface.background, borderRadius: radius.lg, padding: spacing[4],
    borderWidth: 0.5, borderColor: colors.surface.border,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' },
  faqCard: {
    backgroundColor: colors.surface.background, borderRadius: radius.lg,
    borderWidth: 0.5, borderColor: colors.surface.border, overflow: 'hidden',
  },
  faqRow: { paddingHorizontal: spacing[4], paddingVertical: spacing[4] },
  faqRowBorder: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
});
