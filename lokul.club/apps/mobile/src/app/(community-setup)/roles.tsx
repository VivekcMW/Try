import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bike,
  Car,
  CheckCircle2,
  Dumbbell,
  Heart,
  ShoppingCart,
  Sparkles,
  Store,
  UtensilsCrossed,
  Users,
  Wrench,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, Screen, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type Role = {
  id: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
};

export default function CommunityRolesScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const router = useRouter();
  const { setDeclaredRoles } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>([]);

  const roles: Role[] = [
    {
      id: 'cook',
      icon: <UtensilsCrossed size={28} color={colors.brand[600]} />,
      titleKey: 'onboarding:role_cook',
      descKey: 'onboarding:role_cook_desc',
    },
    {
      id: 'rider',
      icon: <Bike size={28} color={colors.accent[500]} />,
      titleKey: 'onboarding:role_rider',
      descKey: 'onboarding:role_rider_desc',
    },
    {
      id: 'coach',
      icon: <Dumbbell size={28} color={colors.semantic.warning} />,
      titleKey: 'onboarding:role_coach',
      descKey: 'onboarding:role_coach_desc',
    },
    {
      id: 'reseller',
      icon: <ShoppingCart size={28} color={colors.semantic.success} />,
      titleKey: 'onboarding:role_reseller',
      descKey: 'onboarding:role_reseller_desc',
    },
    {
      id: 'business',
      icon: <Store size={28} color={colors.brand[400]} />,
      titleKey: 'onboarding:role_business',
      descKey: 'onboarding:role_business_desc',
    },
    {
      id: 'maid',
      icon: <Sparkles size={28} color={colors.accent[600]} />,
      titleKey: 'onboarding:role_maid',
      descKey: 'onboarding:role_maid_desc',
    },
    {
      id: 'plumber',
      icon: <Wrench size={28} color={colors.brand[500]} />,
      titleKey: 'onboarding:role_plumber',
      descKey: 'onboarding:role_plumber_desc',
    },
    {
      id: 'organizer',
      icon: <Users size={28} color={colors.brand[700]} />,
      titleKey: 'onboarding:role_organizer',
      descKey: 'onboarding:role_organizer_desc',
    },
    {
      id: 'caretaker',
      icon: <Heart size={28} color={colors.semantic.warning} />,
      titleKey: 'onboarding:role_caretaker',
      descKey: 'onboarding:role_caretaker_desc',
    },
    {
      id: 'driver',
      icon: <Car size={28} color={colors.accent[400]} />,
      titleKey: 'onboarding:role_driver',
      descKey: 'onboarding:role_driver_desc',
    },
  ];

  const toggleRole = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const proceed = () => {
    setDeclaredRoles(selected);
    router.push('/(community-setup)/done');
  };

  const skip = () => {
    setDeclaredRoles([]);
    router.push('/(community-setup)/done');
  };

  return (
    <Screen padded={false}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing[4] }}>
        <VStack gap={2} style={styles.titleBlock}>
          <Text variant="h2">{t('onboarding:roles_title')}</Text>
          <Text variant="body" tone="secondary">
            {t('onboarding:roles_subtitle')}
          </Text>
        </VStack>

        <VStack gap={3} style={styles.list}>
          {roles.map((role) => {
            const active = selected.includes(role.id);
            return (
              <Pressable
                key={role.id}
                onPress={() => toggleRole(role.id)}
                style={[
                  styles.roleCard,
                  {
                    borderColor: active ? colors.brand[600] : colors.surface.border,
                    backgroundColor: active ? colors.brand[50] : colors.surface.background,
                  },
                ]}
              >
                <View style={styles.roleIcon}>{role.icon}</View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text
                    variant="label"
                    style={{ color: active ? colors.brand[700] : colors.surface.heading }}
                  >
                    {t(role.titleKey)}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {t(role.descKey)}
                  </Text>
                </VStack>
                {active ? (
                  <CheckCircle2 size={22} color={colors.brand[600]} />
                ) : (
                  <View style={styles.emptyCheck} />
                )}
              </Pressable>
            );
          })}
        </VStack>
      </ScrollView>

      <VStack gap={3} style={styles.footer}>
        <Button
          label={t('onboarding:roles_continue')}
          onPress={proceed}
          fullWidth
          size="lg"
        />
        <Button
          label={t('onboarding:roles_skip')}
          variant="ghost"
          onPress={skip}
          fullWidth
          size="lg"
        />
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  list: {
    paddingHorizontal: spacing[5],
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
});
