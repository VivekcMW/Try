import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Star, CheckCircle } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { CATEGORIES, PLANS } from '@/data/insurance-catalog';
import { colors, spacing, radius } from '@lokul/ui-tokens';

export default function CategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = CATEGORIES;
  const plans = PLANS;

  const isAll = id === 'all';
  const category = isAll ? undefined : categories.find((c) => c.id === id);
  const filteredPlans = isAll ? plans : plans.filter((p) => p.category === id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{isAll ? 'All Plans' : category?.name ?? 'Category'}</Text>
          <Text variant="caption" tone="secondary">
            {isAll ? 'Every plan available on Lokul' : category?.description}
          </Text>
        </VStack>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <VStack gap={spacing.md} style={styles.section}>
          {filteredPlans.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                No plans available in this category yet.
              </Text>
            </Card>
          ) : (
            filteredPlans.map((plan) => (
              <Pressable key={plan.id} onPress={() => router.push(`/(insurance)/plan/${plan.id}`)}>
                <Card style={StyleSheet.flatten([styles.planCard, plan.popular && styles.planCardPopular])}>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text variant="caption" tone="inverse" style={{ fontWeight: '700' }}>Popular</Text>
                    </View>
                  )}
                  <HStack style={styles.planHeader}>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="caption" tone="secondary">{plan.provider}</Text>
                      <Text variant="bodyLg" style={{ fontWeight: '600' }}>{plan.name}</Text>
                    </VStack>
                    <HStack gap={spacing.xs}>
                      <Star size={14} color={colors.warning} fill={colors.warning} />
                      <Text variant="caption" style={{ fontWeight: '500' }}>{plan.rating}</Text>
                    </HStack>
                  </HStack>
                  <HStack style={styles.planStats}>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="caption" tone="secondary">Cover</Text>
                      <Text variant="body" style={{ fontWeight: '700' }}>₹{(plan.coverAmount / 100000).toFixed(0)}L</Text>
                    </VStack>
                    <VStack style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text variant="caption" tone="secondary">Premium</Text>
                      <Text variant="body" tone="brand" style={{ fontWeight: '700' }}>
                        ₹{plan.premium}/{plan.premiumFrequency === 'monthly' ? 'mo' : 'yr'}
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack style={styles.planFeatures}>
                    {plan.features.slice(0, 2).map((feature, i) => (
                      <HStack key={i} gap={spacing.xs} style={{ flex: 1 }}>
                        <CheckCircle size={12} color={colors.success} />
                        <Text variant="caption" numberOfLines={1}>{feature}</Text>
                      </HStack>
                    ))}
                  </HStack>
                  <Button
                    label="View Details"
                    variant="secondary"
                    size="sm"
                    onPress={() => router.push(`/(insurance)/plan/${plan.id}`)}
                  />
                </Card>
              </Pressable>
            ))
          )}
        </VStack>
        <View style={{ height: 100 }} />
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
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyCard: { padding: spacing.xl, alignItems: 'center' },
  planCard: {
    padding: spacing.md,
    position: 'relative',
  },
  planCardPopular: {
    borderColor: colors.brand[600],
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.md,
    backgroundColor: colors.brand[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  planHeader: {
    marginBottom: spacing.sm,
  },
  planStats: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  planFeatures: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
});
