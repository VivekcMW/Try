/**
 * Community Incident Report — 3-Step Flow
 * Route: /(safety)/incident-report
 *
 * Step 1: Category picker
 * Step 2: Description
 * Step 3: Confirmation / submit
 */
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Car,
  CheckCircle,
  Flame,
  HeartPulse,
  MessageCircleWarning,
  Send,
  ShieldAlert,
  ShieldOff,
  Waves,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useIncidentStore, type AlertCategory } from '@/store/incidentStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Severity = 'low' | 'medium' | 'high' | 'critical';

const CATEGORIES: { key: AlertCategory; label: string; Icon: any; color: string }[] = [
  { key: 'theft',       label: 'Theft / Robbery',       Icon: ShieldOff,          color: '#DC2626' },
  { key: 'harassment',  label: 'Harassment',             Icon: MessageCircleWarning,color: '#EA580C' },
  { key: 'vehicle',     label: 'Suspicious Vehicle',     Icon: Car,                color: '#D97706' },
  { key: 'fire',        label: 'Fire',                   Icon: Flame,              color: '#DC2626' },
  { key: 'flood',       label: 'Flood / Water Logging',  Icon: Waves,              color: '#0284C7' },
  { key: 'medical',     label: 'Medical Emergency',      Icon: HeartPulse,         color: '#059669' },
  { key: 'other',       label: 'Other',                  Icon: AlertTriangle,      color: '#6B7280' },
];

const SEVERITIES: { key: Severity; label: string; color: string }[] = [
  { key: 'low',      label: 'Low',      color: '#059669' },
  { key: 'medium',   label: 'Medium',   color: '#D97706' },
  { key: 'high',     label: 'High',     color: '#EA580C' },
  { key: 'critical', label: 'Critical', color: '#DC2626' },
];

