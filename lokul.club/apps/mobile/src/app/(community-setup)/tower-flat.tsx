import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building, DoorOpen, Home, MapPin } from 'lucide-react-native';
import {
  Button,
  HStack,
  Input,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { SOCIETIES } from '@/data/onboarding-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const ADDRESS_CONFIG = {
  independent: {
    title: "What's your house number?",
    houseLabelLabel: 'House / Door number',
    houseLabelPlaceholder: 'e.g. 14, B-12, Villa 7',
    icon: Home,
  },
  chawl: {
    title: "What's your room or floor?",
    houseLabelLabel: 'Room / Flat number',
    houseLabelPlaceholder: 'e.g. Room 4, Chawl 2/11',
    icon: Home,
  },
  business: {
    title: "What's your shop number?",
    houseLabelLabel: 'Shop number',
    houseLabelPlaceholder: 'e.g. Shop 3, Stall B-6',
    icon: MapPin,
  },
} as const;

export default function CommunityTowerFlatScreen() {
  const router = useRouter();
  const { societyId, societyName, tower, flat, locationType, setTowerFlat, setAddress } =
    useOnboardingStore();

  const isSocietyMode = locationType === 'society' || locationType === null;
  const society = useMemo(
    () => (isSocietyMode ? SOCIETIES.find((s) => s.id === societyId) : undefined),
    [isSocietyMode, societyId]
  );
  const towers = society?.towers ?? [];

  // Society mode state
  const [selectedTower, setSelectedTower] = useState<string | null>(tower);
  const [localFlat, setLocalFlat] = useState(flat);

  // Address mode state
  const [houseLabel, setHouseLabel] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const [error, setError] = useState<string | null>(null);

  const isValid = isSocietyMode
    ? selectedTower !== null && localFlat.trim().length >= 1
    : true; // address fields are always optional in non-society mode

  const submit = () => {
    if (isSocietyMode) {
      if (!selectedTower) {
        setError('Please select your tower.');
        return;
      }
      if (localFlat.trim().length === 0) {
        setError('Please enter your flat number.');
        return;
      }
      setTowerFlat({ tower: selectedTower, flat: localFlat.trim() });
    } else {
      setAddress({ houseLabel: houseLabel.trim(), streetAddress: streetAddress.trim() });
    }
    router.push('/(community-setup)/done');
  };

  const addressConfig =
    !isSocietyMode && locationType && locationType in ADDRESS_CONFIG
      ? ADDRESS_CONFIG[locationType as keyof typeof ADDRESS_CONFIG]
      : null;

  if (!isSocietyMode && addressConfig) {
    const AddressIcon = addressConfig.icon;
    return (
      <Screen padded={false}>
        <VStack gap={6} style={styles.body}>
          <VStack gap={2}>
            <View style={styles.iconBubble}>
              <AddressIcon size={22} color={colors.brand[600]} />
            </View>
            <Text variant="h2">{addressConfig.title}</Text>
            <Text variant="body" tone="secondary">
              This is private and only used to verify you&apos;re local. Never shown publicly.
            </Text>
          </VStack>

          <Input
            label={addressConfig.houseLabelLabel}
            placeholder={addressConfig.houseLabelPlaceholder}
            value={houseLabel}
            onChangeText={setHouseLabel}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={30}
            leftIcon={<DoorOpen size={18} color={colors.surface.textSecondary} />}
          />

          <Input
            label="Street / Lane / Area"
            placeholder="e.g. Laxmi Road, Gali no. 3"
            value={streetAddress}
            onChangeText={setStreetAddress}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={60}
            leftIcon={<MapPin size={18} color={colors.surface.textSecondary} />}
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          {houseLabel.trim() || streetAddress.trim() ? (
            <HStack align="center" gap={2} style={styles.preview}>
              <Text variant="caption" tone="secondary">
                Address preview:
              </Text>
              <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                {[houseLabel.trim(), streetAddress.trim()].filter(Boolean).join(', ')}
              </Text>
            </HStack>
          ) : null}
        </VStack>

        <View style={styles.footer}>
          <Button label="Continue" onPress={submit} fullWidth size="lg" />
          <Pressable
            onPress={() => router.push('/(community-setup)/done')}
            style={styles.skipLink}
          >
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              Skip, I&apos;ll add this later
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  // Society mode (locationType === 'society' or null for backward compat)
  return (
    <Screen padded={false}>
      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <View style={styles.iconBubble}>
            <Building size={22} color={colors.brand[600]} />
          </View>
          <Text variant="h2">Which tower & flat?</Text>
          <Text variant="body" tone="secondary">
            {societyName ? (
              <>
                We&apos;ll connect you with neighbours in{' '}
                <Text variant="body" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                  {societyName}
                </Text>
                .
              </>
            ) : (
              "We'll connect you with neighbours in your tower."
            )}
          </Text>
        </VStack>

        {towers.length > 0 ? (
          <VStack gap={2}>
            <Text variant="label" tone="secondary">
              Tower
            </Text>
            <View style={styles.towerWrap}>
              {towers.map((towerName) => {
                const isSelected = selectedTower === towerName;
                return (
                  <Pressable
                    key={towerName}
                    onPress={() => {
                      setSelectedTower(towerName);
                      if (error) setError(null);
                    }}
                    style={[
                      styles.towerChip,
                      isSelected && {
                        backgroundColor: colors.brand[600],
                        borderColor: colors.brand[600],
                      },
                    ]}
                  >
                    <Text
                      variant="body"
                      style={{
                        color: isSelected ? '#fff' : colors.surface.foreground,
                        fontWeight: '600',
                      }}
                    >
                      {towerName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text variant="caption" tone="secondary">
              Tower not listed? Type the name in your flat field as a prefix (e.g. &quot;E-101&quot;).
            </Text>
          </VStack>
        ) : (
          <Input
            label="Tower"
            placeholder="e.g. A, Tower 1, Spring"
            value={selectedTower ?? ''}
            onChangeText={setSelectedTower}
            autoCapitalize="characters"
          />
        )}

        <Input
          label="Flat number"
          placeholder="e.g. A-204, 1502, B/4"
          value={localFlat}
          onChangeText={(v) => {
            setLocalFlat(v);
            if (error) setError(null);
          }}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
          error={error ?? undefined}
          leftIcon={<DoorOpen size={18} color={colors.surface.textSecondary} />}
          returnKeyType="done"
          onSubmitEditing={submit}
          helper="We use this to verify you live here, never to share publicly."
        />

        {selectedTower && localFlat.trim() ? (
          <HStack align="center" gap={2} style={styles.preview}>
            <Text variant="caption" tone="secondary">
              Your address preview:
            </Text>
            <Text variant="caption" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
              {selectedTower} · {localFlat.trim()}
            </Text>
          </HStack>
        ) : null}
      </VStack>

      <View style={styles.footer}>
        <Button label="Continue" onPress={submit} disabled={!isValid} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
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
  towerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  towerChip: {
    paddingHorizontal: spacing[4],
    height: 44,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  preview: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.gray[100],
    borderRadius: radius.full,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
  skipLink: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
});
