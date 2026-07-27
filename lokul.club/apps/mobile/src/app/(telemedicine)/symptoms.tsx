/**
 * Symptom Checker
 * Route: /(telemedicine)/symptoms
 */
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, Check, Stethoscope } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { SPECIALTIES } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Symptom = { id: string; label: string; specialtyId: string };

const SYMPTOMS: Symptom[] = [
  { id: 'fever', label: 'Fever', specialtyId: 'general' },
  { id: 'cough', label: 'Cough / Cold', specialtyId: 'general' },
  { id: 'headache', label: 'Headache', specialtyId: 'general' },
  { id: 'rash', label: 'Skin rash / itching', specialtyId: 'dermatology' },
  { id: 'joint-pain', label: 'Joint / bone pain', specialtyId: 'orthopedics' },
  { id: 'chest-pain', label: 'Chest pain / palpitations', specialtyId: 'cardiology' },
  { id: 'anxiety', label: 'Anxiety / low mood', specialtyId: 'psychology' },
  { id: 'vision', label: 'Blurred vision', specialtyId: 'ophthalmology' },
  { id: 'tooth', label: 'Tooth pain', specialtyId: 'dentistry' },
  { id: 'child-fever', label: "Child's fever / cold", specialtyId: 'pediatrics' },
];

export default function SymptomsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [checked, setChecked] = useState(false);
  const [booking, setBooking] = useState(false);

  const toggle = (id: string) => {
    setChecked(false);
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const suggestedSpecialty = useMemo(() => {
    if (selected.length === 0) return SPECIALTIES.find((s) => s.id === 'general')!;
    const counts: Record<string, number> = {};
    for (const id of selected) {
      const sym = SYMPTOMS.find((s) => s.id === id);
      if (sym) counts[sym.specialtyId] = (counts[sym.specialtyId] ?? 0) + 1;
    }
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general';
    return SPECIALTIES.find((s) => s.id === topId) ?? SPECIALTIES[0];
  }, [selected]);

  const handleCheck = () => setChecked(true);

  const handleBookConsult = async () => {
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }
    setBooking(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          doctorName: `Next available ${suggestedSpecialty.name} doctor`,
          specialty: suggestedSpecialty.name,
          mode: 'instant',
          dateLabel: 'Today',
          timeLabel: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          reason: [
            selected.map((id) => SYMPTOMS.find((s) => s.id === id)?.label).filter(Boolean).join(', '),
            notes.trim(),
          ].filter(Boolean).join(' — ') || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('failed');
      router.replace(`/(telemedicine)/appointment/${data.appointment.id}`);
    } catch {
      Alert.alert('Failed to book', 'Please try again.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Symptom Checker</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="caption" tone="secondary">
          This is a simple guide, not a diagnosis. For emergencies, call 112 immediately.
        </Text>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>SELECT WHAT YOU'RE FEELING</Text>
          <View style={styles.chipsWrap}>
            {SYMPTOMS.map((sym) => {
              const isActive = selected.includes(sym.id);
              return (
                <Pressable
                  key={sym.id}
                  onPress={() => toggle(sym.id)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  {isActive && <Check size={12} color={colors.brand[600]} />}
                  <Text variant="caption" style={{ fontWeight: '600', color: isActive ? colors.brand[600] : colors.foreground }}>
                    {sym.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </VStack>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>ANYTHING ELSE? (OPTIONAL)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your symptoms in your own words…"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={notes}
            onChangeText={(v) => { setNotes(v); setChecked(false); }}
          />
        </VStack>

        <Button
          label="Check Symptoms"
          variant="secondary"
          style={{ marginTop: spacing.lg }}
          onPress={handleCheck}
          disabled={selected.length === 0 && notes.trim().length === 0}
        />

        {checked && (
          <Card style={styles.resultCard}>
            <HStack gap={spacing.sm} style={{ alignItems: 'center' }}>
              <AlertCircle size={18} color={colors.warning} />
              <Text variant="body" style={{ fontWeight: '700' }}>Suggested specialty</Text>
            </HStack>
            <HStack gap={spacing.sm} style={{ alignItems: 'center', marginTop: spacing.sm }}>
              <Stethoscope size={16} color={suggestedSpecialty.color} />
              <Text variant="body" style={{ color: suggestedSpecialty.color, fontWeight: '700' }}>
                {suggestedSpecialty.name}
              </Text>
            </HStack>
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
              Based on what you selected, a {suggestedSpecialty.name.toLowerCase()} doctor is a good starting point.
              This does not replace professional medical advice.
            </Text>

            <HStack gap={spacing.sm} style={{ marginTop: spacing.md }}>
              <Button label={booking ? 'Booking…' : 'Book Consult'} onPress={handleBookConsult} disabled={booking} style={{ flex: 1 }} />
              <Button
                label="View Doctors"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.replace('/(telemedicine)')}
              />
            </HStack>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: spacing[10] },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.brand[50], borderColor: colors.brand[600] },
  textArea: {
    minHeight: 80, backgroundColor: colors.surfaceMuted, borderRadius: radius.md,
    padding: spacing.md, fontSize: 15, color: colors.foreground, textAlignVertical: 'top',
  },
  resultCard: { padding: spacing.md, marginTop: spacing.lg },
});
