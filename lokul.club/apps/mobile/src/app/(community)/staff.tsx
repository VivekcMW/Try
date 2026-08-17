// PRD §15 — Staff Attendance Tracking
import { useState } from 'react';
import {
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, LogIn, LogOut, Phone, Plus, X, XCircle } from 'lucide-react-native';
import { Avatar, Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { LockedFeatureCard } from '@/components/LockedFeatureCard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { type StaffMember, type StaffRole } from '@/data/community-seed';
import { useStaffAttendanceStore } from '@/store/staffAttendanceStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(ts: number | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const ROLE_LABELS: Record<string, string> = {
  maid:        'Maid',
  cook:        'Cook',
  driver:      'Driver',
  security:    'Security Guard',
  gardener:    'Gardener',
  electrician: 'Electrician',
  plumber:     'Plumber',
  watchman:    'Watchman',
  other:       'Other',
};

const STATUS_TONE: Record<StaffMember['todayStatus'], 'success' | 'danger' | 'neutral'> = {
  present:  'success',
  absent:   'danger',
  not_yet:  'neutral',
};

const STATUS_LABEL: Record<StaffMember['todayStatus'], string> = {
  present:  'Present',
  absent:   'Absent',
  not_yet:  'Not arrived',
};

// ─── Month bar ────────────────────────────────────────────────────────────────
function AttendanceBar({ attended, total }: { readonly attended: number; readonly total: number }) {
  const pct = total > 0 ? attended / total : 0;
  const color =
    pct >= 0.85 ? colors.semantic.success :
    pct >= 0.6  ? colors.semantic.warning :
                  colors.semantic.danger;
  return (
    <VStack gap={1}>
      <HStack gap={2} align="center">
        <View style={[s.barTrack, { flex: 1 }]}>
          <View style={[s.barFill, { width: `${pct * 100}%` as `${number}%`, backgroundColor: color }]} />
        </View>
        <Text variant="caption" style={{ color, fontWeight: '700', minWidth: 32 }}>
          {attended}/{total}
        </Text>
      </HStack>
      <Text variant="caption" tone="secondary">days this month</Text>
    </VStack>
  );
}

// ─── Staff card ───────────────────────────────────────────────────────────────
function StaffCard({
  member,
  onMarkPresent,
  onMarkAbsent,
}: {
  readonly member: StaffMember;
  readonly onMarkPresent: (id: string) => void;
  readonly onMarkAbsent:  (id: string) => void;
}) {
  const tone  = STATUS_TONE[member.todayStatus];
  const label = STATUS_LABEL[member.todayStatus];
  const today = Math.floor(Date.now() / 86_400_000) * 86_400_000;
  const totalDays = new Date().getDate(); // days elapsed in current month

  return (
    <Card padding={4} elevation="sm">
      <VStack gap={3}>
        {/* Top row */}
        <HStack gap={3} align="center">
          <Avatar name={member.name} size="md" />
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              {member.name}
            </Text>
            <Text variant="caption" tone="secondary">
              {ROLE_LABELS[member.role] ?? member.role} · {member.schedule}
            </Text>
          </VStack>
          <Badge label={label} tone={tone} size="sm" variant="soft" />
        </HStack>

        {/* Check-in / out row */}
        <HStack gap={4}>
          <HStack gap={1} align="center">
            <LogIn size={13} color={colors.semantic.success} />
            <Text variant="caption" tone="secondary">In: </Text>
            <Text variant="caption" style={{ color: colors.surface.heading, fontWeight: '600' }}>
              {fmtTime(member.checkIn)}
            </Text>
          </HStack>
          <HStack gap={1} align="center">
            <LogOut size={13} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">Out: </Text>
            <Text variant="caption" style={{ color: colors.surface.heading, fontWeight: '600' }}>
              {fmtTime(member.checkOut)}
            </Text>
          </HStack>
          <HStack gap={1} align="center" style={{ marginLeft: 'auto' }}>
            <Phone size={13} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[600] }}>
              {member.phone}
            </Text>
          </HStack>
        </HStack>

        {/* Monthly attendance */}
        <AttendanceBar attended={member.monthAttendance} total={totalDays} />

        {/* Mark attendance — only show if not yet marked today */}
        {member.todayStatus === 'not_yet' && (
          <HStack gap={3}>
            <Pressable
              style={[s.markBtn, s.markPresent]}
              onPress={() => onMarkPresent(member.id)}
              accessibilityRole="button"
              accessibilityLabel="Mark present"
            >
              <CheckCircle size={14} color={colors.semantic.success} />
              <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '700' }}>
                Mark Present
              </Text>
            </Pressable>
            <Pressable
              style={[s.markBtn, s.markAbsent]}
              onPress={() => onMarkAbsent(member.id)}
              accessibilityRole="button"
              accessibilityLabel="Mark absent"
            >
              <XCircle size={14} color={colors.semantic.danger} />
              <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700' }}>
                Mark Absent
              </Text>
            </Pressable>
          </HStack>
        )}

        {/* Already present — show check-in time + salary hint */}
        {member.todayStatus === 'present' && (
          <HStack gap={2} align="center" style={s.salaryRow}>
            <Clock size={13} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">
              Monthly salary: ₹{member.salary.toLocaleString('en-IN')}
            </Text>
          </HStack>
        )}
      </VStack>
    </Card>
  );
}

