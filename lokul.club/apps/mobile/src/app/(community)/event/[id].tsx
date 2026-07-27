import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Check, MapPin, Users } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { EVENTS, RSVPStatus } from '@/data/community-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type RsvpCounts = { yes: number; maybe: number; no: number };
type Attendee   = { user: { id: string; name: string; avatarUrl: string | null } };

type EventDetail = {
  title: string;
  description: string;
  location: string;
  dateLabel: string;
  organizerName: string;
};

type ApiPostDetail = {
  body?: string;
  createdAt: string;
  author?: { name?: string } | null;
};

// Events are created as Post rows of type=event (see events.tsx / event-create.tsx),
// with title/description/venue/date flattened into the post body. Parse that
// back out for display since the API doesn't return separate structured fields.
function parseEventBody(body: string | undefined, createdAt: string): { title: string; description: string; location: string; dateLabel: string } {
  const lines = (body ?? '').split('\n').filter(Boolean);
  const title = lines[0] ?? 'Event';
  let location = '';
  let dateLabel = '';
  const descLines: string[] = [];

  for (const line of lines.slice(1)) {
    if (line.startsWith('📍')) location = line.replace('📍', '').trim();
    else if (line.startsWith('🗓')) dateLabel = line.replace('🗓', '').trim();
    else descLines.push(line);
  }

  if (!dateLabel) {
    dateLabel = new Date(createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  return { title, description: descLines.join('\n'), location, dateLabel };
}

function seedToDetail(seed: (typeof EVENTS)[number]): EventDetail {
  return {
    title: seed.title,
    description: seed.description,
    location: seed.location,
    dateLabel: new Date(seed.startAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    organizerName: seed.organizerName,
  };
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);

  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [rsvp,      setRsvp]      = useState<RSVPStatus>('none');
  const [counts,    setCounts]    = useState<RsvpCounts>({ yes: 0, maybe: 0, no: 0 });
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const loadEvent = useCallback(async () => {
    if (!id) return;
    setEventLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts/${id}`);
      if (res.ok) {
        const data: ApiPostDetail = await res.json();
        const parsed = parseEventBody(data.body, data.createdAt);
        setEventDetail({ ...parsed, organizerName: data.author?.name ?? 'Community' });
        setNotFound(false);
      } else {
        const seed = EVENTS.find((e) => e.id === id);
        if (seed) { setEventDetail(seedToDetail(seed)); setRsvp(seed.myRsvp ?? 'none'); setNotFound(false); }
        else setNotFound(true);
      }
    } catch {
      const seed = EVENTS.find((e) => e.id === id);
      if (seed) { setEventDetail(seedToDetail(seed)); setRsvp(seed.myRsvp ?? 'none'); setNotFound(false); }
      else setNotFound(true);
    } finally {
      setEventLoading(false);
    }
  }, [id]);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  const loadRsvp = useCallback(async () => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(`${BASE}/api/mobile/events/${id}/rsvp`, { signal: ctrl.signal });
      const data = await res.json();
      setCounts(data?.counts ?? { yes: 0, maybe: 0, no: 0 });
      setAttendees(Array.isArray(data?.attendees) ? data.attendees : []);
    } catch { /* aborted or failed */ } finally { clearTimeout(to); }
  }, [id]);

  useEffect(() => { loadRsvp(); }, [loadRsvp]);

  async function handleRsvp(status: RSVPStatus) {
    if (!userId || status === 'none') return;
    setRsvp(status);
    try {
      const res = await fetch(`${BASE}/api/mobile/events/${id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      if (!res.ok) { Alert.alert('RSVP failed', 'Please try again.'); return; }
      loadRsvp();
    } catch { Alert.alert('Network error', 'Please try again.'); }
  }

  const RSVP_OPTIONS: { value: RSVPStatus; label: string }[] = [
    { value: 'yes', label: "I'm Going" },
    { value: 'maybe', label: 'Maybe' },
    { value: 'no', label: "Can't Go" },
  ];

  const RSVP_STYLES: Record<RSVPStatus, { bg: string; text: string }> = {
    yes: { bg: colors.semantic.success, text: '#fff' },
    maybe: { bg: '#F59E0B', text: '#fff' },
    no: { bg: colors.gray[400], text: '#fff' },
    none: { bg: colors.gray[200], text: colors.surface.foreground },
  };

  if (eventLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Event</Text>
        </HStack>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (notFound || !eventDetail) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Event</Text>
        </HStack>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[12] }}>
          This event could not be found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Event</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ padding: spacing[5], gap: spacing[4], paddingBottom: spacing[16] }}>
        {/* Banner placeholder */}
        <View style={styles.banner}>
          <Calendar size={40} color={colors.brand[300]} />
        </View>

        <VStack gap={2}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>{eventDetail.title}</Text>
          <HStack gap={3} align="center">
            <HStack gap={1} align="center">
              <Calendar size={14} color={colors.brand[600]} />
              <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                {eventDetail.dateLabel}
              </Text>
            </HStack>
            {eventDetail.location ? (
              <HStack gap={1} align="center">
                <MapPin size={14} color={colors.gray[400]} />
                <Text variant="caption" tone="secondary">{eventDetail.location}</Text>
              </HStack>
            ) : null}
          </HStack>
          <HStack gap={1} align="center">
            <Users size={14} color={colors.gray[400]} />
            <Text variant="caption" tone="secondary">{counts.yes} people going{counts.maybe > 0 ? ` · ${counts.maybe} maybe` : ''}</Text>
          </HStack>
        </VStack>

        {eventDetail.description ? (
          <Card padding={4} elevation="sm">
            <Text variant="caption" style={{ fontWeight: '700', color: colors.gray[500], marginBottom: spacing[2] }}>
              ABOUT
            </Text>
            <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
              {eventDetail.description}
            </Text>
          </Card>
        ) : null}

        {/* Organiser */}
        <HStack gap={3} align="center" style={styles.organiserRow}>
            <View style={styles.organizerDot} />
            <Text variant="body" style={{ color: colors.surface.heading }}>
              Organised by <Text style={{ fontWeight: '700' }}>{eventDetail.organizerName}</Text>
            </Text>
          </HStack>

        {/* RSVP */}
        <VStack gap={2}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
            Will you attend?
          </Text>
          <HStack gap={2}>
            {RSVP_OPTIONS.map((o) => {
              const isSelected = rsvp === o.value;
              const s = RSVP_STYLES[o.value];
              return (
                <Pressable
                  key={o.value}
                  onPress={() => handleRsvp(o.value)}
                  style={[
                    styles.rsvpChip,
                    isSelected && { backgroundColor: s.bg, borderColor: s.bg },
                  ]}
                  accessibilityRole="button"
                >
                  {isSelected && <Check size={12} color={s.text} />}
                  <Text
                    variant="caption"
                    style={{ fontWeight: '700', color: isSelected ? s.text : colors.surface.foreground }}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        {/* Attendees */}
        {attendees.length > 0 && (
          <VStack gap={2}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Going</Text>
            <HStack gap={2} style={{ flexWrap: 'wrap' }}>
              {attendees.map((a) => (
                <View key={a.user.id} style={styles.attendeeChip}>
                  <Text variant="caption" style={{ fontWeight: '600' }}>{a.user.name.split(' ')[0]}</Text>
                </View>
              ))}
            </HStack>
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  banner: {
    height: 160, backgroundColor: colors.brand[50], borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  organiserRow: {
    backgroundColor: colors.gray[50], borderRadius: 10, padding: spacing[3],
  },
  organizerDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand[400],
  },
  rsvpChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingHorizontal: spacing[3], paddingVertical: spacing[2.5],
    borderRadius: 8, backgroundColor: colors.gray[100],
    borderWidth: 1.5, borderColor: 'transparent',
  },
  attendeeChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: 20, backgroundColor: colors.brand[50], borderWidth: 1, borderColor: colors.brand[100],
  },
});
