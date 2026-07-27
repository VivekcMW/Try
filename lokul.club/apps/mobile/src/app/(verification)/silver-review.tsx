import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Clock, Hourglass, ScanLine, ShieldCheck } from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  HStack,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { proofMeta, useVerificationStore } from '@/store/verificationStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// Demo: auto-approve after this many seconds so a reviewer can walk the flow.
const DEMO_REVIEW_SEC = 12;

export default function SilverReviewScreen() {
  const router = useRouter();
  const userId       = useWalletStore((s) => s.userId);
  const silverDoc    = useVerificationStore((s) => s.silverDoc);
  const approveSilver = useVerificationStore((s) => s.approveSilver);

  const [remaining, setRemaining] = useState(DEMO_REVIEW_SEC);
  const rotate = useRef(new Animated.Value(0)).current;

  // Poll API every 10s to check if KYC tier was updated
  useEffect(() => {
    if (!userId) return;
    const poll = setInterval(async () => {
      try {
        const res  = await fetch(`${BASE}/api/mobile/kyc/status?userId=${userId}`);
        const data = await res.json();
        if (data.tier === 'silver' || data.tier === 'gold') {
          approveSilver();
          router.replace('/(verification)/silver-granted');
        }
      } catch {}
    }, 10000);
    return () => clearInterval(poll);
  }, [userId]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotate]);

  useEffect(() => {
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      approveSilver();
      router.replace('/(verification)/silver-granted');
    }
  }, [remaining, approveSilver, router]);

  const meta = silverDoc ? proofMeta[silverDoc.type] : null;
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Screen padded={false} scroll>
      <View style={styles.body}>
        <VStack gap={6} align="center">
          <View style={styles.iconWrap}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <ScanLine size={42} color={colors.brand[600]} strokeWidth={1.5} />
            </Animated.View>
            <View style={styles.ring} />
          </View>

          <VStack gap={2} align="center">
            <Badge label="Under review" tone="warning" size="md" />
            <Text variant="h1" style={{ textAlign: 'center' }}>
              Thanks — we're checking your proof
            </Text>
            <Text variant="bodyLg" tone="secondary" style={{ textAlign: 'center' }}>
              OCR scan runs in seconds. A human reviewer confirms within{' '}
              <Text variant="bodyLg" style={{ fontWeight: '700', color: colors.surface.heading }}>
                24 hours
              </Text>
              .
            </Text>
          </VStack>
        </VStack>

        <Card padding={4} elevation="sm" style={{ gap: spacing[3] }}>
          <HStack gap={3} align="center">
            <View style={styles.docIcon}>
              <ShieldCheck size={22} color={colors.semantic.success} />
            </View>
            <VStack gap={0.5} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700' }}>
                {meta?.title ?? 'Submitted document'}
              </Text>
              <Text variant="caption" tone="secondary">
                Uploaded just now · encrypted at rest
              </Text>
            </VStack>
          </HStack>

          <View style={styles.divider} />

          <Timeline />
        </Card>

        <Card padding={3} elevation="none" style={styles.notifCard}>
          <HStack gap={3} align="center">
            <Bell size={18} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[700], flex: 1 }}>
              We'll push a notification the moment your Silver tier is granted.
            </Text>
          </HStack>
        </Card>

        <HStack gap={2} align="center" justify="center">
          <Clock size={14} color={colors.surface.textSecondary} />
          <Text variant="caption" tone="secondary">
            Demo auto-approves in {remaining}s
          </Text>
        </HStack>
      </View>

      <View style={styles.footer}>
        <Button
          label="Back to feed"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}

function Timeline() {
  const rows: { label: string; state: 'done' | 'active' | 'idle' }[] = [
    { label: 'Document received', state: 'done' },
    { label: 'OCR + automated checks', state: 'active' },
    { label: 'Human reviewer approval', state: 'idle' },
  ];
  return (
    <VStack gap={2.5}>
      {rows.map((row, i) => (
        <HStack key={i} gap={3} align="center">
          <View
            style={[
              styles.dot,
              row.state === 'done' && { backgroundColor: colors.semantic.success },
              row.state === 'active' && { backgroundColor: colors.brand[600] },
              row.state === 'idle' && {
                backgroundColor: colors.surface.background,
                borderWidth: 2,
                borderColor: colors.surface.borderStrong,
              },
            ]}
          >
            {row.state === 'active' ? <Hourglass size={10} color="#fff" /> : null}
          </View>
          <Text
            variant="body"
            style={{
              color: row.state === 'idle' ? colors.surface.textSecondary : colors.surface.heading,
              fontWeight: row.state === 'active' ? '700' : '400',
            }}
          >
            {row.label}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[10],
    gap: spacing[6],
  },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: colors.brand[200],
    borderStyle: 'dashed',
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.surface.border },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: { backgroundColor: colors.brand[50] },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
