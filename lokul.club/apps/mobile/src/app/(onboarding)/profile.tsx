import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, User } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Button,
  HStack,
  Input,
  Screen,
  StepHeader,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function ProfileBasicsScreen() {
  const { t } = useTranslation(['onboarding', 'common']);
  const router = useRouter();
  const { name, photoUri, setProfile } = useOnboardingStore();
  const [localName, setLocalName] = useState(name);
  const [localPhoto, setLocalPhoto] = useState<string | null>(photoUri);
  const [error, setError] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permission_needed'), t('permission_library'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('permission_needed'), t('permission_camera'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhoto(result.assets[0].uri);
    }
  };

  const canContinue = localName.trim().length >= 2;

  const submit = () => {
    if (!canContinue) {
      setError(t('your_name_error'));
      return;
    }
    setProfile({ name: localName.trim(), photoUri: localPhoto });
    router.push('/(onboarding)/locality');
  };

  return (
    <Screen padded={false}>
      <StepHeader step={2} total={3} />

      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <Text variant="h2">{t('profile_title')}</Text>
          <Text variant="body" tone="secondary">
            {t('profile_subtitle')}
          </Text>
        </VStack>

        <VStack gap={3} align="center">
          <View style={styles.avatarWrap}>
            <Avatar
              source={localPhoto ? { uri: localPhoto } : undefined}
              name={localName || 'You'}
              size="xl"
            />
            {!localPhoto ? (
              <View style={styles.avatarOverlay}>
                <User size={28} color={colors.gray[400]} />
              </View>
            ) : null}
          </View>
          <HStack gap={3}>
            <Pressable onPress={takePhoto} style={styles.photoBtn} hitSlop={8}>
              <Camera size={16} color={colors.brand[600]} />
              <Text variant="label" style={{ color: colors.brand[600], fontWeight: '600' }}>
                {t('camera')}
              </Text>
            </Pressable>
            <Pressable onPress={pickFromLibrary} style={styles.photoBtn} hitSlop={8}>
              <ImageIcon size={16} color={colors.brand[600]} />
              <Text variant="label" style={{ color: colors.brand[600], fontWeight: '600' }}>
                {t('library')}
              </Text>
            </Pressable>
          </HStack>
        </VStack>

        <Input
          label={t('your_name')}
          placeholder={t('your_name_placeholder')}
          value={localName}
          onChangeText={(t) => {
            setLocalName(t);
            if (error) setError(null);
          }}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          maxLength={48}
          error={error ?? undefined}
          helper={t('your_name_helper')}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </VStack>

      <View style={styles.footer}>
        <Button label={t('common:continue')} onPress={submit} disabled={!canContinue} fullWidth size="lg" />
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
  avatarWrap: {
    position: 'relative',
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
