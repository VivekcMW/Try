/**
 * Medical ID — View / Edit Screen
 * Route: /(safety)/medical-id
 *
 * Shows a shareable lock-screen card in read mode.
 * Tap "Edit" to switch to full form.
 */
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Heart,
  Info,
  Pencil,
  Phone,
  Pill,
  Stethoscope,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useMedicalIdStore, type BloodGroup } from '@/store/medicalIdStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];

function ReadCard() {
  const m = useMedicalIdStore();
  return (
    <VStack gap={3}>
      <View style={styles.lockNote}>
        <Info size={12} color={colors.brand[600]} />
        <Text style={{ fontSize: 11, color: colors.brand[600], flex: 1 }}>
          This card appears on your lock screen in emergencies. First responders can read it without unlocking your phone.
        </Text>
      </View>

      <View style={styles.idCard}>
        {/* Blood group */}
        <HStack gap={3} align="center" style={styles.idRow}>
          <View style={styles.bloodBadge}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#DC2626' }}>{m.bloodGroup}</Text>
          </View>
          <VStack gap={0}>
            <Text variant="caption" tone="secondary">Blood Group</Text>
            {m.organDonor && (
              <View style={styles.donorBadge}>
                <Heart size={10} color="#059669" />
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#059669' }}>Organ Donor</Text>
              </View>
            )}
          </VStack>
        </HStack>

        {m.allergies ? <InfoRow icon={<Pill size={14} color="#EA580C" />} label="Allergies" value={m.allergies} /> : null}
        {m.conditions ? <InfoRow icon={<Stethoscope size={14} color="#7C3AED" />} label="Conditions" value={m.conditions} /> : null}
        {m.medications ? <InfoRow icon={<Pill size={14} color="#0284C7" />} label="Medications" value={m.medications} /> : null}
        {m.doctorName ? (() => {
            const doctorLine = m.doctorPhone ? m.doctorName + ' · ' + m.doctorPhone : m.doctorName;
            return <InfoRow icon={<Stethoscope size={14} color={colors.brand[600]} />} label="Emergency Doctor" value={doctorLine} />;
          })() : null}
        {m.emergencyNote ? <InfoRow icon={<Info size={14} color={colors.gray[500]} />} label="Note" value={m.emergencyNote} /> : null}

        {!m.allergies && !m.conditions && !m.medications && !m.doctorName && !m.emergencyNote && (
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center', paddingVertical: spacing[3] }}>
            No medical information added yet.
          </Text>
        )}
      </View>
    </VStack>
  );
}

function InfoRow({ icon, label, value }: { readonly icon: React.ReactNode; readonly label: string; readonly value: string }) {
  return (
    <View style={styles.idInfoRow}>
      <HStack gap={2} align="start">
        <View style={{ marginTop: 2 }}>{icon}</View>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="caption" tone="secondary">{label}</Text>
          <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }}>{value}</Text>
        </VStack>
      </HStack>
    </View>
  );
}

