/**
 * Lost Pets
 * Route: /(pets)/lost
 *
 * Lists active lost-pet reports and lets a neighbour file a new one.
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle2, MapPin, Phone, Plus } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiLostPetReport = {
  id: string;
  name: string;
  breed: string;
  description: string;
  location: string;
  found: boolean;
  createdAt: string;
  reporter: { id: string; name: string; phone: string };
};

export default function LostPetsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [reports, setReports] = useState<ApiLostPetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/lost?pinCode=${pinCode}`);
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  const active = reports.filter((p) => !p.found);
  const found = reports.filter((p) => p.found);

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      Alert.alert('Missing info', "Please add the pet's name and last-seen location.");
      return;
    }
    if (!userId || !pinCode) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reporterId: userId,
          name: name.trim(),
          breed: breed.trim() || undefined,
          description: description.trim() || undefined,
          location: location.trim(),
          pinCode,
        }),
      });
      if (!res.ok) throw new Error('failed');
      setName(''); setBreed(''); setDescription(''); setLocation('');
      setShowForm(false);
      await load();
      Alert.alert('Posted', 'Your neighbours will be notified about your lost pet.');
    } catch {
      Alert.alert('Failed to post', 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const markFound = async (id: string) => {
    try {
      await fetch(`${BASE}/api/mobile/pets/lost/${id}/found`, { method: 'POST' });
      await load();
    } catch {
      Alert.alert('Failed', 'Could not update this report.');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>Lost Pets</Text>
        <Pressable onPress={() => setShowForm((v) => !v)} hitSlop={8}>
          <Plus size={22} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {showForm && (
          <Card style={{ ...styles.card, marginBottom: spacing.md }}>
            <Text variant="body" style={{ fontWeight: '600', marginBottom: spacing.sm }}>Report a Lost Pet</Text>
            <VStack gap="sm">
              <TextInput style={styles.inputFlat} placeholder="Pet's name" placeholderTextColor={colors.textDisabled} value={name} onChangeText={setName} />
              <TextInput style={styles.inputFlat} placeholder="Breed" placeholderTextColor={colors.textDisabled} value={breed} onChangeText={setBreed} />
              <TextInput style={styles.inputFlat} placeholder="Description (color, collar, etc.)" placeholderTextColor={colors.textDisabled} value={description} onChangeText={setDescription} multiline />
              <TextInput style={styles.inputFlat} placeholder="Last seen location" placeholderTextColor={colors.textDisabled} value={location} onChangeText={setLocation} />
              <Button label={submitting ? 'Posting…' : 'Post Alert'} onPress={handleSubmit} disabled={submitting} fullWidth />
            </VStack>
          </Card>
        )}

        {active.length === 0 && found.length === 0 ? (
          <Card style={styles.emptyCard}>
            <AlertTriangle size={40} color={colors.textSecondary} />
            <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>No lost pet reports</Text>
          </Card>
        ) : (
          <VStack gap="md">
            {active.map((pet) => (
              <Card key={pet.id} style={{ ...styles.card, ...styles.alertCard }}>
                <HStack gap="md">
                  <View style={styles.alertIcon}>
                    <AlertTriangle size={22} color={colors.danger} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{pet.name} ({pet.breed})</Text>
                    <Text variant="caption" tone="secondary">{pet.description}</Text>
                    <HStack gap="md" style={{ marginTop: spacing.xs }}>
                      <HStack gap="xs">
                        <MapPin size={12} color={colors.textSecondary} />
                        <Text variant="caption" tone="secondary">{pet.location}</Text>
                      </HStack>
                    </HStack>
                    <HStack gap="md" style={{ marginTop: spacing.sm }}>
                      <Button
                        label="Contact"
                        size="sm"
                        variant="secondary"
                        leftIcon={<Phone size={14} color={colors.brand[600]} />}
                        onPress={() => Alert.alert('Contact', `${pet.reporter.name} · ${pet.reporter.phone}`)}
                      />
                      <Button
                        label="Mark Found"
                        size="sm"
                        variant="ghost"
                        onPress={() => markFound(pet.id)}
                      />
                    </HStack>
                  </VStack>
                </HStack>
              </Card>
            ))}

            {found.map((pet) => (
              <Card key={pet.id} style={styles.card}>
                <HStack gap="md">
                  <View style={styles.foundIcon}>
                    <CheckCircle2 size={20} color={colors.success} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{pet.name}</Text>
                    <Text variant="caption" style={{ color: colors.success }}>Found — reunited with owner</Text>
                  </VStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  alertCard: { backgroundColor: '#FEE2E2', borderColor: colors.danger, borderWidth: 1 },
  alertIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
  },
  foundIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center',
  },
  emptyCard: { padding: spacing[6] ?? 32, alignItems: 'center' },
  inputFlat: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    fontSize: 15, color: colors.foreground, backgroundColor: colors.surfaceMuted,
  },
});
