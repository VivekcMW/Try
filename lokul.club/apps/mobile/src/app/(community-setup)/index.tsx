import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Home, MapPin, Users } from 'lucide-react-native';
import { Button, Screen, Text, VStack, HStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function CommunitySetupIndexScreen() {
  const router = useRouter();

  const features = [
    {
      Icon: Users,
      title: 'Connect with neighbours',
      desc: 'Join your RWA notice board, polls & visitor log',
    },
    {
      Icon: Home,
      title: 'Verify your address',
      desc: 'Unlock Silver tier and start transacting locally',
    },
    {
      Icon: MapPin,
      title: 'Hyperlocal feed',
      desc: 'See posts from your society and street',
    },
  ];

  return (
    <Screen padded={false} scroll={false}>
      <View style={styles.container}>
        <VStack gap={6} style={styles.header}>
          <View style={styles.iconCircle}>
            <Home size={36} color={colors.brand[600]} strokeWidth={1.5} />
          </View>
          <VStack gap={2} align="center">
            <Text variant="h2" style={{ textAlign: 'center' }}>
              Map your community
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              Tell us where you live so we can connect you with your neighbours and unlock society features.
            </Text>
          </VStack>
        </VStack>

        <VStack gap={3} style={styles.features}>
          {features.map((item) => {
            const FeatureIcon = item.Icon;
            return (
              <HStack key={item.title} gap={4} align="center" style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <FeatureIcon size={22} color={colors.brand[600]} />
                </View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="label" style={{ color: colors.surface.heading }}>
                    {item.title}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {item.desc}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>

        <View style={{ flex: 1 }} />

        <VStack gap={3} style={styles.footer}>
          <Button
            label="Map my community"
            onPress={() => router.push('/(community-setup)/residence-type')}
            fullWidth
            size="lg"
          />
          <Button
            label="Maybe later"
            variant="ghost"
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
            fullWidth
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
  header: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[10],
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  features: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
  },
  featureCard: {
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
  },
});
