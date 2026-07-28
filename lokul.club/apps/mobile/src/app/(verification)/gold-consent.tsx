import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  Fingerprint,
  Lock,
  ShieldCheck,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  HStack,
  Screen,
  StepHeader,
  Text,
  VStack,
} from '@/components/ui';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const PERMS = [
  {
    Icon: BadgeCheck,
    title: 'Verify your name & address from Aadhaar',
    body: 'Used once to confirm you live where you claim. We do not store your Aadhaar number.',
  },
  {
    Icon: Lock,
    title: 'You stay in control',
    body: 'DigiLocker opens in a secure tab. You can cancel any time.',
  },
  {
    Icon: ShieldCheck,
    title: 'No data shared with neighbours',
    body: 'Only your Gold tier badge becomes visible — never your documents.',
  },
];

export default function GoldConsentScreen() {
  const router = useRouter();
  const consentAadhaar = useVerificationStore((s) => s.consentAadhaar);
  const [opening, setOpening] = useState(false);

  const handleOpen = async () => {
    setOpening(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/kyc/aadhaar/init`, { method: 'POST' });
      if (!res.ok) throw new Error(`KYC init failed: ${res.status}`);
      const { redirectUrl } = await res.json() as { redirectUrl: string };
      const result = await WebBrowser.openAuthSessionAsync(redirectUrl, 'lokul://kyc/callback');
      if (result.type === 'success' || result.type === 'cancel' || result.type === 'dismiss') {
        consentAadhaar();
        router.replace('/(verification)/gold-liveness');
      }
    } catch {
      Alert.alert('Could not start verification', 'Please try again or contact support.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Screen padded={false} scroll>
      <StepHeader step={1} total={2} />

      <View style={styles.body}>
        <VStack gap={4} align="center">
          <View style={styles.badge}>
            <Fingerprint size={42} color={colors.accent[600]} strokeWidth={1.5} />
          </View>
          <VStack gap={2} align="center">
            <Badge label="Gold tier" tone="warning" size="md" />
            <Text variant="h1" style={{ textAlign: 'center' }}>
              Aadhaar e-KYC consent
            </Text>
            <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
              We use DigiLocker — the Government of India's secure document vault — to fetch your
              verified identity. Nothing leaves your phone unencrypted.
            </Text>
          </VStack>
        </VStack>

        <Card padding={4} elevation="sm" style={{ gap: spacing[4] }}>
          {PERMS.map(({ Icon, title, body }, i) => (
            <HStack key={i} gap={3} align="center">
              <View style={styles.permIcon}>
                <Icon size={20} color={colors.brand[700]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {body}
                </Text>
              </VStack>
            </HStack>
          ))}
        </Card>

        <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          By continuing you agree to our{' '}
          <Text
            variant="caption"
            style={{ color: colors.brand[600], fontWeight: '600' }}
            onPress={() => Linking.openURL('https://lokul.in/terms')}
          >
            Terms
          </Text>{' '}
          and{' '}
          <Text
            variant="caption"
            style={{ color: colors.brand[600], fontWeight: '600' }}
            onPress={() => Linking.openURL('https://lokul.in/privacy')}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          label="Open DigiLocker"
          onPress={handleOpen}
          loading={opening}
          rightIcon={<ExternalLink size={18} color="#fff" />}
          fullWidth
          size="lg"
        />
        <View style={{ height: spacing[2] }} />
        <Button
          label="Skip for now"
          variant="ghost"
          onPress={() => { useVerificationStore.getState().skipVerification(); router.replace('/(tabs)'); }}
          fullWidth
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[6], gap: spacing[5] },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  permIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
