/**
 * PlusGate — wraps content that requires Lokul Plus (or Business).
 * If the user lacks the required subscription, shows an upgrade prompt.
 *
 * Usage:
 *   <PlusGate feature="ai_assistant">
 *     <AIAssistantContent />
 *   </PlusGate>
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { Button, Card, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useSubscriptionStore, PLUS_FEATURES, BUSINESS_FEATURES } from '@/store/subscriptionStore';

interface PlusGateProps {
  feature: string;
  children: ReactNode;
  /** Custom override text */
  title?: string;
  subtitle?: string;
}

export function PlusGate({ feature, children, title, subtitle }: PlusGateProps) {
  const canAccess = useSubscriptionStore((s) => s.canAccess);
  const router = useRouter();

  if (canAccess(feature)) return <>{children}</>;

  const isBusiness = BUSINESS_FEATURES.has(feature);
  const defaultTitle = isBusiness
    ? 'Lokul Business feature'
    : 'Lokul Plus feature';
  const defaultSubtitle = isBusiness
    ? 'Upgrade to Lokul Business to unlock merchant tools.'
    : 'Upgrade to Lokul Plus to access this feature.';

  return (
    <View style={styles.wrap}>
      <Card padding={5} elevation="sm" style={styles.card}>
        <VStack gap={4} align="center">
          <View style={styles.icon}>
            <Sparkles size={30} color={colors.brand[600]} />
          </View>
          <VStack gap={1.5} align="center">
            <Text variant="h3" style={{ textAlign: 'center', color: colors.surface.heading }}>
              {title ?? defaultTitle}
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              {subtitle ?? defaultSubtitle}
            </Text>
          </VStack>
          <Button
            label={isBusiness ? 'Upgrade to Business' : 'Upgrade to Plus'}
            onPress={() => router.push({ pathname: '/(plus)/upgrade', params: { feature } })}
            fullWidth
            size="lg"
          />
          <Pressable onPress={() => router.back()} accessibilityRole="button">
            <Text variant="caption" tone="secondary">Not now</Text>
          </Pressable>
        </VStack>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    backgroundColor: colors.surface.surfaceMuted,
  },
  card: { width: '100%', maxWidth: 380 },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${colors.brand[600]}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
