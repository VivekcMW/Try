/**
 * Accessibility Settings
 * Route: /(settings)/accessibility
 *
 * Controls:
 *   - Simplified / Senior Mode
 *   - Font Size (Normal / Large / Extra Large)
 *   - Bold Text
 *   - High Contrast
 *   - Reduce Motion
 *   - Screen Reader Hints
 */
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Contrast,
  Eye,
  Smartphone,
  Type,
  Wind,
  Zap,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import {
  useAccessibilityStore,
  type FontScaleLevel,
} from '@/store/accessibilityStore';
import { HC_COLORS } from '@/hooks/useAccessibility';

const FONT_SCALE_OPTIONS: { value: FontScaleLevel; label: string; size: number }[] = [
  { value: 'normal', label: 'Normal',      size: 14 },
  { value: 'large',  label: 'Large',       size: 17 },
  { value: 'xlarge', label: 'Extra Large', size: 20 },
];

function SectionLabel({ label }: { readonly label: string }) {
  return (
    <Text
      variant="label"
      tone="secondary"
      style={{ textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: spacing[4], marginTop: spacing[2] }}
    >
      {label}
    </Text>
  );
}

function ToggleRow({
  icon: Icon, label, description, value, onChange, iconColor = colors.brand[600],
}: {
  readonly icon: typeof Eye;
  readonly label: string;
  readonly description: string;
  readonly value: boolean;
  readonly onChange: (v: boolean) => void;
  readonly iconColor?: string;
}) {
  return (
    <HStack gap={3} align="center" style={styles.toggleRow}>
      <View style={[styles.rowIcon, { backgroundColor: `${iconColor}15` }]}>
        <Icon size={18} color={iconColor} />
      </View>
      <VStack gap={0} style={{ flex: 1 }}>
        <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{label}</Text>
        <Text variant="caption" tone="secondary">{description}</Text>
      </VStack>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.gray[300], true: colors.brand[600] }}
        thumbColor="#ffffff"
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </HStack>
  );
}

