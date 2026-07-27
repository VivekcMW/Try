import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Clock } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { usePeerStore } from '@/store/peerRoleStore';
import { useVerificationStore } from '@/store/verificationStore';
import { usePeerOrders } from '@/hooks/usePeerOrders';
import { colors, spacing } from '@lokul/ui-tokens';
import { ActivateScreen, Header, Stat } from './cook';

type SessionStatus = 'pending' | 'confirmed' | 'completed';

interface Session {
  id: string;
  studentName: string;
  studentFlat: string;
  subject: string;
  level: string;
  scheduledAt: string;
  feeRupees: number;
  status: SessionStatus;
}

const SESSIONS: Session[] = [
  { id: 'tu1', studentName: 'Riya Kapoor',  studentFlat: 'A-201', subject: 'Mathematics', level: 'Class 10', scheduledAt: 'Today, 5:00 PM',   feeRupees: 300, status: 'pending' },
  { id: 'tu2', studentName: 'Aryan Singh',  studentFlat: 'B-304', subject: 'Science',     level: 'Class 8',  scheduledAt: 'Today, 7:00 PM',   feeRupees: 300, status: 'confirmed' },
  { id: 'tu3', studentName: 'Ananya Nair',  studentFlat: 'C-101', subject: 'English',     level: 'Class 6',  scheduledAt: 'Tomorrow, 9 AM',   feeRupees: 250, status: 'completed' },
  { id: 'tu4', studentName: 'Dev Mehta',    studentFlat: 'A-502', subject: 'Hindi',       level: 'Class 5',  scheduledAt: 'Tomorrow, 11 AM',  feeRupees: 200, status: 'pending' },
];

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Coding'];

const STATUS_TONE: Record<SessionStatus, 'warning' | 'info' | 'success'> = {
  pending: 'warning', confirmed: 'info', completed: 'success',
};

export default function TutorDashboard() {
  const router = useRouter();
  const tutor = usePeerStore((s) => s.roles.tutor);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);

  const { orders: apiOrders } = usePeerOrders();

  const [online, setOnline] = useState(true);
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [subjects, setSubjects] = useState<Set<string>>(new Set(['Mathematics', 'Science']));

  useEffect(() => {
    if (apiOrders.length === 0) return;
    const mapped: Session[] = apiOrders.map((o) => ({
      id: o.id,
      studentName: o.buyer.name,
      studentFlat: '',
      subject: o.listing?.title ?? 'Session',
      level: '',
      scheduledAt: new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      feeRupees: Math.round(o.amountPaise / 100),
      status: (o.status === 'completed' ? 'completed' : o.status === 'in_progress' ? 'confirmed' : 'pending') as SessionStatus,
    }));
    setSessions(mapped);
  }, [apiOrders]);

  if (!tutor.active) {
    return (
      <ActivateScreen
        title="Tutor"
        desc="Offer academic coaching to students in your building. Set your subjects and earn per session."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('tutor')}
      />
    );
  }

  const pending   = sessions.filter((s) => s.status === 'pending').length;
  const confirmed = sessions.filter((s) => s.status === 'confirmed').length;
  const todayRupees = sessions.filter((s) => s.status === 'completed').reduce((acc, s) => acc + s.feeRupees, 0);

  const advance = (id: string) =>
    setSessions((arr) =>
      arr.map((s) => {
        if (s.id !== id) return s;
        const next: SessionStatus = s.status === 'pending' ? 'confirmed' : 'completed';
        return { ...s, status: next };
      })
    );

  const toggleSubject = (sub: string) =>
    setSubjects((prev) => {
      const next = new Set(prev);
      next.has(sub) ? next.delete(sub) : next.add(sub);
      return next;
    });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Tutor" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Pending"   value={pending}   tint="#F97316" />
        <Stat label="Confirmed" value={confirmed} tint="#8B5CF6" />
        <Stat label="₹ Today"  value={todayRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <View style={styles.toggleRow}>
        <HStack gap={2} align="center">
          <View style={[styles.dot, { backgroundColor: online ? '#10B981' : '#94A3B8' }]} />
          <Text variant="body" style={{ fontWeight: '700' }}>
            {online ? 'Accepting sessions' : 'Offline'}
          </Text>
        </HStack>
        <Switch
          value={online}
          onValueChange={setOnline}
          trackColor={{ true: colors.brand[600], false: colors.gray[300] }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Subject chips */}
        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: spacing[2] }}>
          My Subjects
        </Text>
        <View style={styles.chipWrap}>
          {SUBJECTS.map((sub) => {
            const on = subjects.has(sub);
            return (
              <Badge
                key={sub}
                label={sub}
                tone={on ? 'brand' : 'neutral'}
                onPress={() => toggleSubject(sub)}
              />
            );
          })}
        </View>

        <Text variant="label" tone="secondary" style={{ textTransform: 'uppercase', letterSpacing: 0.4, marginTop: spacing[4], marginBottom: spacing[2] }}>
          Sessions ({sessions.length})
        </Text>

        {sessions.map((s) => (
          <Card key={s.id} padding={4} elevation="xs" bordered style={{ marginBottom: spacing[3] }}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[2] }}>
              <View style={styles.avatar}>
                <Text style={{ fontWeight: '700', color: '#8B5CF6' }}>
                  {s.studentName.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700' }}>{s.studentName}</Text>
                <Text variant="caption" tone="secondary">{s.studentFlat}</Text>
              </VStack>
              <Badge label={s.status.toUpperCase()} tone={STATUS_TONE[s.status]} />
            </HStack>
            <HStack gap={2} align="center" style={{ marginBottom: spacing[1] }}>
              <BookOpen size={13} color={colors.surface.textSecondary} />
              <Text variant="caption" style={{ flex: 1 }}>{s.subject} · {s.level}</Text>
              <Text variant="body" style={{ fontWeight: '700', color: '#8B5CF6' }}>₹{s.feeRupees}</Text>
            </HStack>
            <HStack gap={1.5} align="center" style={{ marginBottom: spacing[2] }}>
              <Clock size={13} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">{s.scheduledAt}</Text>
            </HStack>
            {s.status !== 'completed' && (
              <Button
                onPress={() => advance(s.id)}
                label={s.status === 'pending' ? 'Accept Session' : 'Mark Completed'}
                fullWidth
              />
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  statsStrip: {
    flexDirection: 'row', backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
    marginBottom: spacing[2],
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  scroll: { padding: spacing[4], paddingBottom: spacing[16] },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#8B5CF620', alignItems: 'center', justifyContent: 'center',
  },
});
