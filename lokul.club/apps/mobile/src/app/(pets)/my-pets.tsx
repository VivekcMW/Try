/**
 * My Pets
 * Route: /(pets)/my-pets
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bird, Cat, CheckCircle, Dog, Fish, Plus, PawPrint } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TYPE_ICONS = { dog: Dog, cat: Cat, bird: Bird, fish: Fish, other: PawPrint };

type ApiPet = {
  id: string;
  name: string;
  type: keyof typeof TYPE_ICONS;
  breed: string;
  age: string;
  vaccinated: boolean;
};

export default function MyPetsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [myPets, setMyPets] = useState<ApiPet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/pets?ownerId=${userId}`);
      const data = await res.json();
      setMyPets(data.pets ?? []);
    } catch {
      setMyPets([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }}>My Pets</Text>
        <Pressable onPress={() => router.push('/(pets)/add-pet')} hitSlop={8}>
          <Plus size={22} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView contentContainerStyle={styles.content}>
        {myPets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <PawPrint size={40} color={colors.textSecondary} />
            <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>No pets added yet</Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
              Add your pet so neighbours can find and connect with them.
            </Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Add a Pet" onPress={() => router.push('/(pets)/add-pet')} />
            </View>
          </Card>
        ) : (
          <VStack gap="md">
            {myPets.map((pet) => {
              const Icon = TYPE_ICONS[pet.type];
              return (
                <Pressable key={pet.id} onPress={() => router.push(`/(pets)/pet/${pet.id}`)}>
                  <Card style={styles.card}>
                    <HStack gap="md">
                      <View style={styles.avatar}>
                        <Icon size={26} color={colors.brand[600]} />
                      </View>
                      <VStack style={{ flex: 1 }}>
                        <Text variant="body" style={{ fontWeight: '600' }}>{pet.name}</Text>
                        <Text variant="caption" tone="secondary">{pet.breed} · {pet.age}</Text>
                        {pet.vaccinated && (
                          <HStack gap="xs" style={{ marginTop: 2 }}>
                            <CheckCircle size={12} color={colors.success} />
                            <Text variant="caption" style={{ color: colors.success }}>Vaccinated</Text>
                          </HStack>
                        )}
                      </VStack>
                    </HStack>
                  </Card>
                </Pressable>
              );
            })}
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
  emptyCard: { padding: spacing[6] ?? 32, alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
