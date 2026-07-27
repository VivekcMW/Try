import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, MapPin } from 'lucide-react-native';
import { Button, Screen, Text, VStack, HStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function CommunitySetupDoneScreen() {
  const router = useRouter();
  const { societyName, city, pin, locationType } = useOnboardingStore();

  const locationSummary = [societyName, city ?? pin].filter(Boolean).join(', ');

  const next = () => router.replace('/(tabs)/profile');

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.container}>
        <View style={{ flex: 1 }} />

        <VStack gap={6} align="center" style={styles.body}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={48} color={colors.semantic.success} strokeWidth={1.5} />
          </View>

          <VStack gap={2} align="center">
            <Text variant="h2" style={{ textAlign: 'center' }}>
              Community mapped!
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              You&apos;re now connected to{' '}
              <Text variant="body" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                {locationSummary || 'your locality'}
              </Text>
              . Society features are now unlocked.
            </Text>
          </VStack>

          {locationType && locationType !== 'skip' ? (
            <HStack gap={2} align="center" style={styles.badge}>
              <MapPin size={14} color={colors.brand[600]} />
              <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '600' }}>
                {locationType === 'society' ? 'Society member' : 'Local resident'}
              </Text>
            </HStack>
          ) : null}
        </VStack>

        <View style={{ flex: 1 }} />

        <VStack gap={3} style={styles.footer}>
          <Button
            label="Back to profile"
            onPress={next}
            fullWidth
            size="lg"
          />
        </VStack>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    paddingHorizontal: spacing[6],
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.semantic.successBg ?? colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  badge: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    paddingTop: spacing[4],
  },
});
