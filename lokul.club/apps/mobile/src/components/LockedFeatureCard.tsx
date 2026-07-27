import { StyleSheet, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { Button, Card, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface LockedFeatureCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
}

/**
 * Gate overlay shown when a feature requires society membership.
 * Wrap the screen content with this when `societyId === null`.
 */
export function LockedFeatureCard({ title, description, ctaLabel, onPress }: LockedFeatureCardProps) {
  return (
    <View style={styles.overlay}>
      <Card padding={5} elevation="sm" style={styles.card}>
        <VStack gap={4} align="center">
          <View style={styles.iconCircle}>
            <Lock size={28} color={colors.brand[600]} strokeWidth={1.5} />
          </View>
          <VStack gap={1.5} align="center">
            <Text variant="h3" style={{ textAlign: 'center' }}>
              {title}
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              {description}
            </Text>
          </VStack>
          <Button label={ctaLabel} onPress={onPress} fullWidth size="lg" />
        </VStack>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
    backgroundColor: colors.surface.surfaceMuted,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
