import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, Phone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, HStack, Input, Screen, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function PhoneEntryScreen() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const setPhone = useOnboardingStore((s) => s.setPhone);
  const [phone, setLocalPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setLocalPhone(digits);
    if (error) setError(null);
  };

  const isValid = useMemo(() => /^[6-9]\d{9}$/.test(phone), [phone]);

  const submit = () => {
    if (!isValid) {
      setError(t('phone_error_invalid'));
      return;
    }
    const e164 = `+91${phone}`;
    setPhone(e164);
    // Navigate immediately — OTP screen shows at once, no wait for network
    router.push({ pathname: '/(onboarding)/otp', params: { phone: e164 } });
    // Fire the send in background; resend button on OTP screen handles retries
    const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
    fetch(`${base}/api/mobile/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: e164 }),
    }).catch(() => { /* silently ignore — user can tap Resend */ });
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/splash')} hitSlop={16} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
      </View>

      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <View style={styles.iconBubble}>
            <Phone size={22} color={colors.brand[600]} />
          </View>
          <Text variant="h2">{t('phone_title')}</Text>
          <Text variant="body" tone="secondary">
            {t('phone_subtitle')}
          </Text>
        </VStack>

        <VStack gap={2}>
          <Text variant="label" tone="secondary">
            {t('mobile_number')}
          </Text>
          <HStack gap={2} align="center">
            <View style={styles.countryChip}>
              <Text style={{ fontSize: 20 }}>🇮🇳</Text>
              <Text variant="body" style={{ fontWeight: '600' }}>
                +91
              </Text>
              <ChevronDown size={16} color={colors.surface.textSecondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={t('phone_placeholder')}
                keyboardType="number-pad"
                inputMode="numeric"
                autoFocus
                maxLength={10}
                value={phone}
                onChangeText={handleChange}
                error={error ?? undefined}
                returnKeyType="done"
                onSubmitEditing={submit}
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
            </View>
          </HStack>
          {!error ? (
            <Text variant="caption" tone="secondary">
              {t('sms_rates')}
            </Text>
          ) : null}
        </VStack>
      </VStack>

      <VStack gap={3} style={styles.footer}>
        <Button label={t('send_code')} onPress={submit} disabled={!isValid} fullWidth size="lg" />
        <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
          {t('trouble_sms')}{' '}
          <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
            {t('try_whatsapp')}
          </Text>
        </Text>
      </VStack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
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
  countryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
