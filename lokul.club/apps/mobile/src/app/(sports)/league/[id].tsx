// Sports Hub — League Detail
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, MapPin, Shield, Trophy, Users } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { LEAGUE_STATUS_META, SPORTS } from '@/data/sports-catalog';
import { type League, type Team } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type LeagueDetail = League & { teams: Team[] };

export default function LeagueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/sports/leagues/${id}`);
      const data = await res.json();
      setLeague(res.ok ? data.league : null);
    } catch {
      setLeague(null);
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

  const teams = league?.teams ?? [];

  if (!league) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>League</Text>
          <View style={{ width: 36 }} />
        </View>
        <VStack gap={2} style={{ padding: spacing.lg, alignItems: 'center' }}>
          <Text variant="body" tone="secondary">This league could not be found.</Text>
        </VStack>
      </SafeAreaView>
    );
  }

  const sport = SPORTS.find((s) => s.id === league.sport);
  const status = LEAGUE_STATUS_META[league.status];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }} numberOfLines={1}>{league.name}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <Card padding={4} elevation="xs" bordered>
            <HStack gap={3} align="center">
              <View style={[styles.sportIcon, { backgroundColor: `${sport?.color ?? colors.brand[600]}20` }]}>
                <Trophy size={22} color={sport?.color ?? colors.brand[600]} />
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="h3" style={{ fontWeight: '700' }}>{league.name}</Text>
                <Text variant="caption" tone="secondary">{sport?.name ?? league.sport} · {league.format}</Text>
              </VStack>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text variant="caption" style={{ fontWeight: '600', color: status.color }}>{status.label}</Text>
              </View>
            </HStack>

            {!!league.description && (
              <Text variant="body" style={{ marginTop: spacing.md }}>{league.description}</Text>
            )}

            <View style={styles.divider} />

            <VStack gap={2}>
              <HStack gap={2} align="center">
                <Calendar size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{league.startDate} – {league.endDate}</Text>
              </HStack>
              <HStack gap={2} align="center">
                <MapPin size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{league.venue}</Text>
              </HStack>
              <HStack gap={2} align="center">
                <Users size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{teams.length}/{league.maxTeams} teams registered</Text>
              </HStack>
            </VStack>

            <View style={styles.divider} />

            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                Entry: ₹{Math.round(league.entryFeePaise / 100)}
              </Text>
              <HStack gap={1.5} align="center">
                <Trophy size={14} color={colors.warning} />
                <Text variant="caption" style={{ fontWeight: '600' }}>{league.prize}</Text>
              </HStack>
            </HStack>
          </Card>

          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Teams</Text>
            <Button
              label="Register Team"
              size="sm"
              variant="secondary"
              onPress={() => router.push({ pathname: '/(sports)/create-team', params: { leagueId: league.id } })}
            />
          </HStack>

          {teams.length === 0 ? (
            <Card padding={4} elevation="none" bordered>
              <Text variant="body" tone="secondary">No teams have registered for this league yet.</Text>
            </Card>
          ) : (
            teams.map((team) => (
              <Pressable key={team.id} onPress={() => router.push({ pathname: '/(sports)/team/[id]', params: { id: team.id } })}>
                <Card padding={3.5} elevation="xs" bordered>
                  <HStack gap={3} align="center">
                    <View style={styles.teamAvatar}>
                      <Shield size={18} color={colors.brand[600]} />
                    </View>
                    <VStack gap={0.5} style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{team.name}</Text>
                      <Text variant="caption" tone="secondary">
                        Captain: {team.captain}{team.captainFlat ? ` (${team.captainFlat})` : ''}
                      </Text>
                    </VStack>
                    <Text variant="caption" tone="secondary">{team.members}/{team.maxMembers}</Text>
                  </HStack>
                </Card>
              </Pressable>
            ))
          )}
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
  sportIcon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
