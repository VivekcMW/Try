/**
 * Security Screen
 * Route: /(settings)/security
 *
 * Shows the account's verified phone number + trust tier, and lets the
 * user re-verify phone ownership via the real OTP backend
 * (/api/mobile/otp/send + /api/mobile/otp/verify) — the closest real
 * "security" action available since the app has no password/session model.
 */
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Phone, ShieldCheck } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useProfileStore } from '@/store/profileStore';
import { useVerificationStore, tierLabel } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const OTP_LENGTH = 4;

type Step = 'idle' | 'sent' | 'verified';

export default function SecurityScreen() {
  const router = useRouter();
  const profilePhone = useProfileStore((s) => s.profile.phone);
  const onboardingPhone = useOnboardingStore((s) => s.phone);
  const tier = useVerificationStore((s) => s.tier);
  const phone = profilePhone || onboardingPhone || '';

  const [step, setStep] = useState<Step>('idle');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendOtp = async () => {
    if (!phone) { Alert.alert('No phone on file', 'Add a phone number in Edit Profile first.'); return; }
    setSending(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        setStep('sent');
        setCode('');
      } else {
        const d = await res.json().catch(() => ({}));
        Alert.alert('Could not send code', d.error ?? 'Please try again.');
      }
    } catch {
      Alert.alert('Network error', 'Could not reach the server. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    if (code.trim().length !== OTP_LENGTH) return;
    setVerifying(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: code.trim() }),
      });
      if (res.ok) {
        setStep('verified');
      } else {
        const d = await res.json().catch(() => ({}));
        Alert.alert('Incorrect code', d.error ?? 'That code did not match. Please try again.');
      }
    } catch {
      Alert.alert('Network error', 'Could not verify right now. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Security</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <HStack gap={3} align="center">
            <View style={styles.iconWrap}>
              <Phone size={18} color={colors.brand[600]} />
            </View>
            <VStack gap={0} style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">Account phone number</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {phone || 'Not set'}
              </Text>
            </VStack>
          </HStack>
        </View>

        <View style={styles.card}>
          <HStack gap={3} align="center">
            <View style={styles.iconWrap}>
              <ShieldCheck size={18} color={colors.brand[600]} />
            </View>
            <VStack gap={0} style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">Trust tier</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {tierLabel(tier)}
              </Text>
            </VStack>
          </HStack>
        </View>

        <VStack gap={2} style={{ marginTop: spacing[5] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '700', letterSpacing: 0.6 }}>
            PHONE VERIFICATION
          </Text>
          <View style={styles.card}>
            {step === 'verified' ? (
              <HStack gap={2} align="center">
                <CheckCircle2 size={18} color={colors.semantic.success} />
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  Phone verified successfully
                </Text>
              </HStack>
            ) : (
              <VStack gap={3}>
                <Text variant="caption" tone="secondary">
                  Re-confirm you still own this phone number by requesting a one-time code.
                </Text>
                {step === 'idle' && (
                  <Pressable onPress={sendOtp} style={[styles.actionBtn, sending && { opacity: 0.6 }]} disabled={sending} accessibilityRole="button">
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{sending ? 'Sending…' : 'Send verification code'}</Text>
                  </Pressable>
                )}
                {step === 'sent' && (
                  <VStack gap={2}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="4-digit code"
                      placeholderTextColor={colors.surface.textSecondary}
                      keyboardType="number-pad"
                      maxLength={OTP_LENGTH}
                      value={code}
                      onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
                      accessibilityLabel="Enter verification code"
                    />
                    <Pressable
                      onPress={verifyOtp}
                      style={[styles.actionBtn, (code.length !== OTP_LENGTH || verifying) && { opacity: 0.4 }]}
                      disabled={code.length !== OTP_LENGTH || verifying}
                      accessibilityRole="button"
                    >
                      <Text style={{ color: '#fff', fontWeight: '700' }}>{verifying ? 'Verifying…' : 'Verify code'}</Text>
                    </Pressable>
                    <Pressable onPress={sendOtp} disabled={sending} accessibilityRole="button">
                      <Text style={{ color: colors.brand[600], fontWeight: '600', textAlign: 'center' }}>
                        {sending ? 'Resending…' : 'Resend code'}
                      </Text>
                    </Pressable>
                  </VStack>
                )}
              </VStack>
            )}
          </View>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.gray[50] },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] },
  card: {
    backgroundColor: colors.surface.background, borderRadius: radius.lg, padding: spacing[4],
    borderWidth: 0.5, borderColor: colors.surface.border,
  },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' },
  actionBtn: { backgroundColor: colors.brand[600], borderRadius: radius.lg, paddingVertical: spacing[3], alignItems: 'center' },
  otpInput: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg,
    padding: spacing[3], fontSize: 18, letterSpacing: 4, textAlign: 'center', color: colors.surface.heading,
  },
});
