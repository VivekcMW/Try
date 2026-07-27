import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Button, HStack, Screen, Text, VStack } from '@/components/ui';
import { colors, radius, spacing, textPresets } from '@lokul/ui-tokens';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpEntryScreen() {
  const { t } = useTranslation('onboarding');
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Countdown for resend.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const digits = useMemo(() => {
    const padded = code.padEnd(OTP_LENGTH, ' ').slice(0, OTP_LENGTH);
    return Array.from(padded);
  }, [code]);

  const isComplete = code.length === OTP_LENGTH;

  const handleChange = (raw: string) => {
    const clean = raw.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setCode(clean);
    if (error) setError(null);
    if (clean.length === OTP_LENGTH) {
      verify(clean);
    }
  };

  const verify = (value: string) => {
    if (value.length !== OTP_LENGTH) {
      setError(t('otp_error_incorrect'));
      return;
    }
    setError(null);
    // Navigate immediately — verify in background, show error only on failure
    router.replace('/(onboarding)/profile');
    const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
    fetch(`${base}/api/mobile/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone ?? '', code: value }),
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // In production navigate back and show error
        if (process.env.NODE_ENV === 'production') {
          router.replace('/(onboarding)/phone');
          setError(body.error ?? t('otp_error_incorrect'));
        }
      }
    }).catch(() => { /* offline — already navigated */ });
  };

  const resend = async () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setCode('');
    setError(null);
    inputRef.current?.focus();
    try {
      const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
      await fetch(`${base}/api/mobile/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone ?? '' }),
      });
    } catch {
      // silently ignore
    }
  };

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.surface.foreground} />
        </Pressable>
      </View>

      <VStack gap={6} style={styles.body}>
        <VStack gap={2}>
          <View style={styles.iconBubble}>
            <ShieldCheck size={22} color={colors.brand[600]} />
          </View>
          <Text variant="h2">{t('otp_title')}</Text>
          <Text variant="body" tone="secondary">
            {t('otp_sent_to', { phone: phone ?? t('your_phone') })}{' '}
            <Text
              variant="body"
              style={{ color: colors.brand[600], fontWeight: '600' }}
              onPress={() => router.back()}
            >
              {t('change')}
            </Text>
          </Text>
        </VStack>

        <Pressable onPress={() => inputRef.current?.focus()} style={styles.otpRow}>
          {digits.map((d, i) => {
            const filled = d.trim().length > 0;
            const isCursor = i === code.length;
            return (
              <View
                key={i}
                style={[
                  styles.otpBox,
                  {
                    borderColor: error
                      ? colors.semantic.danger
                      : filled || isCursor
                      ? colors.brand[600]
                      : colors.surface.border,
                    borderWidth: filled || isCursor || !!error ? 1.5 : 1,
                    backgroundColor: filled ? colors.brand[50] : colors.surface.background,
                  },
                ]}
              >
                <Text style={[textPresets.h3, { color: colors.surface.heading }]}>
                  {filled ? d : ''}
                </Text>
              </View>
            );
          })}
        </Pressable>

        {/* Hidden input that drives the OTP boxes — supports Android SMS Retriever auto-fill. */}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          autoFocus
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          style={styles.hiddenInput}
          caretHidden
        />

        {error ? (
          <Text variant="caption" tone="danger" style={{ textAlign: 'center' }}>
            {error}
          </Text>
        ) : null}

        <HStack justify="center" gap={1.5} align="center">
          <Text variant="body" tone="secondary">
            {t('didnt_receive')}
          </Text>
          {secondsLeft > 0 ? (
            <Text variant="body" tone="secondary">
              {t('resend_in', { seconds: secondsLeft })}
            </Text>
          ) : (
            <Pressable onPress={resend} hitSlop={8}>
              <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
                {t('resend_code')}
              </Text>
            </Pressable>
          )}
        </HStack>
      </VStack>

      <VStack gap={3} style={styles.footer}>
        <Button
          label={t('verify_continue')}
          onPress={() => verify(code)}
          disabled={!isComplete}
          fullWidth
          size="lg"
        />
        <Pressable
          hitSlop={8}
          style={{ alignSelf: 'center' }}
          onPress={() => Alert.alert(t('whatsapp_instead'), t('whatsapp_instead_unavailable'))}
        >
          <HStack gap={1.5} align="center">
            <MessageCircle size={16} color={colors.brand[600]} />
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
              {t('whatsapp_instead')}
            </Text>
          </HStack>
        </Pressable>
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
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  otpBox: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
});