function FontSizeSelector() {
  const fontScale    = useAccessibilityStore((s) => s.fontScale);
  const setFontScale = useAccessibilityStore((s) => s.setFontScale);

  return (
    <View style={styles.fontCard}>
      <HStack gap={2} align="center" style={{ marginBottom: spacing[3] }}>
        <View style={[styles.rowIcon, { backgroundColor: `${colors.brand[600]}15` }]}>
          <Type size={18} color={colors.brand[600]} />
        </View>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>Font Size</Text>
          <Text variant="caption" tone="secondary">Scales all text in the app</Text>
        </VStack>
      </HStack>

      {/* Segment control */}
      <HStack gap={2}>
        {FONT_SCALE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFontScale(opt.value)}
            style={[styles.fontOption, fontScale === opt.value && styles.fontOptionActive]}
            accessibilityRole="radio"
            accessibilityState={{ checked: fontScale === opt.value }}
            accessibilityLabel={`Font size: ${opt.label}`}
          >
            <Text style={[
              styles.fontOptionText,
              { fontSize: opt.size },
              fontScale === opt.value && styles.fontOptionTextActive,
            ]}>
              Aa
            </Text>
            <Text style={[
              styles.fontOptionLabel,
              fontScale === opt.value && styles.fontOptionLabelActive,
            ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {/* Preview */}
      <View style={styles.previewBox}>
        <Text variant="caption" tone="secondary" style={{ marginBottom: spacing[1] }}>Preview</Text>
        <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
          Lokul — Your Neighbourhood
        </Text>
        <Text variant="caption" tone="secondary">
          Connecting residents, local businesses and services.
        </Text>
      </View>
    </View>
  );
}

export default function AccessibilityScreen() {
  const router = useRouter();

  const seniorMode        = useAccessibilityStore((s) => s.seniorMode);
  const highContrast      = useAccessibilityStore((s) => s.highContrast);
  const boldText          = useAccessibilityStore((s) => s.boldText);
  const reduceMotion      = useAccessibilityStore((s) => s.reduceMotion);
  const screenReaderHints = useAccessibilityStore((s) => s.screenReaderHints);

  const setSeniorMode        = useAccessibilityStore((s) => s.setSeniorMode);
  const setHighContrast      = useAccessibilityStore((s) => s.setHighContrast);
  const setBoldText          = useAccessibilityStore((s) => s.setBoldText);
  const setReduceMotion      = useAccessibilityStore((s) => s.setReduceMotion);
  const setScreenReaderHints = useAccessibilityStore((s) => s.setScreenReaderHints);
  const resetAll             = useAccessibilityStore((s) => s.reset);

  // Keep HC colors for demonstration in preview box
  const previewBg = highContrast ? HC_COLORS.surface.background : colors.surface.surfaceMuted;
  const previewBorder = highContrast ? HC_COLORS.surface.border : colors.surface.border;

  return (
    <SafeAreaView
      style={[styles.safe, highContrast && { backgroundColor: HC_COLORS.surface.background }]}
      edges={['top']}
    >
      {/* Header */}
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backBtn}
        >
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <Text variant="body" style={{ fontWeight: '700', flex: 1, color: colors.surface.heading }}>
          Accessibility
        </Text>
      </HStack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Simplified / Senior Mode — most prominent */}
        <View style={[styles.seniorCard, seniorMode && styles.seniorCardActive]}>
          <HStack gap={3} align="center">
            <View style={[styles.seniorIcon, seniorMode && styles.seniorIconActive]}>
              <Smartphone size={22} color={seniorMode ? '#fff' : colors.brand[600]} />
            </View>
            <VStack gap={0} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '800', color: seniorMode ? '#fff' : colors.surface.heading }}>
                Simplified Mode
              </Text>
              <Text variant="caption" style={{ color: seniorMode ? 'rgba(255,255,255,0.8)' : colors.surface.textSecondary }}>
                Larger text, bigger buttons, simplified home screen for easier navigation
              </Text>
            </VStack>
            <Switch
              value={seniorMode}
              onValueChange={setSeniorMode}
              trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(255,255,255,0.6)' }}
              thumbColor="#ffffff"
              accessibilityLabel="Simplified Mode"
              accessibilityRole="switch"
            />
          </HStack>
          {seniorMode && (
            <View style={styles.seniorInfo}>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 18 }}>
                Home screen is now simplified. Tap the Home tab to see it.{'\n'}Font size is set to Large. Tap targets are enlarged to 56px.
              </Text>
            </View>
          )}
        </View>

        {/* Display & Text */}
        <SectionLabel label="Display & Text" />
        <View style={styles.card}>
          <FontSizeSelector />
          <View style={styles.divider} />
          <ToggleRow
            icon={Zap}
            label="Bold Text"
            description="Makes all text heavier and easier to read"
            value={boldText}
            onChange={setBoldText}
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={Contrast}
            label="High Contrast"
            description="Increases colour contrast for text and borders (WCAG AA)"
            value={highContrast}
            onChange={setHighContrast}
            iconColor="#0047AB"
          />
          {/* High-contrast preview swatch */}
          {highContrast && (
            <View style={[styles.hcPreview, { backgroundColor: previewBg, borderColor: previewBorder }]}>
              <Text style={{ color: HC_COLORS.surface.heading, fontWeight: '700', fontSize: 13 }}>
                High Contrast — this is how text looks
              </Text>
              <Text style={{ color: HC_COLORS.surface.textSecondary, fontSize: 11, marginTop: 2 }}>
                Stronger borders, darker text, WCAG AA colours
              </Text>
            </View>
          )}
        </View>

        {/* Motion & Interaction */}
        <SectionLabel label="Motion & Interaction" />
        <View style={styles.card}>
          <ToggleRow
            icon={Wind}
            label="Reduce Motion"
            description="Minimises animations and transitions"
            value={reduceMotion}
            onChange={setReduceMotion}
            iconColor="#0D9488"
          />
        </View>

        {/* Screen Reader */}
        <SectionLabel label="Screen Reader" />
        <View style={styles.card}>
          <ToggleRow
            icon={Eye}
            label="Screen Reader Hints"
            description="Adds extra hints for VoiceOver (iOS) and TalkBack (Android)"
            value={screenReaderHints}
            onChange={setScreenReaderHints}
            iconColor="#7C3AED"
          />
          <View style={styles.divider} />
          <ToggleRow
            icon={BookOpen}
            label="Announce Page Changes"
            description="Reads out page titles when navigating"
            value={screenReaderHints}
            onChange={setScreenReaderHints}
            iconColor="#7C3AED"
          />
        </View>

        {/* Quick help note */}
        <View style={styles.helpBox}>
          <Text variant="caption" tone="secondary" style={{ lineHeight: 18 }}>
            Lokul also respects your device's accessibility settings — system font scale,
            VoiceOver / TalkBack, and Increase Contrast are all supported automatically.
          </Text>
        </View>

        {/* Reset */}
        <Pressable
          onPress={resetAll}
          style={styles.resetBtn}
          accessibilityRole="button"
          accessibilityLabel="Reset all accessibility settings to defaults"
        >
          <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700' }}>
            Reset to Defaults
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  scroll: { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[12] },

  // Senior mode card
  seniorCard: {
    backgroundColor: colors.surface.background,
    borderRadius: radius.xl, padding: spacing[4],
    borderWidth: 2, borderColor: colors.surface.border,
    gap: spacing[2],
  },
  seniorCardActive: {
    backgroundColor: colors.brand[600], borderColor: colors.brand[600],
  },
  seniorIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: `${colors.brand[600]}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  seniorIconActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  seniorInfo: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: radius.md,
    padding: spacing[3], marginTop: spacing[1],
  },

  // Generic card
  card: { backgroundColor: colors.surface.background, borderRadius: radius.xl, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: colors.surface.border, marginHorizontal: spacing[4] },

  // Toggle row
  toggleRow: { paddingHorizontal: spacing[4], paddingVertical: spacing[3.5] },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  // Font selector
  fontCard: { padding: spacing[4] },
  fontOption: {
    flex: 1, backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.lg,
    paddingVertical: spacing[3], alignItems: 'center', gap: spacing[1],
    borderWidth: 2, borderColor: 'transparent',
  },
  fontOptionActive: { borderColor: colors.brand[600], backgroundColor: `${colors.brand[600]}10` },
  fontOptionText:     { fontWeight: '700', color: colors.surface.heading },
  fontOptionTextActive: { color: colors.brand[600] },
  fontOptionLabel:    { fontSize: 10, fontWeight: '600', color: colors.surface.textSecondary },
  fontOptionLabelActive: { color: colors.brand[600] },
  previewBox: {
    marginTop: spacing[3], backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md, padding: spacing[3],
    borderWidth: 1, borderColor: colors.surface.border,
  },

  // High contrast preview
  hcPreview: {
    marginHorizontal: spacing[4], marginBottom: spacing[3],
    padding: spacing[3], borderRadius: radius.md, borderWidth: 2,
  },

  helpBox: {
    backgroundColor: colors.surface.background, borderRadius: radius.lg,
    padding: spacing[4], borderWidth: 1, borderColor: colors.surface.border,
  },
  resetBtn: { alignItems: 'center', paddingVertical: spacing[2] },
});