const ROLE_OPTIONS: StaffRole[] = ['maid', 'cook', 'driver', 'nanny', 'gardener', 'other'];

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function StaffScreen() {
  return (
    <FeatureGate featureKey="rwa_management">
      <StaffScreenInner />
    </FeatureGate>
  );
}

function StaffScreenInner() {
  const router    = useRouter();
  const societyId = useOnboardingStore((s) => s.societyId);

  // Staff list + attendance marks persisted locally (no backend Staff/Attendance
  // model exists yet — see src/store/staffAttendanceStore.ts) so they survive remounts.
  const mergedMembers = useStaffAttendanceStore((s) => s.members);
  const markPresent   = useStaffAttendanceStore((s) => s.markPresent);
  const markAbsent    = useStaffAttendanceStore((s) => s.markAbsent);
  const addStaff      = useStaffAttendanceStore((s) => s.addStaff);

  const presentCount  = mergedMembers.filter((m) => m.todayStatus === 'present').length;
  const absentCount   = mergedMembers.filter((m) => m.todayStatus === 'absent').length;
  const notYetCount   = mergedMembers.filter((m) => m.todayStatus === 'not_yet').length;

  // Add-staff form
  const [showAddModal, setShowAddModal] = useState(false);
  const [name,     setName]     = useState('');
  const [role,     setRole]     = useState<StaffRole>('maid');
  const [phone,    setPhone]    = useState('');
  const [schedule, setSchedule] = useState('');
  const [salary,   setSalary]   = useState('');

  function handleAddStaff() {
    setShowAddModal(true);
  }

  function submitAddStaff() {
    if (!name.trim() || !phone.trim()) return;
    addStaff({
      name: name.trim(),
      role,
      phone: phone.trim(),
      schedule: schedule.trim(),
      salary: Number(salary) || 0,
    });
    setShowAddModal(false);
    setName(''); setPhone(''); setSchedule(''); setSalary(''); setRole('maid');
  }

  if (!societyId) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <HStack gap={3} align="center" style={s.topBar}>
          <Pressable
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')}
            style={s.backBtn}
            accessibilityRole="button"
          >
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Staff Attendance</Text>
        </HStack>
        <LockedFeatureCard
          title="Society feature"
          description="Map your community to manage household staff and track attendance."
          ctaLabel="Map my community"
          onPress={() => router.push('/(community-setup)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <HStack gap={3} align="center" style={s.topBar}>
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')}
          style={s.backBtn}
          accessibilityRole="button"
        >
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Staff Attendance</Text>
        <Pressable style={s.addBtn} onPress={handleAddStaff} accessibilityRole="button">
          <Plus size={18} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Summary strip */}
      <HStack gap={0} style={s.summary}>
        <SummaryCell label="Present" value={presentCount} color={colors.semantic.success} />
        <View style={s.divider} />
        <SummaryCell label="Absent"  value={absentCount}  color={colors.semantic.danger}  />
        <View style={s.divider} />
        <SummaryCell label="Pending" value={notYetCount}  color={colors.semantic.warning} />
      </HStack>

      <FlatList
        data={mergedMembers}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListEmptyComponent={
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[8] }}>
            No staff members added yet
          </Text>
        }
        renderItem={({ item }) => (
          <StaffCard
            member={item}
            onMarkPresent={markPresent}
            onMarkAbsent={markAbsent}
          />
        )}
      />

      {/* Add Staff Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setShowAddModal(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[4] }}>
              <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Add Staff</Text>
              <Pressable onPress={() => setShowAddModal(false)} accessibilityRole="button">
                <X size={20} color={colors.surface.textSecondary} />
              </Pressable>
            </HStack>

            <VStack gap={3}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full Name *"
                placeholderTextColor={colors.surface.textSecondary}
                style={s.modalInput}
              />
              <HStack gap={2} style={{ flexWrap: 'wrap' }}>
                {ROLE_OPTIONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    style={[s.roleChip, role === r && s.roleChipSelected]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: role === r }}
                  >
                    <Text
                      variant="caption"
                      style={{
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        color: role === r ? colors.brand[700] : colors.surface.textSecondary,
                      }}
                    >
                      {ROLE_LABELS[r] ?? r}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number *"
                placeholderTextColor={colors.surface.textSecondary}
                keyboardType="phone-pad"
                style={s.modalInput}
              />
              <TextInput
                value={schedule}
                onChangeText={setSchedule}
                placeholder="Schedule (e.g. Mon-Sat, 8-10am)"
                placeholderTextColor={colors.surface.textSecondary}
                style={s.modalInput}
              />
              <TextInput
                value={salary}
                onChangeText={setSalary}
                placeholder="Monthly Salary (₹)"
                placeholderTextColor={colors.surface.textSecondary}
                keyboardType="number-pad"
                style={s.modalInput}
              />
              <Pressable
                onPress={submitAddStaff}
                disabled={!name.trim() || !phone.trim()}
                style={[s.modalSubmit, (!name.trim() || !phone.trim()) && { opacity: 0.5 }]}
                accessibilityRole="button"
              >
                <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Add Staff</Text>
              </Pressable>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryCell({
  label, value, color,
}: {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}) {
  return (
    <VStack gap={0} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing[3] }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color }}>{value}</Text>
      <Text variant="caption" tone="secondary">{label}</Text>
    </VStack>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.surface.background },
  topBar:   { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  backBtn:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  addBtn:   { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center' },
  summary:  { backgroundColor: colors.surface.surfaceMuted, borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  divider:  { width: 0.5, backgroundColor: colors.surface.border, marginVertical: spacing[2] },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surface.border, overflow: 'hidden' },
  barFill:  { height: 6, borderRadius: 3 },
  markBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[1], paddingVertical: spacing[2], borderRadius: 8, borderWidth: 1 },
  markPresent: { borderColor: colors.semantic.success, backgroundColor: colors.semantic.successBg ?? '#F0FDF4' },
  markAbsent:  { borderColor: colors.semantic.danger,  backgroundColor: colors.semantic.dangerBg  ?? '#FEF2F2' },
  salaryRow: { paddingTop: spacing[1] },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing[6], paddingBottom: spacing[10],
  },
  modalInput: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    padding: spacing[3], color: colors.surface.heading, fontSize: 14, lineHeight: 20,
  },
  modalSubmit: {
    backgroundColor: colors.brand[600], borderRadius: radius.md,
    paddingVertical: spacing[3.5], alignItems: 'center',
  },
  roleChip: {
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5],
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border,
    backgroundColor: colors.gray[100],
  },
  roleChipSelected: {
    borderColor: colors.brand[400],
    backgroundColor: colors.brand[50] ?? '#EEF4FB',
  },
});