function EditForm({ onDone }: { readonly onDone: () => void }) {
  const store  = useMedicalIdStore();
  const userId = useWalletStore((s) => s.userId);

  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${BASE}/api/mobile/safety/medical-id`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, medicalId: { ...store } }),
      });
    } catch { /* offline */ }
    setSaving(false);
    onDone();
  };

  return (
    <VStack gap={3}>
      <VStack gap={2} style={styles.card}>
        <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Blood Group</Text>
        <View style={styles.bloodGrid}>
          {BLOOD_GROUPS.map((bg) => (
            <Pressable
              key={bg}
              onPress={() => store.setBloodGroup(bg)}
              style={[styles.bgChip, store.bloodGroup === bg && styles.bgChipActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: store.bloodGroup === bg }}
            >
              <Text style={[styles.bgText, store.bloodGroup === bg && styles.bgTextActive]}>{bg}</Text>
            </Pressable>
          ))}
        </View>
        <HStack gap={3} align="center" justify="between" style={{ marginTop: spacing[2] }}>
          <Text variant="body" style={{ color: colors.surface.heading }}>Organ Donor</Text>
          <Switch
            value={store.organDonor}
            onValueChange={store.setOrganDonor}
            trackColor={{ true: '#059669' }}
            accessibilityLabel="Organ donor toggle"
          />
        </HStack>
      </VStack>

      {[
        { label: 'Allergies', placeholder: 'e.g. Penicillin, peanuts', value: store.allergies, setter: store.setAllergies },
        { label: 'Medical Conditions', placeholder: 'e.g. Diabetes Type 2, Asthma', value: store.conditions, setter: store.setConditions },
        { label: 'Current Medications', placeholder: 'e.g. Metformin 500mg', value: store.medications, setter: store.setMedications },
        { label: 'Emergency Note', placeholder: 'Any additional note for first responders', value: store.emergencyNote, setter: store.setEmergencyNote },
      ].map(({ label, placeholder, value, setter }) => (
        <VStack key={label} gap={1} style={styles.card}>
          <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.surface.textSecondary}
            value={value}
            onChangeText={setter}
            multiline={label === 'Emergency Note'}
          />
        </VStack>
      ))}

      <VStack gap={2} style={styles.card}>
        <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>Emergency Doctor</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor name"
          placeholderTextColor={colors.surface.textSecondary}
          value={store.doctorName}
          onChangeText={store.setDoctorName}
        />
        <HStack gap={2} align="center" style={{ borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, paddingHorizontal: spacing[3] }}>
          <Phone size={14} color={colors.surface.textSecondary} />
          <TextInput
            style={{ flex: 1, padding: spacing[3], fontSize: 15, color: colors.surface.heading }}
            placeholder="Doctor phone"
            placeholderTextColor={colors.surface.textSecondary}
            keyboardType="phone-pad"
            value={store.doctorPhone}
            onChangeText={store.setDoctorPhone}
          />
        </HStack>
      </VStack>

      <Pressable
        onPress={save}
        style={[styles.saveBtn, saving && { opacity: 0.5 }]}
        disabled={saving}
        accessibilityRole="button"
      >
        <Check size={18} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
          {saving ? 'Saving…' : 'Save Medical ID'}
        </Text>
      </Pressable>
    </VStack>
  );
}

export default function MedicalIdScreen() {
  const router    = useRouter();
  const [editing, setEditing] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <Text variant="body" style={{ fontWeight: '800', flex: 1, color: colors.surface.heading }}>Medical ID</Text>
        <Pressable
          onPress={() => setEditing((e) => !e)}
          style={styles.editBtn}
          accessibilityRole="button"
          accessibilityLabel={editing ? 'Cancel editing' : 'Edit medical ID'}
        >
          <Pencil size={14} color={editing ? colors.surface.textSecondary : colors.brand[600]} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: editing ? colors.surface.textSecondary : colors.brand[600] }}>
            {editing ? 'Cancel' : 'Edit'}
          </Text>
        </Pressable>
      </HStack>

      <ScrollView contentContainerStyle={styles.body}>
        {editing ? <EditForm onDone={() => setEditing(false)} /> : <ReadCard />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  editBtn:{ flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, backgroundColor: `${colors.brand[600]}10` },
  body:   { padding: spacing[4], paddingBottom: spacing[16], gap: spacing[3] },

  lockNote: { flexDirection: 'row', gap: spacing[2], backgroundColor: `${colors.brand[600]}08`, borderRadius: radius.lg, padding: spacing[3], borderWidth: 1, borderColor: `${colors.brand[600]}20` },

  idCard:     { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[3] },
  idRow:      { paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  idInfoRow:  { paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  bloodBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', borderWidth: 2, borderColor: '#FECACA', alignItems: 'center', justifyContent: 'center' },
  donorBadge: { flexDirection: 'row', gap: 3, alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, marginTop: 3 },

  card:    { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[2] },
  input:   { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, padding: spacing[3], fontSize: 15, color: colors.surface.heading },

  bloodGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  bgChip:     { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.lg, backgroundColor: colors.gray[100], borderWidth: 2, borderColor: 'transparent' },
  bgChipActive:{ backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  bgText:     { fontSize: 13, fontWeight: '700', color: colors.surface.textSecondary },
  bgTextActive:{ color: '#DC2626' },

  saveBtn: { backgroundColor: '#059669', borderRadius: radius.xl, paddingVertical: spacing[4], flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center' },
});
