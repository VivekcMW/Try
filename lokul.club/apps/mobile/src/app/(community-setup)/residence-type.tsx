import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Check, Home, Layers, MapPin, Store } from 'lucide-react-native';
import {
  Button,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore, type LocationType } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type Option = {
  type: LocationType;
  Icon: typeof Home;
  label: string;
  sublabel: string;
  route: string;
};

const OPTIONS: Option[] = [
  {
    type: 'society',
    Icon: Building2,
    label: 'Gated Society / Apartment Complex',
    sublabel: 'Has an RWA or management committee',
    route: '/(community-setup)/society',
  },
  {
    type: 'independent',
    Icon: Home,
    label: 'Independent House / Villa',
    sublabel: 'Standalone house, bungalow, row house',
    route: '/(community-setup)/tower-flat',
  },
  {
    type: 'chawl',
    Icon: Layers,
    label: 'Apartment / Chawl / PG',
    sublabel: 'No RWA — chawl, co-living, paying guest',
    route: '/(community-setup)/tower-flat',
  },
  {
    type: 'business',
    Icon: Store,
    label: 'Shop / Business',
    sublabel: "I'm joining for my local business",
    route: '/(community-setup)/tower-flat',
  },
  {
    type: 'skip',
    Icon: MapPin,
    label: 'Just use my locality',
    sublabel: 'Skip address — use my PIN code only',
    route: '/(community-setup)/done',
  },
];

export default function CommunityResidenceTypeScreen() {
  const router = useRouter();
  const { setLocationType } = useOnboardingStore();
  const [selected, setSelected] = useState<LocationType>(null);

  const selectedOption = OPTIONS.find((o) => o.type === selected);

  const submit = () => {
    if (!selected || !selectedOption) return;
    setLocationType(selected);
    router.push(selectedOption.route as never);
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <VStack gap={6}>
          <VStack gap={2}>
            <View style={styles.iconBubble}>
              <Home size={22} color={colors.brand[600]} />
            </View>
            <Text variant="h2">What kind of place do you live in?</Text>
            <Text variant="body" tone="secondary">
              This helps us connect you with the right neighbours. You can always update this later.
            </Text>
          </VStack>

          <VStack gap={2}>
            {OPTIONS.map((opt) => {
              const isSelected = selected === opt.type;
              const OptionIcon = opt.Icon;
              return (
                <Pressable
                  key={opt.type}
                  onPress={() => setSelected(opt.type)}
                  style={[
                    styles.card,
                    isSelected && {
                      borderColor: colors.brand[600],
                      backgroundColor: colors.brand[50],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.cardIcon,
                      isSelected && { backgroundColor: colors.brand[100] },
                    ]}
                  >
                    <OptionIcon
                      size={20}
                      color={isSelected ? colors.brand[700] : colors.brand[500]}
                    />
                  </View>

                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text
                      variant="body"
                      style={{
                        color: isSelected ? colors.brand[700] : colors.surface.heading,
                        fontWeight: '600',
                      }}
                    >
                      {opt.label}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {opt.sublabel}
                    </Text>
                  </VStack>

                  <View
                    style={[
                      styles.radio,
                      isSelected && {
                        backgroundColor: colors.brand[600],
                        borderColor: colors.brand[600],
                      },
                    ]}
                  >
                    {isSelected ? <Check size={12} color="#fff" strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Continue"
          onPress={submit}
          disabled={!selected}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
});
