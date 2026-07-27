/**
 * Safety Setup — Step 2: Medical ID
 * Route: /(safety-setup)/medical-id
 */
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useMedicalIdStore, type BloodGroup } from '@/store/medicalIdStore';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

function Field({
  label, value, onChange, placeholder, keyboard = 'default',
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder?: string;
  readonly keyboard?: 'default' | 'phone-pad';
}) {
  return (
    <VStack gap={1}>
      <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.surface.textSecondary}
        keyboardType={keyboard}
        accessibilityLabel={label}
      />
    </VStack>
  );
}

export default function SetupMedicalIdScreen() {
  const router = useRouter();
  const store  = useMedicalIdStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <VStack gap={1} style={styles.header}>
          <Text style={styles.stepLabel}>Step 2 of 4</Text>
          <Text style={styles.title}>Medical ID</Text>
          <Text style={styles.sub}>
            Shown on your lock screen to first responders. You can update this any time.
          </Text>
        </VStack>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Blood group */}
          <VStack gap={2} style={styles.card}>
            <HStack gap={2} align="center">
              <Heart size={16} color="#DC2626" />
              <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Blood Group</Text>
            </HStack>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack gap={2}>
                {BLOOD_GROUPS.map((bg) => (
                  <Pressable
                    key={bg}
                    onPress={() => store.setBloodGroup(bg)}
                    style={[styles.chip, store.bloodGroup === bg && styles.chipActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: store.bloodGroup === bg }}
                  >
                    <Text style={[styles.chipText, store.bloodGroup === bg && styles.chipTextActive]}>
                      {bg}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            </ScrollView>
          </VStack>

          {/* Medical info */}
          <VStack gap={3} style={styles.card}>
            <Field label="Allergies" value={store.allergies} onChange={store.setAllergies} placeholder="e.g. Penicillin, Peanuts" />
            <Field label="Medical Conditions" value={store.conditions} onChange={store.setConditions} placeholder="e.g. Diabetes, Hypertension" />
            <Field label="Current Medications" value={store.medications} onChange={store.setMedications} placeholder="e.g. Metformin 500mg" />
          </VStack>

          {/* Organ donor */}
          <HStack gap={3} align="center" style={styles.card}>
            <VStack gap={0} style={{ flex: 1 }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Organ Donor</Text>
              <Text variant="caption" tone="secondary">Helps medical teams make faster decisions</Text>
            </VStack>
            <Switch
              value={store.organDonor}
              onValueChange={store.setOrganDonor}
              trackColor={{ false: colors.gray[300], true: colors.brand[600] }}
              thumbColor="#fff"
            />
          </HStack>

          {/* Emergency doctor */}
          <VStack gap={3} style={styles.card}>
            <Field label="Doctor / Hospital Name" value={store.doctorName} onChange={store.setDoctorName} placeholder="Dr. Ramesh Kumar / City Hospital" />
            <Field label="Doctor Phone" value={store.doctorPhone} onChange={store.setDoctorPhone} placeholder="+91 9000000000" keyboard="phone-pad" />
            <Field label="Emergency Note" value={store.emergencyNote} onChange={store.setEmergencyNote} placeholder="Any additional info for first responders" />
          </VStack>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push('/(safety-setup)/triggers')}
            style={styles.btn}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>Next →</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { padding: spacing[5], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.brand[600], textTransform: 'uppercase', letterSpacing: 1 },
  title:     { fontSize: 22, fontWeight: '900', color: colors.surface.heading },
  sub:       { fontSize: 14, color: colors.surface.textSecondary, lineHeight: 20 },
  scroll:    { padding: spacing[4], gap: spacing[3] },
  card:      { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[3], marginBottom: spacing[2] },
  input:     { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, padding: spacing[3], fontSize: 15, color: colors.surface.heading },
  chip:           { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: colors.gray[100], borderWidth: 1, borderColor: 'transparent' },
  chipActive:     { backgroundColor: '#FFF1F1', borderColor: '#DC2626' },
  chipText:       { fontSize: 13, fontWeight: '700', color: colors.surface.textSecondary },
  chipTextActive: { color: '#DC2626' },
  footer: { padding: spacing[4], backgroundColor: colors.surface.background, borderTopWidth: 1, borderTopColor: colors.surface.border },
  btn:    { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
});
