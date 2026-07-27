// Sports Hub — Team Detail
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Shield, Target, Trophy, Users } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { SPORTS } from '@/data/sports-catalog';
import { type Team } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type TeamDetail = Team & { league: { id: string; name: string } | null };

export default function TeamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/sports/teams/${id}`);
      const data = await res.json();
      setTeam(res.ok ? data.team : null);
    } catch {
      setTeam(null);
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

  const league = team?.league ?? null;

  if (!team) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Team</Text>
          <View style={{ width: 36 }} />
        </View>
        <VStack gap={2} style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text variant="body" tone="secondary">This team could not be found.</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  const sport = SPORTS.find((s) => s.id === team.sport);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>{team.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Card padding={4} elevation="xs" bordered>
            <HStack gap={3} align="center">
              <View style={[styles.teamAvatar, { backgroundColor: `${sport?.color ?? colors.brand[600]}20` }]}>
                <Shield size={22} color={sport?.color ?? colors.brand[600]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="h3" style={{ fontWeight: '700' }}>{team.name}</Text>
                <Text variant="caption" tone="secondary">{sport?.name ?? team.sport}</Text>
              </VStack>
              {team.lookingForPlayers && (
                <View style={styles.lookingBadge}>
                  <Text variant="caption" tone="success" style={{ fontWeight: '600' }}>Recruiting</Text>
                </View>
              )}
            </HStack>

            <View style={styles.divider} />

            <VStack gap={2}>
              <Text variant="caption" tone="secondary">
                Captain: {team.captain}{team.captainFlat ? ` (${team.captainFlat})` : ''}
              </Text>
              {league && (
                <Pressable onPress={() => router.push({ pathname: '/(sports)/league/[id]', params: { id: league.id } })}>
                  <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
                    Playing in {league.name} →
                  </Text>
                </Pressable>
              )}
            </VStack>

            <View style={styles.divider} />

            <HStack gap={4}>
              <HStack gap={1.5} align="center">
                <Users size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{team.members}/{team.maxMembers} members</Text>
              </HStack>
              <HStack gap={1.5} align="center">
                <Trophy size={14} color={colors.success} />
                <Text variant="caption" tone="secondary">W: {team.wins}</Text>
              </HStack>
              <HStack gap={1.5} align="center">
                <Target size={14} color={colors.danger} />
                <Text variant="caption" tone="secondary">L: {team.losses}</Text>
              </HStack>
            </HStack>
          </Card>

          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Roster</Text>
          <Card padding={4} elevation="none" bordered>
            <HStack gap={3} align="center">
              <View style={styles.memberDot}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {team.captain.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <VStack gap={0}>
                <Text variant="body" style={{ fontWeight: '600' }}>{team.captain}</Text>
                <Text variant="caption" tone="secondary">Captain</Text>
              </VStack>
            </HStack>
            {team.members > 1 && (
              <Text variant="caption" tone="secondary" style={{ marginTop: spacing.md }}>
                +{team.members - 1} more member{team.members - 1 === 1 ? '' : 's'}
              </Text>
            )}
          </Card>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surfaceMuted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing[10], gap: spacing.md },
  teamAvatar: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  lookingBadge: { backgroundColor: colors.successBg, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  memberDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center' },
});
