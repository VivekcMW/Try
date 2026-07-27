// PRD §06 — Customer service quote request form (wired to real API)
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const SERVICE_TYPES = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'AC Repair', 'Cleaning', 'Other'];
const PREFERRED_TIMES = [
  { label: 'Today',        value: 'today' },
  { label: 'Tomorrow',     value: 'tomorrow' },
  { label: 'This weekend', value: 'weekend' },
  { label: 'Flexible',     value: 'flexible' },
];

export default function RequestQuotePage() {
  const router    = useRouter();
  const { bizId } = useLocalSearchParams<{ bizId: string }>();
  const userId    = useWalletStore((s) => s.userId);

  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [preferredAt, setPreferredAt] = useState('flexible');
  const [budgetRs,    setBudgetRs]    = useState('');
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  async function submit() {
    if (!userId || !bizId) { Alert.alert('Error', 'Missing required info'); return; }
    if (description.trim().length < 5) { Alert.alert('Description too short', 'Please describe your requirement.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          merchantId: bizId,
          serviceDescription: `${serviceType}: ${description.trim()} (preferred: ${preferredAt})`,
          budgetPaise: budgetRs ? Math.round(parseFloat(budgetRs) * 100) : undefined,
        }),
      });
      if (!res.ok) throw new Error('submit failed');
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not send quote request — please try again.');
    } finally { setSubmitting(false); }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.successBox}>
          <CheckCircle size={56} color={colors.semantic.success} />
          <Text variant="h2" style={{ fontWeight: '800', textAlign: 'center' }}>Request Sent!</Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            The service provider will review your request and respond with a quote shortly.
          </Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            Service type: {serviceType} · Preferred: {preferredAt}
          </Text>
          <View style={{ width: '100%', marginTop: spacing[4] }}>
            <Button label="Back to home" onPress={() => router.back()} fullWidth />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>
          {'Request a quote'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <VStack gap={5}>

          {/* Service type */}
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Type of service *</Text>
            <View style={styles.chipRow}>
              {SERVICE_TYPES.map((s) => (
                <Pressable key={s} onPress={() => setServiceType(s)} style={[styles.chip, serviceType === s && styles.chipActive]}>
                  <Text variant="caption" style={{ fontWeight: '700', color: serviceType === s ? '#fff' : colors.surface.textSecondary }}>
                    {s}
                  </Text>
                </Pressable>
              ))}
            </View>
          </VStack>

          {/* Description */}
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Describe the issue</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={4}
              placeholder="e.g. Water leak under kitchen sink, needs fixing ASAP…"
              placeholderTextColor={colors.surface.textSecondary}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </VStack>

          {/* Preferred time */}
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Preferred time</Text>
            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              {PREFERRED_TIMES.map((pt) => (
                <Pressable key={pt.value} onPress={() => setPreferredAt(pt.value)} style={[styles.chip, preferredAt === pt.value && styles.chipActive]}>
                  <Text variant="caption" style={{ fontWeight: '700', color: preferredAt === pt.value ? '#fff' : colors.surface.textSecondary }}>
                    {pt.label}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </VStack>

          {/* Budget (optional) */}
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700' }}>Budget (₹, optional)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={colors.surface.textSecondary}
              value={budgetRs}
              onChangeText={setBudgetRs}
              maxLength={7}
            />
          </VStack>

          {/* Note */}
          <Card padding={3.5} elevation="none" bordered style={{ backgroundColor: colors.gray[50] }}>
            <Text variant="caption" tone="secondary">
              By submitting, you agree to the provider contacting you at the above number to discuss requirements and pricing.
            </Text>
          </Card>

          <Button
            label={submitting ? 'Sending…' : 'Send Request'}
            onPress={submit}
            disabled={!serviceType || submitting}
            fullWidth
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 1.5,
    borderColor: colors.surface.border,
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  input: {
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
  },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: 15,
    color: colors.surface.foreground,
    backgroundColor: colors.surface.background,
    minHeight: 96,
  },
  successBox: {
    flex: 1,
    padding: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
});
