/**
 * Community pet detail
 * Route: /(pets)/pet/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Bird, Cat, CheckCircle, Dog, Fish, MessageCircle, PawPrint, Users } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TYPE_ICONS = { dog: Dog, cat: Cat, bird: Bird, fish: Fish, other: PawPrint };

type ApiPet = {
  id: string;
  name: string;
  type: keyof typeof TYPE_ICONS;
  breed: string;
  age: string;
  vaccinated: boolean;
  notes: string | null;
  owner: { id: string; name: string };
};

export default function PetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<ApiPet | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets/${id}`);
      const data = await res.json();
      setPet(res.ok ? data.pet : null);
    } catch {
      setPet(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Pet not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  const Icon = TYPE_ICONS[pet.type];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>{pet.name}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap="lg">
          <Card style={styles.card}>
            <HStack gap="md">
              <View style={styles.avatar}>
                <Icon size={32} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="h3" style={{ fontWeight: '700' }}>{pet.name}</Text>
                <Text variant="caption" tone="secondary">{pet.breed} · {pet.age}</Text>
                {pet.vaccinated && (
                  <HStack gap="xs" style={{ marginTop: spacing.xs }}>
                    <CheckCircle size={14} color={colors.success} />
                    <Text variant="caption" style={{ color: colors.success }}>Vaccinated</Text>
                  </HStack>
                )}
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>Owner</Text>
            <Text variant="body" style={{ fontWeight: '600' }}>{pet.owner.name}</Text>
          </Card>

          {pet.notes && (
            <Card style={styles.card}>
              <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>Notes</Text>
              <Text variant="body">{pet.notes}</Text>
            </Card>
          )}

          <HStack gap="md">
            <Button
              label="Message Owner"
              leftIcon={<MessageCircle size={16} color="#fff" />}
              onPress={() => Alert.alert('Message sent', `${pet.owner.name} will be notified.`)}
              fullWidth
            />
            <Button
              label="Suggest Playdate"
              variant="secondary"
              leftIcon={<Users size={16} color={colors.brand[600]} />}
              onPress={() => router.push('/(pets)/playdate')}
              fullWidth
            />
          </HStack>
        </VStack>
      </ScrollView>
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