export default function IncidentReportScreen() {
  const router    = useRouter();
  const userId    = useWalletStore((s) => s.userId);
  const userName  = useOnboardingStore((s) => s.name ?? 'Anonymous');
  const pin       = useOnboardingStore((s) => s.pin ?? '411007');
  const upsert    = useIncidentStore((s) => s.upsertAlert);

  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<AlertCategory>('other');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [title,    setTitle]    = useState('');
  const [body,     setBody]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const catMeta   = CATEGORIES.find((c) => c.key === category) ?? CATEGORIES[6];

  const submit = async () => {
    setLoading(true);
    const payload = { userId, authorName: userName, pinCode: pin, category, severity, title: title || catMeta.label, body };
    try {
      const res  = await fetch(`${BASE}/api/mobile/safety/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.id) {
        upsert({ ...data, distance: 0 });
      }
    } catch { /* offline */ }
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <VStack gap={5} align="center" style={styles.doneBody}>
          <CheckCircle size={64} color="#059669" />
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.surface.heading, textAlign: 'center' }}>
            Report submitted
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            Community members near you will be alerted. Our team will review it shortly.
          </Text>
          <Pressable onPress={() => router.back()} style={styles.doneBtn} accessibilityRole="button">
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Back to Safety Hub</Text>
          </Pressable>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable
          onPress={() => step > 1 ? setStep((s) => (s - 1) as 1 | 2 | 3) : router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>Report Incident</Text>
          <Text variant="caption" tone="secondary">Step {step} of 3</Text>
        </VStack>
        {/* Progress dots */}
        <HStack gap={1} align="center">
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, step >= s && styles.dotActive]} />
          ))}
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={styles.body}>
        {step === 1 && (
          <VStack gap={3}>
            <Text variant="label" tone="secondary" style={styles.sectionLabel}>What happened?</Text>
            <View style={styles.grid}>
              {CATEGORIES.map(({ key, label, Icon, color }) => (
                <Pressable
                  key={key}
                  onPress={() => setCategory(key)}
                  style={[styles.catTile, category === key && { borderColor: color, backgroundColor: `${color}10` }]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: category === key }}
                  accessibilityLabel={label}
                >
                  <Icon size={22} color={category === key ? color : colors.surface.textSecondary} />
                  <Text style={[styles.catLabel, category === key && { color }]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <Text variant="label" tone="secondary" style={[styles.sectionLabel, { marginTop: spacing[2] }]}>How serious?</Text>
            <HStack gap={2}>
              {SEVERITIES.map(({ key, label, color }) => (
                <Pressable
                  key={key}
                  onPress={() => setSeverity(key)}
                  style={[styles.sevChip, severity === key && { backgroundColor: color }]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: severity === key }}
                >
                  <Text style={[styles.sevText, severity === key && { color: '#fff' }]}>{label}</Text>
                </Pressable>
              ))}
            </HStack>
            <Pressable onPress={() => setStep(2)} style={styles.nextBtn} accessibilityRole="button">
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Next →</Text>
            </Pressable>
          </VStack>
        )}

        {step === 2 && (
          <VStack gap={3}>
            <HStack gap={2} align="center" style={styles.selectedBadge}>
              {(() => { const { Icon, color, label } = catMeta; return (<><Icon size={14} color={color} /><Text style={{ fontSize: 13, fontWeight: '700', color }}>{label}</Text></>); })()}
            </HStack>

            <Text variant="label" tone="secondary" style={styles.sectionLabel}>Short title (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder={`e.g. Suspicious person near park`}
              placeholderTextColor={colors.surface.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              accessibilityLabel="Incident title"
            />

            <Text variant="label" tone="secondary" style={styles.sectionLabel}>What did you see?</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Brief description: time, location, description of threat…"
              placeholderTextColor={colors.surface.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={400}
              accessibilityLabel="Incident description"
            />
            <Text variant="caption" tone="secondary" style={{ textAlign: 'right' }}>{body.length}/400</Text>

            <Pressable
              onPress={() => setStep(3)}
              style={[styles.nextBtn, (!body) && { opacity: 0.4 }]}
              disabled={!body}
              accessibilityRole="button"
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Review →</Text>
            </Pressable>
          </VStack>
        )}

        {step === 3 && (
          <VStack gap={3}>
            <Text variant="label" tone="secondary" style={styles.sectionLabel}>Review before submitting</Text>
            <View style={styles.reviewCard}>
              <VStack gap={2}>
                <HStack gap={2} align="center">
                  {(() => { const { Icon, color } = catMeta; return <Icon size={16} color={color} />; })()}
                  <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>{title || catMeta.label}</Text>
                </HStack>
                <Text variant="body" tone="secondary">{body}</Text>
                <HStack gap={2} align="center">
                  <ShieldAlert size={12} color={colors.surface.textSecondary} />
                  <Text variant="caption" tone="secondary">PIN: {pin}</Text>
                  <Text variant="caption" tone="secondary">· Severity: {severity}</Text>
                </HStack>
              </VStack>
            </View>

            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', lineHeight: 18 }}>
              Your report will be visible to neighbours in your locality. False reports may lead to account suspension.
            </Text>

            <Pressable
              onPress={submit}
              style={[styles.submitBtn, loading && { opacity: 0.5 }]}
              disabled={loading}
              accessibilityRole="button"
            >
              <Send size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                {loading ? 'Sending…' : 'Submit Report'}
              </Text>
            </Pressable>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header:  { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  body:    { padding: spacing[4], paddingBottom: spacing[16] },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, fontWeight: '700', color: colors.surface.textSecondary },
  dot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gray[200] },
  dotActive:{ backgroundColor: colors.brand[600] },

  grid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catTile: { width: '47%', backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], alignItems: 'center', gap: spacing[2], borderWidth: 2, borderColor: 'transparent' },
  catLabel:{ fontSize: 12, fontWeight: '700', color: colors.surface.textSecondary, textAlign: 'center' },

  sevChip: { flex: 1, paddingVertical: spacing[2], borderRadius: radius.lg, backgroundColor: colors.gray[100], alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  sevText: { fontSize: 12, fontWeight: '700', color: colors.surface.textSecondary },

  input:    { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, padding: spacing[3], fontSize: 15, color: colors.surface.heading, backgroundColor: colors.surface.background },
  nextBtn:  { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  submitBtn:{ backgroundColor: '#059669', borderRadius: radius.xl, paddingVertical: spacing[4], flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center' },

  selectedBadge:{ backgroundColor: colors.gray[100], alignSelf: 'flex-start', paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, gap: spacing[1] },
  reviewCard:   { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },

  doneBody: { flex: 1, padding: spacing[8], alignItems: 'center', justifyContent: 'center' },
  doneBtn:  { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], paddingHorizontal: spacing[10] },
});
