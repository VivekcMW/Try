import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Bell, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, HStack, Screen, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type PermCard = {
  icon: React.ReactNode;
  title: string;
  why: string;
};

export default function PermissionsScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const router = useRouter();
  const [requesting, setRequesting] = useState(false);

  const permCards: PermCard[] = [
    {
      icon: <MapPin size={28} color={colors.brand[600]} />,
      title: t('onboarding:perm_location_title'),
      why: t('onboarding:perm_location_why'),
    },
    {
      icon: <Bell size={28} color={colors.accent[500]} />,
      title: t('onboarding:perm_notification_title'),
      why: t('onboarding:perm_notification_why'),
    },
  ];

  const requestAll = async () => {
    setRequesting(true);
    try {
      await Location.requestForegroundPermissionsAsync();
      // Dynamically import to avoid crash when expo-notifications is not linked
      // @ts-expect-error: expo-notifications is optional
      const Notifications = await import('expo-notifications').catch(() => null);
      if (Notifications) {
        await Notifications.requestPermissionsAsync();
      }
    } catch {
      // Continue even if permission request fails
    } finally {
      setRequesting(false);
    }
    router.replace('/(onboarding)/phone');
  };

  const skip = () => router.replace('/(onboarding)/phone');

  return (
    <Screen padded={false} edges={['top', 'bottom', 'left', 'right']}>
      <VStack gap={0} style={styles.container}>
        {/* Top section */}
        <VStack gap={3} style={styles.header}>
          <View style={styles.iconCircle}>
            <MapPin size={36} color={colors.brand[600]} strokeWidth={1.5} />
          </View>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            {t('onboarding:perm_screen_title')}
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            {t('onboarding:perm_screen_subtitle')}
          </Text>
        </VStack>

        {/* Permission cards */}
        <VStack gap={3} style={styles.cards}>
          {permCards.map((card) => (
            <HStack
              key={card.title}
              gap={4}
              align="center"
              style={styles.permCard}
            >
              <View style={styles.permIconWrap}>{card.icon}</View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="label" style={{ color: colors.surface.heading }}>
                  {card.title}
                </Text>
                <Text variant="caption" tone="secondary">
                  {card.why}
                </Text>
              </VStack>
            </HStack>
          ))}
        </VStack>

        <View style={{ flex: 1 }} />

        {/* Footer actions */}
        <VStack gap={3} style={styles.footer}>
          <Button
            label={t('onboarding:perm_allow_all')}
            onPress={requestAll}
            loading={requesting}
            fullWidth
            size="lg"
          />
          <Button
            label={t('common:skip')}
            variant="ghost"
            onPress={skip}
            fullWidth
            size="lg"
          />
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            {t('onboarding:perm_footer_note')}
          </Text>
        </VStack>
      </VStack>
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
  cards: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
  },
  permCard: {
    padding: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  permIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
  },
});
