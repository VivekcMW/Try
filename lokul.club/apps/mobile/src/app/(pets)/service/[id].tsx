/**
 * Pet service detail
 * Route: /(pets)/service/[id]
 */
import { Alert, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, MessageCircle, Phone, Scissors, Star } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';
import { SERVICE_CATEGORIES, SERVICES } from '../index';

export default function PetServiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const service = SERVICES.find((s) => s.id === id);
  const category = service ? SERVICE_CATEGORIES.find((c) => c.id === service.category) : undefined;
  const Icon = category?.icon ?? Scissors;

  if (!service) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Service not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>{service.name}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        <VStack gap="lg">
          <Card style={styles.card}>
            <HStack gap="md">
              <View style={[styles.icon, { backgroundColor: `${category?.color ?? colors.brand[600]}20` }]}>
                <Icon size={26} color={category?.color ?? colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600' }}>{service.providerName}</Text>
                {service.isNeighbor && (
                  <Text variant="caption" style={{ color: colors.success }}>Neighbor · {service.distance}</Text>
                )}
                <HStack gap="sm" style={{ marginTop: spacing.xs }}>
                  <Star size={13} color={colors.warning} fill={colors.warning} />
                  <Text variant="caption" style={{ fontWeight: '500' }}>{service.rating} ({service.reviews} reviews)</Text>
                </HStack>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.card}>
            <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>About this service</Text>
            <Text variant="body">{service.description}</Text>
          </Card>

          <Card style={styles.card}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="caption" tone="secondary">Price</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>{service.price}</Text>
            </HStack>
            <HStack style={{ justifyContent: 'space-between', marginTop: spacing.sm }}>
              <Text variant="caption" tone="secondary">Distance</Text>
              <HStack gap="xs">
                <MapPin size={13} color={colors.textSecondary} />
                <Text variant="body" style={{ fontWeight: '500' }}>{service.distance}</Text>
              </HStack>
            </HStack>
          </Card>

          <HStack gap="md">
            <Button
              label="Call"
              variant="secondary"
              leftIcon={<Phone size={16} color={colors.brand[600]} />}
              onPress={() => Alert.alert('Call', `Calling ${service.providerName}…`)}
              fullWidth
            />
            <Button
              label="Message"
              leftIcon={<MessageCircle size={16} color="#fff" />}
              onPress={() => Alert.alert('Request sent', `${service.providerName} will get back to you shortly.`)}
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
  icon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
