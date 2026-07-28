import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Target,
  ChevronRight,
  Dumbbell,
  CircleDot,
  Volleyball,
  Bike,
  Waves,
  Footprints,
  Heart,
  Shield,
  Flame,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { LEAGUE_STATUS_META, SKILL_LEVELS, SPORTS, type LeagueStatus, type SkillLevel } from '@/data/sports-catalog';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type League = {
  id: string;
  name: string;
  sport: string;
  format: string;
  description: string;
  venue: string;
  entryFeePaise: number;
  prize: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  status: LeagueStatus;
  _count: { teams: number };
};

export type Team = {
  id: string;
  name: string;
  sport: string;
  leagueId: string | null;
  captain: string;
  captainFlat: string;
  members: number;
  maxMembers: number;
  wins: number;
  losses: number;
  lookingForPlayers: boolean;
};

export type PlayerProfile = {
  id: string;
  flat: string;
  sports: string[];
  skill: SkillLevel;
  lookingToJoin: boolean;
  available: string[];
  bio: string | null;
};

/* ════════════════════════════════════════════════════════════════════════
   Icons for each sport id — name/color reference data itself lives in
   sportsStore.ts (SPORTS) so it can be shared with the create/detail screens.
   ═══════════════════════════════════════════════════════════════════════ */
const SPORT_ICONS: Record<string, typeof Dumbbell> = {
  cricket: CircleDot,
  football: CircleDot,
  badminton: Volleyball,
  tennis: CircleDot,
  basketball: CircleDot,
  running: Footprints,
  cycling: Bike,
  swimming: Waves,
};

/* Matches are illustrative/demo content only — there is no backend Match
   model (nor was one requested), so this tab intentionally stays read-only
   sample data rather than a fake "live" feed. Leagues, teams and player
   profiles below are all real, store-backed data. */
type Match = {
  id: string;
  leagueName: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
  date: string;
  time: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
};

const MATCHES: Match[] = [
  {
    id: '1',
    leagueName: 'Monsoon Football Cup',
    sport: 'football',
    teamA: 'Block A United',
    teamB: 'Tower B FC',
    date: 'Today',
    time: '5:30 PM',
    venue: 'Turf Arena',
    status: 'upcoming',
  },
  {
    id: '2',
    leagueName: 'Monsoon Football Cup',
    sport: 'football',
    teamA: 'Wing C Warriors',
    teamB: 'D-Block Dynamos',
    scoreA: 2,
    scoreB: 1,
    date: 'Today',
    time: '4:00 PM',
    venue: 'Turf Arena',
    status: 'live',
  },
  {
    id: '3',
    leagueName: 'Summer Badminton Open',
    sport: 'badminton',
    teamA: 'Rahul Sharma',
    teamB: 'Amit Patel',
    scoreA: 21,
    scoreB: 18,
    date: 'Yesterday',
    time: '7:00 PM',
    venue: 'Indoor Courts',
    status: 'completed',
  },
];

const MATCH_STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: colors.info, bg: colors.infoBg },
  live: { label: 'LIVE', color: colors.danger, bg: colors.dangerBg },
  completed: { label: 'Completed', color: colors.textSecondary, bg: colors.surfaceMuted },
};

/* ════════════════════════════════════════════════════════════════════════ */

