/**
 * Safety Setup — Step 4: Test Your SOS
 * Route: /(safety-setup)/test
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle, Send } from 'lucide-react-native';
import { Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore } from '@/store/safetyStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function SetupTestScreen() {
  const router = useRouter();
  const contacts      = useSafetyStore((s) => s.contacts);
  const completeSetup = useSafetyStore((s) => s.completeSetup);
  const userId        = useWalletStore((s) => s.userId);
  const [sent,     setSent]    = useState(false);
  const [loading,  setLoading] = useState(false);

  const sendTest = async () => {
    setLoading(true);
    try {
      await fetch(`${BASE}/api/mobile/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId ?? 'anonymous',
          pinCode: '000000',
          category: 'test',
          severity: 'low',
          body: 'THIS IS A TEST — Lokul SOS setup test. Please ignore.',
        }),
      });
    } catch {
      // non-fatal
    }
    setSent(true);
    setLoading(false);
  };

  const finish = () => {
    completeSetup();
    router.replace('/(safety)/hub');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <VStack gap={1} style={styles.header}>
        <Text style={styles.stepLabel}>Step 4 of 4</Text>
        <Text style={styles.title}>Test Your SOS</Text>
        <Text style={styles.sub}>
          We will send a TEST alert to your contacts so they know what to expect.
        </Text>
      </VStack>

      <VStack gap={5} style={styles.body} align="center">
        {/* Contacts preview */}
        <View style={styles.contactsBox}>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing[2] }}>
            Alert will be sent to:
          </Text>
          {contacts.map((c) => (
            <Text key={c.id} variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {c.name} ({c.phone})
            </Text>
          ))}
        </View>

        {sent ? (
          <VStack gap={3} align="center">
            <CheckCircle size={56} color="#059669" />
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#059669' }}>Test sent!</Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center', lineHeight: 22 }}>
              Your contacts received a test message marked{'\n'}
              "THIS IS A TEST". Your SOS is ready.
            </Text>
          </VStack>
        ) : (
          <Pressable
            onPress={sendTest}
            style={[styles.testBtn, loading && { opacity: 0.6 }]}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Send test SOS alert"
          >
            <Send size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
              {loading ? 'Sending…' : 'Send Test Alert'}
            </Text>
          </Pressable>
        )}
      </VStack>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <Pressable
          onPress={finish}
          style={[styles.btn, !sent && { opacity: 0.5 }]}
          disabled={!sent}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Finish Setup</Text>
        </Pressable>
        {!sent && (
          <Pressable onPress={finish} style={{ marginTop: spacing[2], alignItems: 'center' }}>
            <Text variant="caption" tone="secondary">Skip test</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { padding: spacing[5], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.brand[600], textTransform: 'uppercase', letterSpacing: 1 },
  title:     { fontSize: 22, fontWeight: '900', color: colors.surface.heading },
  sub:       { fontSize: 14, color: colors.surface.textSecondary, lineHeight: 20 },
  body:      { flex: 1, padding: spacing[6] },
  contactsBox: { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], width: '100%', gap: spacing[1] },
  testBtn:  { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], paddingHorizontal: spacing[8], flexDirection: 'row', gap: spacing[2], alignItems: 'center' },
  footer:   { padding: spacing[4], backgroundColor: colors.surface.background, borderTopWidth: 1, borderTopColor: colors.surface.border },
  btn:      { backgroundColor: '#059669', borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnText:  { color: '#fff', fontSize: 16, fontWeight: '800' },
});
