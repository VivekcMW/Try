/**
 * Safety Setup — Step 0: Welcome
 * Route: /(safety-setup)/welcome
 */
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Shield, ShieldCheck, Users, Video } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const FEATURES = [
  { icon: Shield,      text: 'One-tap SOS with 3-second countdown' },
  { icon: Users,       text: 'Alert up to 5 trusted contacts instantly' },
  { icon: Video,       text: 'Auto-record + cloud-upload evidence' },
  { icon: ShieldCheck, text: 'Safe journey check-ins & volunteer network' },
];

export default function SafetySetupWelcome() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <VStack gap={6} style={styles.body}>
        {/* Hero */}
        <VStack gap={3} align="center">
          <View style={styles.heroIcon}>
            <Shield size={52} color="#fff" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Lokul Safety Hub</Text>
          <Text style={styles.sub}>
            Set up your safety profile in 4 quick steps. Takes less than 2 minutes.
          </Text>
        </VStack>

        {/* Feature list */}
        <VStack gap={3}>
          {FEATURES.map(({ icon: Icon, text }) => (
            <HStack key={text} gap={3} align="center">
              <View style={styles.featureIcon}>
                <Icon size={18} color={colors.brand[600]} />
              </View>
              <Text variant="body" style={{ flex: 1, color: colors.surface.heading }}>
                {text}
              </Text>
            </HStack>
          ))}
        </VStack>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Pressable
          onPress={() => router.push('/(safety-setup)/contacts')}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Get started with safety setup"
        >
          <Text style={styles.btnText}>Get Started</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(safety)/hub')}
          accessibilityRole="button"
        >
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            Skip for now
          </Text>
        </Pressable>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.surface.background },
  body:      { flex: 1, padding: spacing[6] },
  heroIcon:  { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center' },
  title:     { fontSize: 26, fontWeight: '900', color: colors.surface.heading, textAlign: 'center' },
  sub:       { fontSize: 15, color: colors.surface.textSecondary, textAlign: 'center', lineHeight: 22 },
  featureIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.brand[600]}15`, alignItems: 'center', justifyContent: 'center' },
  btn:       { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnText:   { color: '#fff', fontSize: 17, fontWeight: '800' },
});
