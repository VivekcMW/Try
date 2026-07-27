import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import * as ImageManipulator from 'expo-image-manipulator';
import { ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react-native';
import { Avatar, Button, HStack, Input, Screen, Text, VStack } from '@/components/ui';
import { INTERESTS } from '@/data/onboarding-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useProfileStore } from '@/store/profileStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function EditProfileScreen() {
  const { t } = useTranslation('settings');
  const router = useRouter();
  const setOnboardingProfile = useOnboardingStore((s) => s.setProfile);
  const setOnboardingLocality = useOnboardingStore((s) => s.setLocality);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [photoUri, setPhotoUri] = useState<string | null>(profile.photoUri);
  const [city, setCity] = useState(profile.city ?? '');
  const [pin, setPin] = useState(profile.pin);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();
  const [cityError, setCityError] = useState<string | undefined>();
  const [pinError, setPinError] = useState<string | undefined>();

  useEffect(() => {
    setName(profile.name);
    setBio(profile.bio);
    setPhotoUri(profile.photoUri);
    setCity(profile.city ?? '');
    setPin(profile.pin);
  }, [profile]);

  const canSave = useMemo(() => name.trim().length >= 2 && pin.trim().length === 6 && !avatarLoading, [name, pin, avatarLoading]);

  const processAvatar = async (uri: string) => {
    setAvatarLoading(true);
    try {
      const compressed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 640 } }],
        { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(compressed.uri);
    } catch {
      setPhotoUri(uri);
      Alert.alert(t('permission_needed'), t('avatar_optimize_failed'));
    } finally {
      setAvatarLoading(false);
    }
  };

  const pickPhoto = async (mode: 'camera' | 'library') => {
    if (mode === 'library') {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('permission_needed'), t('photo_library_permission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await processAvatar(result.assets[0].uri);
      }
      return;
    }

    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permission_needed'), t('camera_permission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processAvatar(result.assets[0].uri);
    }
  };

  const validate = () => {
    let isValid = true;
    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedPin = pin.trim();

    setNameError(undefined);
    setCityError(undefined);
    setPinError(undefined);

    if (!trimmedName) {
      setNameError(t('validation_name_required'));
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError(t('validation_name_min'));
      isValid = false;
    }

    if (!trimmedPin) {
      setPinError(t('validation_pin_required'));
      isValid = false;
    } else if (!/^\d{6}$/.test(trimmedPin)) {
      setPinError(t('validation_pin_invalid'));
      isValid = false;
    }

    if (trimmedCity && trimmedCity.length < 2) {
      setCityError(t('validation_city_min'));
      isValid = false;
    }

    return isValid;
  };

  const saveProfile = async () => {
    if (!validate()) return;

    setSaving(true);
    const userId = useWalletStore.getState().userId;
    // Update local stores immediately
    updateProfile({ name: name.trim(), bio: bio.trim(), photoUri, city: city.trim() || null, pin: pin.trim() });
    setOnboardingProfile({ name: name.trim(), photoUri });
    setOnboardingLocality({ pin: pin.trim(), city: city.trim() || null });

    // Persist to API (best-effort)
    if (userId) {
      try {
        await fetch(`${BASE}/api/mobile/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), bio: bio.trim(), pinCode: pin.trim() }),
        });
      } catch {} // silently ignore network errors
    }

    setSaving(false);
    Alert.alert(t('saved'), t('saved_message'));
    router.back();
  };

  const interestLabelMap = useMemo(
    () => Object.fromEntries(INTERESTS.map((item) => [item.id, item.label])),
    []
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          {t('edit_profile_title')}
        </Text>
      </HStack>

      <Screen scroll padded={false} keyboardAvoiding>
        <VStack gap={5} style={styles.body}>
          <VStack gap={3} align="center">
            <Avatar source={photoUri ? { uri: photoUri } : undefined} name={name || t('profile_default_you')} size="xl" />
            {avatarLoading ? (
              <HStack gap={2} align="center">
                <ActivityIndicator color={colors.brand[600]} />
                <Text variant="caption" tone="secondary">{t('avatar_optimizing')}</Text>
              </HStack>
            ) : null}
            <HStack gap={2}>
              <Pressable onPress={() => pickPhoto('camera')} style={styles.photoBtn} disabled={avatarLoading || saving}>
                <Camera size={16} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '700' }}>
                  {t('camera')}
                </Text>
              </Pressable>
              <Pressable onPress={() => pickPhoto('library')} style={styles.photoBtn} disabled={avatarLoading || saving}>
                <ImageIcon size={16} color={colors.brand[600]} />
                <Text variant="caption" style={{ color: colors.brand[700], fontWeight: '700' }}>
                  {t('library')}
                </Text>
              </Pressable>
            </HStack>
          </VStack>

          <Input
            label={t('name_label')}
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (nameError) setNameError(undefined);
            }}
            placeholder={t('name_placeholder')}
            autoCapitalize="words"
            maxLength={48}
            error={nameError}
          />

          <Input
            label={t('bio_label')}
            value={bio}
            onChangeText={setBio}
            placeholder={t('bio_placeholder')}
            maxLength={140}
            multiline
            numberOfLines={3}
          />

          <Input
            label={t('phone_label')}
            value={profile.phone ?? ''}
            editable={false}
            helper={t('phone_readonly_helper')}
          />

          <HStack gap={3}>
            <View style={{ flex: 1 }}>
              <Input
                label={t('city_label')}
                value={city}
                onChangeText={(v) => {
                  setCity(v);
                  if (cityError) setCityError(undefined);
                }}
                placeholder={t('city_placeholder')}
                error={cityError}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label={t('pin_label')}
                value={pin}
                onChangeText={(v) => {
                  setPin(v.replace(/\D/g, '').slice(0, 6));
                  if (pinError) setPinError(undefined);
                }}
                placeholder={t('pin_placeholder')}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                error={pinError}
              />
            </View>
          </HStack>

          <VStack gap={2}>
            <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase' }}>
              {t('interests_title')}
            </Text>
            <View style={styles.interestsWrap}>
              {profile.interests.length ? (
                profile.interests.map((id) => (
                  <View key={id} style={styles.chip}>
                    <Text variant="caption" style={{ color: colors.surface.heading, fontWeight: '600' }}>
                      {interestLabelMap[id] ?? id}
                    </Text>
                  </View>
                ))
              ) : (
                <Text variant="caption" tone="secondary">{t('no_interests')}</Text>
              )}
            </View>
            <Button
              label={t('manage_interests')}
              variant="secondary"
              size="sm"
              onPress={() => router.push('/(onboarding)/edit-interests')}
            />
          </VStack>

          <Button
            label={t('save_changes')}
            onPress={saveProfile}
            loading={saving}
            fullWidth
            disabled={!canSave || avatarLoading}
          />
        </VStack>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand[200] ?? colors.brand[100],
    backgroundColor: colors.brand[50],
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
  },
});
