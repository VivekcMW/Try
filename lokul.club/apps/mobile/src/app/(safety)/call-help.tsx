/**
 * Call Help — Quick Dial Screen
 * Route: /(safety)/call-help
 *
 * Large tap-to-call tiles for emergency services.
 * Local police number looked up by PIN code.
 * Medical ID preview card at the bottom.
 */
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Flame,
  HeartPulse,
  Info,
  Phone,
  Shield,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useMedicalIdStore } from '@/store/medicalIdStore';
import { useOnboardingStore } from '@/store/onboardingStore';

/** Seeded map: PIN code prefix → local police PCR number */
const PCR_BY_PIN: Record<string, string> = {
  '411': '020-26122880', // Pune
  '400': '022-24114873', // Mumbai
  '110': '011-23490006', // Delhi
  '560': '080-22942222', // Bengaluru
  '600': '044-23452360', // Chennai
  '500': '040-27852233', // Hyderabad
};

function getLocalPolice(pin: string): string {
  const prefix = pin.slice(0, 3);
  return PCR_BY_PIN[prefix] ?? '100';
}

function EmergencyTile({
  Icon, label, sub, number, color,
}: {
  readonly Icon: any;
  readonly label: string;
  readonly sub: string;
  readonly number: string;
  readonly color: string;
}) {
  // Phone URI format supports hyphens natively on iOS and Android
  const dial = () => Linking.openURL(`tel:${number}`).catch(() => {});
  return (
    <Pressable
      onPress={dial}
      style={[styles.tile, { borderTopColor: color }]}
      accessibilityRole="button"
      accessibilityLabel={`Call ${label} — ${number}`}
      accessibilityHint="Dials the emergency number"
    >
      <View style={[styles.tileIcon, { backgroundColor: `${color}15` }]}>
        <Icon size={28} color={color} />
      </View>
      <VStack gap={0} align="center">
        <Text style={[styles.tileTitle, { color }]}>{label}</Text>
        <Text variant="caption" tone="secondary">{sub}</Text>
        <Text style={[styles.tileNumber, { color }]}>{number}</Text>
      </VStack>
      <View style={[styles.callBadge, { backgroundColor: color }]}>
        <Phone size={14} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>CALL</Text>
      </View>
    </Pressable>
  );
}

export default function CallHelpScreen() {
  const router   = useRouter();
  const pin      = useOnboardingStore((s) => s.pin ?? '411007');
  const medical  = useMedicalIdStore();

  const localPolice = getLocalPolice(pin);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <Text variant="body" style={{ fontWeight: '800', flex: 1, color: colors.surface.heading }}>Call Help</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.body}>
        {/* PCR / Local Police */}
        <EmergencyTile
          Icon={Shield}
          label="Police"
          sub={`PCR / Local station · PIN ${pin}`}
          number={localPolice}
          color="#1D65AF"
        />

        {/* National Emergency */}
        <EmergencyTile Icon={Shield}  label="National Emergency" sub="All emergencies (new universal)" number="112"  color="#7C3AED" />
        <EmergencyTile Icon={HeartPulse} label="Ambulance"       sub="National ambulance service"      number="108"  color="#DC2626" />
        <EmergencyTile Icon={Flame}    label="Fire Brigade"       sub="Fire & rescue services"          number="101"  color="#EA580C" />
        <EmergencyTile Icon={HeartPulse} label="Women Helpline"  sub="National helpline for women"      number="1091" color="#DB2777" />

        {/* Medical ID preview */}
        <VStack gap={2} style={styles.medCard}>
          <HStack gap={2} align="center">
            <Info size={16} color={colors.brand[600]} />
            <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Your Medical ID</Text>
            <Text variant="caption" tone="secondary" style={{ marginLeft: 'auto' }}>for first responders</Text>
          </HStack>

          <HStack gap={2} align="center" wrap>
            {medical.bloodGroup !== 'Unknown' && (
              <View style={styles.medBadge}>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#DC2626' }}>{medical.bloodGroup}</Text>
              </View>
            )}
            {medical.organDonor && (
              <View style={[styles.medBadge, { backgroundColor: '#ECFDF5', borderColor: '#059669' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>Organ Donor</Text>
              </View>
            )}
          </HStack>

          {medical.allergies ? (
            <View>
              <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>Allergies:</Text>
              <Text variant="caption" tone="secondary">{medical.allergies}</Text>
            </View>
          ) : null}

          {medical.conditions ? (
            <View>
              <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>Conditions:</Text>
              <Text variant="caption" tone="secondary">{medical.conditions}</Text>
            </View>
          ) : null}

          {medical.doctorName ? (
            <HStack gap={2} align="center">
              <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>Dr: </Text>
              <Text variant="caption" tone="secondary">{medical.doctorName}</Text>
              {medical.doctorPhone ? (
                <Pressable onPress={() => Linking.openURL(`tel:${medical.doctorPhone}`)}>
                  <Text style={{ fontSize: 12, color: colors.brand[600], fontWeight: '700' }}>{medical.doctorPhone}</Text>
                </Pressable>
              ) : null}
            </HStack>
          ) : (
            <Text variant="caption" tone="secondary">No medical ID set up. Add it in Safety Setup.</Text>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  body:   { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] },

  tile:       { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[5], alignItems: 'center', gap: spacing[3], borderTopWidth: 4 },
  tileIcon:   { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  tileTitle:  { fontSize: 18, fontWeight: '900' },
  tileNumber: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  callBadge:  { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: spacing[5], paddingVertical: spacing[2], borderRadius: radius.full },

  medCard:   { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: colors.surface.border },
  medBadge:  { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: radius.sm, paddingHorizontal: spacing[3], paddingVertical: 3 },
});
