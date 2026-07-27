/**
 * Safety Setup — Step 3: SOS Triggers
 * Route: /(safety-setup)/triggers
 */
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic, Smartphone, Volume2 } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore, type SosTrigger } from '@/store/safetyStore';

const TRIGGER_OPTIONS: {
  id: SosTrigger;
  icon: typeof Smartphone;
  label: string;
  desc: string;
  recommended?: boolean;
}[] = [
  {
    id: 'shake',
    icon: Smartphone,
    label: 'Shake phone quickly 3 times',
    desc: 'Works even with screen off. Recommended for emergencies.',
    recommended: true,
  },
  {
    id: 'volume_triple',
    icon: Volume2,
    label: 'Press Volume button 3 times',
    desc: 'Works in any app. Discreet — looks like adjusting volume.',
  },
  {
    id: 'voice',
    icon: Mic,
    label: 'Say the safe word',
    desc: 'Say "Lokul Help" to silently trigger SOS (requires microphone access).',
  },
];

export default function SetupTriggersScreen() {
  const router   = useRouter();
  const triggers = useSafetyStore((s) => s.triggers);
  const setTriggers = useSafetyStore((s) => s.setTriggers);

  const toggle = (id: SosTrigger) => {
    if (triggers.includes(id)) {
      if (triggers.length === 1) return; // keep at least 1
      setTriggers(triggers.filter((t) => t !== id));
    } else {
      setTriggers([...triggers, id]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <VStack gap={1} style={styles.header}>
        <Text style={styles.stepLabel}>Step 3 of 4</Text>
        <Text style={styles.title}>SOS Triggers</Text>
        <Text style={styles.sub}>
          Choose how you can silently activate SOS. Enable more than one for reliability.
        </Text>
      </VStack>

      <VStack gap={3} style={styles.body}>
        {TRIGGER_OPTIONS.map(({ id, icon: Icon, label, desc, recommended }) => (
          <HStack key={id} gap={3} align="center" style={styles.card}>
            <View style={styles.iconWrap}>
              <Icon size={20} color={triggers.includes(id) ? colors.brand[600] : colors.surface.textSecondary} />
            </View>
            <VStack gap={0} style={{ flex: 1 }}>
              <HStack gap={2} align="center">
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{label}</Text>
                {recommended && (
                  <View style={styles.badge}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.brand[600] }}>RECOMMENDED</Text>
                  </View>
                )}
              </HStack>
              <Text variant="caption" tone="secondary">{desc}</Text>
            </VStack>
            <Switch
              value={triggers.includes(id)}
              onValueChange={() => toggle(id)}
              trackColor={{ false: colors.gray[300], true: colors.brand[600] }}
              thumbColor="#fff"
              accessibilityLabel={label}
            />
          </HStack>
        ))}

        <View style={styles.note}>
          <Text variant="caption" tone="secondary" style={{ lineHeight: 18 }}>
            Note: shake and volume triggers work system-wide. Voice keyword requires the
            Lokul app to be running in the background.
          </Text>
        </View>
      </VStack>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.push('/(safety-setup)/test')}
          style={styles.btn}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Next →</Text>
        </Pressable>
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
  body:      { padding: spacing[4] },
  card:      { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },
  iconWrap:  { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  badge:     { backgroundColor: `${colors.brand[600]}15`, borderRadius: radius.sm, paddingHorizontal: spacing[2], paddingVertical: 2 },
  note:      { backgroundColor: colors.surface.background, borderRadius: radius.lg, padding: spacing[3] },
  footer:    { padding: spacing[4], backgroundColor: colors.surface.background, borderTopWidth: 1, borderTopColor: colors.surface.border },
  btn:       { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnText:   { color: '#fff', fontSize: 16, fontWeight: '800' },
});
