import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MapPin, Navigation2 } from 'lucide-react-native';
import {
  Button,
  HStack,
  Input,
  Screen,
  StepHeader,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { lookupCityForPin } from '@/data/onboarding-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function LocalityPickerScreen() {
  const router = useRouter();
  const { pin, city, setLocality } = useOnboardingStore();

  const [localPin, setLocalPin] = useState(pin);
  const [detectedCity, setDetectedCity] = useState<string | null>(city);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const isValidPin = useMemo(() => /^\d{6}$/.test(localPin), [localPin]);
  // Per FR-1.10 we ideally check against a postal-codes table. Here we accept
  // any 6-digit PIN and only label cities we know about.
  const cityForPin = useMemo(() => lookupCityForPin(localPin), [localPin]);

  const handlePinChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setLocalPin(digits);
    setDetectedCity(null);
    if (error) setError(null);
  };

  const detect = async () => {
    setDetecting(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Location off',
          'We need your location to auto-detect your PIN code. You can also enter it manually.'
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const places = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const place = places[0];
      if (place?.postalCode) {
        const detectedPin = place.postalCode.replace(/\D/g, '').slice(0, 6);
        setLocalPin(detectedPin);
        setDetectedCity(place.city ?? place.subregion ?? lookupCityForPin(detectedPin));
      } else {
        Alert.alert('Couldn’t detect', 'We couldn’t determine your PIN. Please enter it manually.');
      }
    } catch (e) {
      Alert.alert('Location error', 'Something went wrong while detecting your location.');
    } finally {
      setDetecting(false);
    }
  };

  const submit = () => {
    if (!isValidPin) {
      setError('Enter a valid 6-digit Indian PIN code.');
      return;
    }
    setLocality({ pin: localPin, city: detectedCity ?? cityForPin });
    router.push('/(onboarding)/welcome');
  };

  const displayCity = detectedCity ?? cityForPin;

  return (
    <Screen padded={false}>
      <StepHeader step={3} total={3} />

      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <View style={styles.iconBubble}>
            <MapPin size={22} color={colors.brand[600]} />
          </View>
          <Text variant="h2">Where do you live?</Text>
          <Text variant="body" tone="secondary">
            Your PIN code helps us show alerts, events and listings near you. We never share your
            exact location.
          </Text>
        </VStack>

        <Button
          label={detecting ? 'Detecting…' : 'Use my current location'}
          onPress={detect}
          loading={detecting}
          variant="secondary"
          leftIcon={<Navigation2 size={18} color={colors.brand[600]} />}
          fullWidth
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text variant="caption" tone="secondary">
            or enter manually
          </Text>
          <View style={styles.line} />
        </View>

        <VStack gap={2}>
          <Input
            label="PIN code"
            placeholder="6-digit PIN"
            value={localPin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            textContentType="postalCode"
            error={error ?? undefined}
            returnKeyType="done"
            onSubmitEditing={submit}
          />
          {displayCity ? (
            <HStack gap={2} align="center" style={styles.cityChip}>
              <MapPin size={14} color={colors.semantic.success} />
              <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '600' }}>
                {displayCity}
              </Text>
            </HStack>
          ) : null}
        </VStack>
      </VStack>

      <View style={styles.footer}>
        <Button label="Continue" onPress={submit} disabled={!isValidPin} fullWidth size="lg" />
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.surface.border,
  },
  cityChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: colors.semantic.successBg,
    borderRadius: radius.full,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
