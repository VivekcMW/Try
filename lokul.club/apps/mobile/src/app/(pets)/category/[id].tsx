/**
 * Pet service category
 * Route: /(pets)/category/[id]
 *
 * Lists pet services filtered to one category (Grooming, Vet Care, etc).
 */
import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Scissors, Star, ChevronRight } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { SERVICE_CATEGORIES, SERVICES } from '../index';

export default function PetCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = SERVICE_CATEGORIES.find((c) => c.id === id);
  const services = SERVICES.filter((s) => s.category === id);
  const Icon = category?.icon ?? Scissors;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{category?.name ?? 'Services'}</Text>
          <Text variant="caption" tone="secondary">{services.length} provider{services.length === 1 ? '' : 's'} nearby</Text>
        </VStack>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        {services.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon size={40} color={colors.textSecondary} />
            <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>
              No {category?.name.toLowerCase() ?? 'services'} providers yet
            </Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.xs }}>
              Check back soon, or browse other categories from Pet Services.
            </Text>
          </Card>
        ) : (
          <VStack gap="md">
            {services.map((service) => (
              <Pressable key={service.id} onPress={() => router.push(`/(pets)/service/${service.id}`)}>
                <Card style={styles.card}>
                  <HStack gap="md">
                    <View style={[styles.icon, { backgroundColor: `${category?.color ?? colors.brand[600]}20` }]}>
                      <Icon size={22} color={category?.color ?? colors.brand[600]} />
                    </View>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{service.name}</Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>{service.description}</Text>
                      <HStack gap="md" style={{ marginTop: spacing.xs }}>
                        <HStack gap="xs">
                          <Star size={12} color={colors.warning} fill={colors.warning} />
                          <Text variant="caption" style={{ fontWeight: '500' }}>{service.rating}</Text>
                        </HStack>
                        <HStack gap="xs">
                          <MapPin size={12} color={colors.textSecondary} />
                          <Text variant="caption" tone="secondary">{service.distance}</Text>
                        </HStack>
                        <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '500' }}>{service.price}</Text>
                      </HStack>
                    </VStack>
                    <ChevronRight size={20} color={colors.textSecondary} />
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        )}
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
  headerTitle: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { padding: spacing.md },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: { padding: spacing[6] ?? 32, alignItems: 'center' },
});
