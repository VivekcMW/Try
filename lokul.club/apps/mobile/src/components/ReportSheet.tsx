// PRD §18 — In-app report / flag flow
// Usage: <ReportSheet visible={open} targetId="post-id" targetType="post" onClose={() => setOpen(false)} />
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { AlertTriangle, CheckCircle, ChevronRight, X } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ─── Report categories ─────────────────────────────────────────────────────────
type ReportReason = {
  id: string;
  label: string;
  description: string;
};

const REPORT_REASONS: ReportReason[] = [
  { id: 'spam',           label: 'Spam',                  description: 'Unsolicited ads, repetitive posts, or irrelevant content' },
  { id: 'harassment',     label: 'Harassment or bullying', description: 'Targeting, threatening, or demeaning a person' },
  { id: 'misinformation', label: 'False information',      description: 'Fake news, misleading claims, or dangerous misinformation' },
  { id: 'nudity',         label: 'Nudity or sexual content', description: 'Explicit or sexually suggestive material' },
  { id: 'violence',       label: 'Violence or threats',    description: 'Glorifying violence or making direct threats' },
  { id: 'hate_speech',    label: 'Hate speech',            description: 'Content targeting race, religion, caste, gender, or disability' },
  { id: 'scam',           label: 'Fraud or scam',          description: 'Fake marketplace listings, financial scams, impersonation' },
  { id: 'other',          label: 'Something else',         description: 'Another reason not listed above' },
];

export type ReportTargetType = 'post' | 'comment' | 'user' | 'story' | 'listing';

interface Props {
  readonly visible: boolean;
  readonly targetId: string;
  readonly targetType: ReportTargetType;
  readonly onClose: () => void;
}

type Step = 'pick' | 'confirm' | 'done';

export function ReportSheet({ visible, targetId, targetType, onClose }: Props) {
  const userId = useWalletStore((s) => s.userId);

  const [step,      setStep]      = useState<Step>('pick');
  const [selected,  setSelected]  = useState<ReportReason | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep('pick');
    setSelected(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSelectReason = (reason: ReportReason) => {
    setSelected(reason);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selected || !userId) return;
    setSubmitting(true);
    try {
      await fetch(`${BASE}/api/mobile/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          targetId,
          targetType,
          reason: selected.id,
        }),
      });
    } catch { /* noop — submit optimistically */ }
    setStep('done');
    setSubmitting(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable style={s.backdrop} onPress={handleClose} accessibilityLabel="Close report" />

      {/* Sheet */}
      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <HStack gap={3} align="center" style={s.header}>
          <AlertTriangle size={20} color={colors.semantic.danger} />
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
            {step === 'done' ? 'Report submitted' : 'Report content'}
          </Text>
          <Pressable onPress={handleClose} accessibilityLabel="Close" style={s.closeBtn}>
            <X size={18} color={colors.surface.textSecondary} />
          </Pressable>
        </HStack>

        {/* ── Step: Pick reason ── */}
        {step === 'pick' && (
          <ScrollView
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          >
            <Text variant="body" tone="secondary" style={s.subheading}>
              Why are you reporting this {targetType}?
            </Text>
            {REPORT_REASONS.map((reason) => (
              <Pressable
                key={reason.id}
                style={({ pressed }) => [s.reasonRow, pressed && { opacity: 0.7 }]}
                onPress={() => handleSelectReason(reason)}
                accessibilityRole="button"
                accessibilityLabel={reason.label}
              >
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }}>
                    {reason.label}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={2}>
                    {reason.description}
                  </Text>
                </VStack>
                <ChevronRight size={16} color={colors.surface.textSecondary} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Step: Confirm ── */}
        {step === 'confirm' && selected && (
          <VStack gap={4} style={s.confirmWrap}>
            <Text variant="body" tone="secondary">
              You're reporting this {targetType} for:
            </Text>
            <View style={s.selectedBox}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                {selected.label}
              </Text>
              <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1] }}>
                {selected.description}
              </Text>
            </View>
            <Text variant="caption" tone="secondary">
              Our moderation team will review this report within 24 hours. The content will be
              temporarily hidden from your feed until reviewed.
            </Text>
            <Pressable
              style={[s.submitBtn, submitting && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Submit report"
            >
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Submit Report</Text>
              }
            </Pressable>
            <Pressable onPress={() => setStep('pick')} accessibilityRole="button" style={{ alignSelf: 'center' }}>
              <Text variant="body" style={{ color: colors.brand[600] }}>Choose a different reason</Text>
            </Pressable>
          </VStack>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <VStack gap={4} style={s.confirmWrap} align="center">
            <CheckCircle size={52} color={colors.semantic.success} />
            <Text variant="h3" style={{ color: colors.surface.heading, textAlign: 'center' }}>
              Thank you for your report
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              We've received your report and will review this {targetType} within 24 hours.
              We won't notify the person you reported.
            </Text>
            <Pressable style={s.submitBtn} onPress={handleClose} accessibilityRole="button">
              <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Done</Text>
            </Pressable>
          </VStack>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop:    {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: spacing[8],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface.border,
    alignSelf: 'center',
    marginTop: spacing[2],
    marginBottom: spacing[1],
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  subheading: {
    marginBottom: spacing[2],
  },
  list: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    gap: spacing[1],
    paddingBottom: spacing[4],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
    gap: spacing[3],
  },
  confirmWrap: {
    padding: spacing[5],
  },
  selectedBox: {
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: 10,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  submitBtn: {
    backgroundColor: colors.semantic.danger,
    borderRadius: 10,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
