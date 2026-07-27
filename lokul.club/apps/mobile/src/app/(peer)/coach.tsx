// PRD §05.4.5 — Coach dashboard
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Clock, GraduationCap, Plus, Star, Users, X } from 'lucide-react-native';
import { Badge, Button, Card, HStack, Input, Text, VStack } from '@/components/ui';
import { type CoachBatch } from '@/data/peer-seed';
import { usePeerStore } from '@/store/peerRoleStore';
import { usePeerListingsStore } from '@/store/peerListingsStore';
import { useVerificationStore } from '@/store/verificationStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { Header, Stat, ActivateScreen } from './cook';

const CATEGORY_OPTIONS: { id: CoachBatch['category']; label: string }[] = [
  { id: 'fitness', label: 'Fitness' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'music', label: 'Music' },
  { id: 'academics', label: 'Academics' },
  { id: 'dance', label: 'Dance' },
  { id: 'other', label: 'Other' },
];

const CATEGORY_TINT: Record<CoachBatch['category'], string> = {
  fitness: '#EF4444',
  yoga: '#8B5CF6',
  music: '#0EA5E9',
  academics: '#10B981',
  dance: '#EC4899',
  other: colors.brand[600],
};

export default function CoachDashboard() {
  const router = useRouter();
  const coach = usePeerStore((s) => s.roles.coach);
  const activate = usePeerStore((s) => s.activate);
  const tier = useVerificationStore((s) => s.tier);
  const batches = usePeerListingsStore((s) => s.coachBatches);
  const addCoachBatch = usePeerListingsStore((s) => s.addCoachBatch);

  const [addVisible, setAddVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CoachBatch['category']>('fitness');
  const [days, setDays] = useState('');
  const [time, setTime] = useState('');
  const [durationMin, setDurationMin] = useState('60');
  const [feeRupees, setFeeRupees] = useState('');
  const [capacity, setCapacity] = useState('10');

  if (!coach.active) {
    return (
      <ActivateScreen
        title="Coach"
        desc="List your batches, accept students, manage attendance and dues. All within your locality."
        canActivate={tier !== 'bronze'}
        onActivate={() => activate('coach')}
      />
    );
  }

  const totalStudents = batches.reduce((s, b) => s + b.enrolled, 0);
  const monthlyRupees = batches.reduce((s, b) => s + b.enrolled * b.feeRupees, 0);
  const waitlist = batches.reduce((s, b) => s + b.waitlist, 0);

  const resetForm = () => {
    setTitle('');
    setCategory('fitness');
    setDays('');
    setTime('');
    setDurationMin('60');
    setFeeRupees('');
    setCapacity('10');
  };

  const canSubmit = title.trim() && days.trim() && time.trim() && Number(feeRupees) > 0 && Number(capacity) > 0;

  const submitBatch = () => {
    if (!canSubmit) return;
    addCoachBatch({
      title: title.trim(),
      category,
      days: days.trim(),
      time: time.trim(),
      durationMin: Number(durationMin) || 60,
      feeRupees: Number(feeRupees),
      capacity: Number(capacity),
    });
    resetForm();
    setAddVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header title="Coach" onBack={() => router.back()} />

      <View style={styles.statsStrip}>
        <Stat label="Students" value={totalStudents} tint="#10B981" />
        <Stat label="Waitlist" value={waitlist} tint="#F97316" />
        <Stat label="₹/month" value={monthlyRupees} tint={colors.brand[600]} prefix="₹" />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={{ marginBottom: spacing[3] }}>
          <Button label="+ List a new batch" variant="secondary" onPress={() => setAddVisible(true)} fullWidth />
        </View>

        <VStack gap={3}>
          {batches.length === 0 ? (
            <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
              No batches yet — list one to get started
            </Text>
          ) : (
            batches.map((b) => (
              <BatchCard key={b.id} batch={b} />
            ))
          )}
        </VStack>
      </ScrollView>

      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView style={styles.modalSheet} contentContainerStyle={{ paddingBottom: spacing[8] }}>
            <HStack gap={2} align="center" style={{ justifyContent: 'space-between', marginBottom: spacing[3] }}>
              <Text variant="h3">List a new batch</Text>
              <Pressable onPress={() => setAddVisible(false)} hitSlop={10} accessibilityRole="button">
                <X size={20} color={colors.surface.heading} />
              </Pressable>
            </HStack>

            <VStack gap={3}>
              <Input label="Batch title" value={title} onChangeText={setTitle} placeholder="e.g. Evening Zumba" />

              <VStack gap={1.5}>
                <Text variant="label" tone="secondary">Category</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {CATEGORY_OPTIONS.map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategory(c.id)}
                      style={[styles.chip, category === c.id && styles.chipActive]}
                      accessibilityRole="button"
                    >
                      <Text variant="caption" style={{ fontWeight: '700', color: category === c.id ? '#fff' : colors.surface.foreground }}>
                        {c.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </VStack>

              <Input label="Days" value={days} onChangeText={setDays} placeholder="Mon, Wed, Fri" />
              <Input label="Time" value={time} onChangeText={setTime} placeholder="6:00 AM" />
              <HStack gap={3}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Duration (min)"
                    value={durationMin}
                    onChangeText={(v) => setDurationMin(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Capacity"
                    value={capacity}
                    onChangeText={(v) => setCapacity(v.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                  />
                </View>
              </HStack>
              <Input
                label="Fee (₹/month)"
                value={feeRupees}
                onChangeText={(v) => setFeeRupees(v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="1800"
              />

              <Button label="List batch" onPress={submitBatch} disabled={!canSubmit} fullWidth />
            </VStack>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BatchCard({ batch }: { readonly batch: CoachBatch }) {
  const tint = CATEGORY_TINT[batch.category];
  const filled = batch.enrolled / batch.capacity;
  const full = batch.enrolled >= batch.capacity;

  return (
    <Card padding={4} elevation="xs" bordered>
      <HStack gap={3} align="start">
        <View style={[styles.cat, { backgroundColor: tint + '1A' }]}>
          <GraduationCap size={18} color={tint} />
        </View>
        <VStack gap={1} style={{ flex: 1 }}>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between' }}>
            <Text variant="body" style={{ fontWeight: '700', flex: 1 }}>{batch.title}</Text>
            {full && <Badge label="Full" tone="warning" />}
          </HStack>
          <HStack gap={3} align="center">
            <HStack gap={1} align="center">
              <Calendar size={12} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">{batch.days}</Text>
            </HStack>
            <HStack gap={1} align="center">
              <Clock size={12} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary">{batch.time} · {batch.durationMin}m</Text>
            </HStack>
          </HStack>
        </VStack>
      </HStack>

      <View style={styles.divider} />

      <HStack gap={3} align="center" style={{ justifyContent: 'space-between' }}>
        <VStack gap={1} style={{ flex: 1 }}>
          <HStack gap={1.5} align="center">
            <Users size={13} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">
              {batch.enrolled}/{batch.capacity} enrolled
              {batch.waitlist > 0 ? ` · ${batch.waitlist} waitlist` : ''}
            </Text>
          </HStack>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${filled * 100}%`, backgroundColor: tint }]} />
          </View>
        </VStack>
        <VStack gap={0.5} align="end">
          <Text variant="h3" style={{ color: colors.brand[700], fontWeight: '800' }}>₹{batch.feeRupees}</Text>
          <Text variant="caption" tone="secondary">/month</Text>
        </VStack>
      </HStack>

      <HStack gap={2} align="center" style={{ marginTop: spacing[2] }}>
        <Star size={13} color="#F59E0B" fill="#F59E0B" />
        <Text variant="caption" style={{ fontWeight: '700' }}>{batch.rating.toFixed(1)}</Text>
        <Text variant="caption" tone="secondary">· {batch.enrolled + Math.floor(batch.enrolled * 2.3)} reviews</Text>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  statsStrip: {
    flexDirection: 'row',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surface.border,
  },
  scroll: { padding: spacing[4], paddingBottom: spacing[10] },
  cat: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.surface.border,
    marginVertical: spacing[3],
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[100],
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing[5],
    maxHeight: '85%',
  },
  chip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: 8,
    backgroundColor: colors.gray[100], borderWidth: 1.5, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
});
