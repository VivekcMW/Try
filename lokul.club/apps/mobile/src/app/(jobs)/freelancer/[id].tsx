import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Banknote, MapPin, Phone, Star, Users } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { type Freelancer } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function FreelancerDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/jobs/freelancers/${id}`);
      const data = await res.json();
      setFreelancer(res.ok ? data.freelancer : null);
    } catch {
      setFreelancer(null);
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

  if (!freelancer) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header} gap="md">
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Freelancer</Text>
        </HStack>
        <View style={styles.notFound}>
          <Users size={48} color={colors.textSecondary} />
          <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.md }}>
            Profile not found
          </Text>
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            This freelancer profile may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  function handleContact() {
    if (!freelancer) return;
    if (freelancer.phone) {
      Linking.openURL(`tel:${freelancer.phone}`).catch(() => {
        Alert.alert('Error', 'Could not open the dialer.');
      });
    } else {
      Alert.alert(
        'Contact',
        `${freelancer.user.name} hasn't shared a phone number yet. Reach out via the community directory.`,
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack style={styles.header} gap="md">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>Freelancer Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap="md">
          <HStack gap="md" style={{ alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Text variant="h3" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {freelancer.user.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
            <VStack>
              <Text variant="h3" style={{ fontWeight: '700' }}>{freelancer.user.name}</Text>
              <HStack gap="xs" style={{ alignItems: 'center' }}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{freelancer.flat}</Text>
              </HStack>
            </VStack>
          </HStack>

          <Card padding={4} elevation="xs" bordered>
            <VStack gap="sm">
              <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <HStack gap="xs" style={{ alignItems: 'center' }}>
                  <Star size={16} color={colors.warning} fill={colors.warning} />
                  <Text variant="body">{freelancer.rating} ({freelancer.reviews} reviews)</Text>
                </HStack>
                <HStack gap="xs" style={{ alignItems: 'center' }}>
                  <Banknote size={16} color={colors.brand[600]} />
                  <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                    ₹{Math.round(freelancer.hourlyRatePaise / 100)}/hr
                  </Text>
                </HStack>
              </HStack>
              <Text variant="caption" tone="secondary">{freelancer.experience} experience</Text>
              {freelancer.availability && (
                <Text variant="caption" tone="secondary">Availability: {freelancer.availability}</Text>
              )}
            </VStack>
          </Card>

          <VStack gap="sm">
            <Text variant="label" tone="secondary">Skills</Text>
            <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
              {freelancer.skills.map((skill) => (
                <View key={skill} style={styles.skillChip}>
                  <Text variant="caption">{skill}</Text>
                </View>
              ))}
            </HStack>
          </VStack>

          {freelancer.bio && (
            <VStack gap="sm">
              <Text variant="label" tone="secondary">About</Text>
              <Text variant="body">{freelancer.bio}</Text>
            </VStack>
          )}
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Contact"
          onPress={handleContact}
          leftIcon={<Phone size={16} color="#ffffff" />}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing[10] },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 4,
  },
});
