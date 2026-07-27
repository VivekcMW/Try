/**
 * Search doctors (and other catalogs)
 * Route: /(telemedicine)/search
 *
 * Real client-side search over the local doctor catalog — filters as the user types.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search as SearchIcon, Star, X } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { DOCTORS, SPECIALTIES } from '@/data/telemedicine-catalog';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return DOCTORS.filter((d) => {
      const specialty = SPECIALTIES.find((s) => s.id === d.specialty);
      return (
        d.name.toLowerCase().includes(q) ||
        d.qualification.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        (specialty?.name.toLowerCase().includes(q) ?? false) ||
        (d.clinicName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [query]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <HStack style={styles.inputRow}>
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Search doctors, specialties, clinics…"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={colors.textSecondary} />
            </Pressable>
          )}
        </HStack>
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {query.trim().length === 0 && (
          <Text variant="caption" tone="secondary">Start typing to search doctors by name, specialty, or clinic.</Text>
        )}

        {query.trim().length > 0 && results.length === 0 && (
          <VStack style={{ alignItems: 'center', paddingTop: spacing[10] }}>
            <Text variant="body" style={{ fontWeight: '600' }}>No matches found</Text>
            <Text variant="caption" tone="secondary">Try a different name or specialty.</Text>
          </VStack>
        )}

        {results.map((doctor) => {
          const specialty = SPECIALTIES.find((s) => s.id === doctor.specialty);
          return (
            <Pressable key={doctor.id} onPress={() => router.push(`/(telemedicine)/doctor/${doctor.id}`)}>
              <Card style={styles.resultCard}>
                <HStack gap={spacing.md} style={{ alignItems: 'center' }}>
                  <View style={[styles.avatar, { backgroundColor: `${specialty?.color ?? colors.brand[600]}20` }]}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: specialty?.color ?? colors.brand[600] }}>
                      {doctor.name.replace('Dr. ', '').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{doctor.name}</Text>
                    <Text variant="caption" tone="secondary">{specialty?.name ?? doctor.specialty} · {doctor.experience}</Text>
                  </VStack>
                  <HStack gap={spacing.xs}>
                    <Star size={12} color={colors.warning} fill={colors.warning} />
                    <Text variant="caption">{doctor.rating}</Text>
                  </HStack>
                </HStack>
              </Card>
            </Pressable>
          );
        })}
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
  inputRow: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  input: { flex: 1, fontSize: 15, color: colors.foreground },
  content: { padding: spacing.lg, gap: spacing.md },
  resultCard: { padding: spacing.md },
  avatar: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
});