function LeagueCard({ league, teamCount, onPress }: { league: League; teamCount: number; onPress: () => void }) {
  const sport = SPORTS.find((s) => s.id === league.sport);
  const Icon = (sport && SPORT_ICONS[sport.id]) || Dumbbell;
  const status = LEAGUE_STATUS_META[league.status];

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.leagueCard}>
        <HStack gap={3} style={styles.leagueHeader}>
          <View style={[styles.sportIcon, { backgroundColor: `${sport?.color ?? colors.brand[600]}20` }]}>
            <Icon size={24} color={sport?.color ?? colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{league.name}</Text>
            <Text variant="caption" tone="secondary">{league.format}</Text>
          </VStack>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            {league.status === 'ongoing' && <Flame size={12} color={status.color} />}
            <Text variant="caption" style={{ fontWeight: '600', color: status.color }}>
              {status.label}
            </Text>
          </View>
        </HStack>

        <HStack gap={4} style={styles.leagueMeta}>
          <HStack gap={1}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{league.startDate} - {league.endDate}</Text>
          </HStack>
          <HStack gap={1}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{league.venue}</Text>
          </HStack>
        </HStack>

        <View style={styles.divider} />

        <HStack style={styles.leagueFooter}>
          <VStack gap={0.5}>
            <HStack gap={1}>
              <Users size={14} color={colors.brand[600]} />
              <Text variant="caption">{teamCount}/{league.maxTeams} teams</Text>
            </HStack>
            <Text variant="body" style={{ fontWeight: '600', color: colors.brand[600] }}>
              Entry: ₹{Math.round(league.entryFeePaise / 100)}
            </Text>
          </VStack>
          <VStack gap={0.5} style={{ alignItems: 'flex-end' }}>
            <HStack gap={1}>
              <Trophy size={14} color={colors.warning} />
              <Text variant="caption" style={{ fontWeight: '600' }}>{league.prize}</Text>
            </HStack>
            {league.status === 'registering' && (
              <Button label="Join" size="sm" onPress={onPress} />
            )}
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function MatchCard({ match }: { match: Match }) {
  const status = MATCH_STATUS_CONFIG[match.status];

  return (
    <Card style={StyleSheet.flatten([styles.matchCard, match.status === 'live' && styles.matchCardLive])}>
      <HStack style={styles.matchHeader}>
        <Text variant="caption" tone="secondary">{match.leagueName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          {match.status === 'live' && <Flame size={10} color={status.color} />}
          <Text variant="caption" style={{ fontWeight: '600', color: status.color }}>
            {status.label}
          </Text>
        </View>
      </HStack>

      <HStack style={styles.matchTeams}>
        <VStack style={styles.teamSection}>
          <Text variant="body" style={{ fontWeight: '600' }}>{match.teamA}</Text>
          {match.status !== 'upcoming' && (
            <Text variant="h2" style={{ fontWeight: '700', color: colors.brand[600] }}>
              {match.scoreA}
            </Text>
          )}
        </VStack>
        <Text variant="body" tone="secondary">VS</Text>
        <VStack style={StyleSheet.flatten([styles.teamSection, { alignItems: 'flex-end' }])}>
          <Text variant="body" style={{ fontWeight: '600' }}>{match.teamB}</Text>
          {match.status !== 'upcoming' && (
            <Text variant="h2" style={{ fontWeight: '700', color: colors.brand[600] }}>
              {match.scoreB}
            </Text>
          )}
        </VStack>
      </HStack>

      <HStack style={styles.matchFooter}>
        <HStack gap={1}>
          <Calendar size={12} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">{match.date}</Text>
        </HStack>
        <HStack gap={1}>
          <Clock size={12} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">{match.time}</Text>
        </HStack>
        <HStack gap={1}>
          <MapPin size={12} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">{match.venue}</Text>
        </HStack>
      </HStack>
    </Card>
  );
}

function TeamCard({ team, onPress }: { team: Team; onPress: () => void }) {
  const sport = SPORTS.find((s) => s.id === team.sport);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.teamCard}>
        <HStack gap={3}>
          <View style={[styles.teamAvatar, { backgroundColor: `${sport?.color ?? colors.brand[600]}20` }]}>
            <Shield size={20} color={sport?.color ?? colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: '600' }}>{team.name}</Text>
              {team.lookingForPlayers && (
                <View style={styles.lookingBadge}>
                  <Text variant="caption" tone="success">Recruiting</Text>
                </View>
              )}
            </HStack>
            <Text variant="caption" tone="secondary">
              Captain: {team.captain}{team.captainFlat ? ` (${team.captainFlat})` : ''}
            </Text>
            <HStack gap={3} style={{ marginTop: spacing.xs }}>
              <HStack gap={1}>
                <Users size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{team.members}/{team.maxMembers}</Text>
              </HStack>
              <HStack gap={1}>
                <Trophy size={12} color={colors.success} />
                <Text variant="caption" tone="secondary">W: {team.wins}</Text>
              </HStack>
              <HStack gap={1}>
                <Target size={12} color={colors.danger} />
                <Text variant="caption" tone="secondary">L: {team.losses}</Text>
              </HStack>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

function PlayerCard({ player, name }: { player: PlayerProfile; name: string }) {
  const skillMeta = SKILL_LEVELS.find((s) => s.id === player.skill) ?? SKILL_LEVELS[0];

  return (
    <Card style={styles.playerCard}>
      <HStack gap={3}>
        <View style={styles.playerAvatar}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
          </Text>
        </View>
        <VStack style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600' }}>{name || 'You'}</Text>
          {!!player.flat && <Text variant="caption" tone="secondary">{player.flat}</Text>}
          <HStack gap={2} style={{ marginTop: spacing.xs, flexWrap: 'wrap' }}>
            {player.sports.map((sport) => (
              <View key={sport} style={styles.sportChip}>
                <Text variant="caption">{sport}</Text>
              </View>
            ))}
          </HStack>
        </VStack>
        <VStack style={{ alignItems: 'flex-end' }}>
          <View style={[styles.skillBadge, { backgroundColor: `${skillMeta.color}20` }]}>
            <Text variant="caption" style={{ color: skillMeta.color }}>{skillMeta.label}</Text>
          </View>
          {player.available.length > 0 && (
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
              {player.available.join(', ')}
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  );
}

export default function SportsScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const name = useOnboardingStore((s) => s.name) ?? '';
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'leagues' | 'matches' | 'teams' | 'players'>('leagues');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(null);

  const load = useCallback(async () => {
    if (!pinCode) return;
    setLoading(true);
    try {
      const [leaguesRes, teamsRes, profileRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/sports/leagues?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/sports/teams?pinCode=${pinCode}`),
        userId ? fetch(`${BASE}/api/mobile/sports/players?userId=${userId}`) : Promise.resolve(null),
      ]);
      const leaguesData = await leaguesRes.json();
      setLeagues(leaguesRes.ok ? leaguesData.leagues : []);
      const teamsData = await teamsRes.json();
      setTeams(teamsRes.ok ? teamsData.teams : []);
      if (profileRes) {
        const profileData = await profileRes.json();
        setMyProfile(profileRes.ok ? profileData.profile : null);
      }
    } catch {
      setLeagues([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode, userId]);

  useEffect(() => { load(); }, [load]);

  const filteredLeagues = leagues.filter((l) => !selectedSport || l.sport === selectedSport);
  const filteredTeams = teams.filter((t) => !selectedSport || t.sport === selectedSport);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Sports Hub</Text>
          <Text variant="caption" tone="secondary">Leagues, teams & matches</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(sports)/create')} hitSlop={8}>
          <Plus size={24} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['leagues', 'matches', 'teams', 'players'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="caption"
              style={{
                fontWeight: activeTab === tab ? '600' : '400',
                color: activeTab === tab ? colors.brand[600] : colors.textSecondary,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {/* Sports filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsRowScroll}
        contentContainerStyle={styles.sportsRow}
      >
        {SPORTS.map((sport) => {
          const Icon = SPORT_ICONS[sport.id] || Dumbbell;
          const isSelected = selectedSport === sport.id;
          return (
            <Pressable
              key={sport.id}
              style={[styles.sportChipFilter, isSelected && { backgroundColor: sport.color, borderColor: sport.color }]}
              onPress={() => setSelectedSport(isSelected ? null : sport.id)}
            >
              <Icon size={14} color={isSelected ? colors.background : sport.color} />
              <Text
                variant="caption"
                style={{
                  fontWeight: isSelected ? '600' : '400',
                  color: isSelected ? colors.background : colors.foreground,
                }}
              >
                {sport.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'leagues' && (
          <VStack gap={3} style={styles.section}>
            {filteredLeagues.length === 0 && (
              <Card style={styles.emptyCard}>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                  No leagues yet. Be the first to organize one!
                </Text>
              </Card>
            )}
            {filteredLeagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                teamCount={teams.filter((t) => t.leagueId === league.id).length}
                onPress={() => router.push({ pathname: '/(sports)/league/[id]', params: { id: league.id } })}
              />
            ))}

            <Card style={styles.createCard}>
              <VStack style={{ alignItems: 'center' }}>
                <Trophy size={32} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '600', marginTop: spacing.sm }}>
                  Organize a League
                </Text>
                <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                  Create tournaments for your community
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <Button label="Create League" onPress={() => router.push('/(sports)/create')} />
                </View>
              </VStack>
            </Card>
          </VStack>
        )}

        {activeTab === 'matches' && (
          <VStack gap={3} style={styles.section}>
            {MATCHES.filter((m) => m.status === 'live').length > 0 && (
              <>
                <HStack gap={1} style={{ alignItems: 'center' }}>
                  <Flame size={16} color={colors.danger} />
                  <Text variant="bodyLg" style={{ fontWeight: '600' }}>Live Now</Text>
                </HStack>
                {MATCHES.filter((m) => m.status === 'live').map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </>
            )}

            <Text variant="bodyLg" style={{ fontWeight: '600', marginTop: spacing.md }}>
              Upcoming
            </Text>
            {MATCHES.filter((m) => m.status === 'upcoming').map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}

            <Text variant="bodyLg" style={{ fontWeight: '600', marginTop: spacing.md }}>
              Recent Results
            </Text>
            {MATCHES.filter((m) => m.status === 'completed').map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </VStack>
        )}

        {activeTab === 'teams' && (
          <VStack gap={3} style={styles.section}>
            <HStack style={styles.sectionHeader}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Community Teams</Text>
              <Button
                label="Create Team"
                size="sm"
                variant="secondary"
                onPress={() => router.push('/(sports)/create-team')}
              />
            </HStack>

            {filteredTeams.length === 0 && (
              <Card style={styles.emptyCard}>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                  No teams yet. Create one to start recruiting players.
                </Text>
              </Card>
            )}

            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onPress={() => router.push({ pathname: '/(sports)/team/[id]', params: { id: team.id } })}
              />
            ))}
          </VStack>
        )}

        {activeTab === 'players' && (
          <VStack gap={3} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Looking to Play</Text>
            <Text variant="caption" tone="secondary">
              Your player profile helps neighbors find you for games and teams
            </Text>

            {myProfile && <PlayerCard player={myProfile} name={name} />}

            <Card style={styles.joinCard}>
              <HStack gap={3}>
                <View style={styles.joinIcon}>
                  <Heart size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>
                    {myProfile ? 'Update Your Profile' : 'Find Playing Partners'}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {myProfile
                      ? 'Keep your sports, skill level and availability up to date'
                      : 'Create your player profile to connect with neighbors'}
                  </Text>
                </VStack>
                <Button
                  label={myProfile ? 'Edit' : 'Create'}
                  size="sm"
                  onPress={() => router.push('/(sports)/create-profile')}
                />
              </HStack>
            </Card>
          </VStack>
        )}

        <View style={styles.bottomPadding} />
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
  tabs: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  sportsRowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  sportsRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sportChipFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  leagueCard: {
    padding: spacing.md,
  },
  leagueHeader: {
    alignItems: 'center',
  },
  sportIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  leagueMeta: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  leagueFooter: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  emptyCard: {
    padding: spacing.lg,
  },
  matchCard: {
    padding: spacing.md,
  },
  matchCardLive: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  matchHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  matchTeams: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  teamSection: {
    flex: 1,
  },
  matchFooter: {
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  teamCard: {
    padding: spacing.md,
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookingBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  playerCard: {
    padding: spacing.md,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  skillBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  createCard: {
    padding: spacing[6],
    marginTop: spacing.md,
  },
  joinCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  joinIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: { height: 100 },
});
