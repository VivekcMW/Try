import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  Video,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Star,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Stethoscope,
  Pill,
  Syringe,
  Building,
  FileText,
  Upload,
  ShieldCheck,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { SPECIALTIES, DOCTORS, type Doctor } from '@/data/telemedicine-catalog';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMode = 'video' | 'audio' | 'in_person' | 'instant';
type UiMode = 'video' | 'audio' | 'in-person' | 'instant';

type ApiAppointment = {
  id: string;
  doctorName: string;
  specialty: string;
  mode: ApiMode;
  dateLabel: string;
  timeLabel: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

type ApiHealthRecord = {
  id: string;
  title: string;
  doctorName: string | null;
  createdAt: string;
};

const TYPE_CONFIG: Record<UiMode, { label: string; icon: typeof Video; color: string }> = {
  video: { label: 'Video', icon: Video, color: colors.brand[600] },
  audio: { label: 'Audio', icon: Phone, color: colors.success },
  'in-person': { label: 'In-Person', icon: Building, color: colors.warning },
  instant: { label: 'Instant', icon: Video, color: colors.brand[600] },
};

function toUiMode(mode: ApiMode): UiMode {
  return mode === 'in_person' ? 'in-person' : mode;
}

/* ════════════════════════════════════════════════════════════════════════ */

function DoctorCard({ doctor, onPress }: { doctor: Doctor; onPress: () => void }) {
  const specialty = SPECIALTIES.find(s => s.id === doctor.specialty);
  const Icon = specialty?.icon || Stethoscope;

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.doctorCard, doctor.featured && styles.doctorCardFeatured]}>
        <HStack gap={spacing.md}>
          <View style={[styles.doctorAvatar, { backgroundColor: `${specialty?.color || colors.brand[600]}20` }]}>
            <Icon size={24} color={specialty?.color || colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <VStack style={{ flex: 1 }}>
                <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
                  <Text variant="body" style={styles.semibold}>{doctor.name}</Text>
                  {doctor.verified && <BadgeCheck size={14} color={colors.success} />}
                </HStack>
                <Text variant="caption" tone="secondary">{doctor.qualification}</Text>
              </VStack>
              <VStack style={{ alignItems: 'flex-end' }}>
                <HStack gap={spacing.xs}>
                  <Star size={12} color={colors.warning} fill={colors.warning} />
                  <Text variant="caption">{doctor.rating}</Text>
                </HStack>
                <Text variant="caption" tone="secondary">({doctor.reviews})</Text>
              </VStack>
            </HStack>

            <HStack gap={spacing.md} style={{ marginTop: spacing.sm }}>
              <Text variant="caption" style={{ color: specialty?.color }}>{specialty?.name}</Text>
              <Text variant="caption" tone="secondary">{doctor.experience}</Text>
              {doctor.isNeighbor && (
                <View style={styles.neighborBadge}>
                  <Text variant="caption" style={{ color: colors.success, fontSize: 10 }}>Local</Text>
                </View>
              )}
            </HStack>

            {doctor.clinicFlat && (
              <HStack gap={spacing.xs} style={{ marginTop: spacing.xs }}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">
                  {doctor.clinicName || `Clinic at ${doctor.clinicFlat}`}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>

        <View style={styles.divider} />

        <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <VStack>
            <HStack gap={spacing.md}>
              <VStack>
                <Text variant="caption" tone="secondary">Video</Text>
                <Text variant="body" style={[styles.semibold, { color: colors.brand[600] }]}>
                  ₹{doctor.videoFee}
                </Text>
              </VStack>
              <VStack>
                <Text variant="caption" tone="secondary">In-clinic</Text>
                <Text variant="body" style={styles.semibold}>₹{doctor.consultationFee}</Text>
              </VStack>
            </HStack>
          </VStack>
          <VStack style={{ alignItems: 'flex-end' }}>
            {doctor.availableToday ? (
              <>
                <Text variant="caption" style={{ color: colors.success }}>Available Today</Text>
                <Text variant="caption" style={styles.medium}>{doctor.nextSlot}</Text>
              </>
            ) : (
              <Text variant="caption" tone="secondary">{doctor.nextSlot}</Text>
            )}
            <View style={{ marginTop: spacing.xs }}>
              <Button label="Book" size="sm" onPress={onPress} />
            </View>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function AppointmentCard({ appointment, onPress }: { appointment: ApiAppointment; onPress: () => void }) {
  const typeConfig = TYPE_CONFIG[toUiMode(appointment.mode)];
  const TypeIcon = typeConfig.icon;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.appointmentCard}>
        <HStack gap={spacing.md}>
          <View style={[styles.typeIcon, { backgroundColor: `${typeConfig.color}20` }]}>
            <TypeIcon size={20} color={typeConfig.color} />
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={styles.semibold}>{appointment.doctorName}</Text>
            <Text variant="caption" tone="secondary">{appointment.specialty}</Text>
            <HStack gap={spacing.md} style={{ marginTop: spacing.xs }}>
              <HStack gap={spacing.xs}>
                <Calendar size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{appointment.dateLabel}</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <Clock size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{appointment.timeLabel}</Text>
              </HStack>
            </HStack>
          </VStack>
          <VStack style={{ alignItems: 'flex-end' }}>
            <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
              <Text variant="caption" style={{ color: typeConfig.color, fontSize: 10 }}>
                {typeConfig.label}
              </Text>
            </View>
            {(appointment.mode === 'video' || appointment.mode === 'instant') && appointment.status === 'upcoming' && (
              <View style={{ marginTop: spacing.sm }}>
                <Button label="Join" size="sm" onPress={onPress} />
              </View>
            )}
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

function RecordCard({ record, onPress }: { record: ApiHealthRecord; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.recordCard}>
        <HStack gap={spacing.md}>
          <View style={styles.recordIcon}>
            <FileText size={20} color={colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={styles.medium}>{record.title}</Text>
            <Text variant="caption" tone="secondary">{record.doctorName ?? 'Self-uploaded'}</Text>
            <Text variant="caption" tone="secondary">{new Date(record.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</Text>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function TelemedicineScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'doctors' | 'appointments' | 'records'>('doctors');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<ApiHealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [aptRes, recRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/telemedicine/appointments?userId=${userId}`),
        fetch(`${BASE}/api/mobile/telemedicine/records?userId=${userId}`),
      ]);
      const [aptData, recData] = await Promise.all([aptRes.json(), recRes.json()]);
      setAppointments(aptData.appointments ?? []);
      setHealthRecords(recData.records ?? []);
    } catch {
      setAppointments([]);
      setHealthRecords([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const filteredDoctors = DOCTORS.filter(d => !selectedSpecialty || d.specialty === selectedSpecialty);
  const upcomingAppointments = appointments.filter(a => a.status === 'upcoming');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={styles.bold}>Health</Text>
          <Text variant="caption" tone="secondary">Consult doctors online</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(telemedicine)/search')}>
          <Search size={22} color={colors.foreground} />
        </Pressable>
      </HStack>

      {/* Quick Actions */}
      <HStack style={styles.quickActions}>
        <Pressable
          style={styles.quickAction}
          onPress={() => router.push('/(telemedicine)/instant')}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.brand[600] }]}>
            <Video size={20} color={colors.surface.background} />
          </View>
          <Text variant="caption" style={styles.medium}>Instant</Text>
          <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>Consult</Text>
        </Pressable>
        <Pressable
          style={styles.quickAction}
          onPress={() => router.push('/(telemedicine)/symptoms')}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.success }]}>
            <MessageCircle size={20} color={colors.surface.background} />
          </View>
          <Text variant="caption" style={styles.medium}>Symptom</Text>
          <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>Checker</Text>
        </Pressable>
        <Pressable
          style={styles.quickAction}
          onPress={() => router.push('/(telemedicine)/medicines')}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.warning }]}>
            <Pill size={20} color={colors.surface.background} />
          </View>
          <Text variant="caption" style={styles.medium}>Order</Text>
          <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>Medicines</Text>
        </Pressable>
        <Pressable
          style={styles.quickAction}
          onPress={() => router.push('/(telemedicine)/labs')}
        >
          <View style={[styles.quickIcon, { backgroundColor: colors.info }]}>
            <Syringe size={20} color={colors.surface.background} />
          </View>
          <Text variant="caption" style={styles.medium}>Book</Text>
          <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>Lab Test</Text>
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['doctors', 'appointments', 'records'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="caption"
              style={[activeTab === tab ? styles.semibold : styles.regular, { color: activeTab === tab ? colors.brand[600] : colors.textSecondary }]}
            >
              {tab === 'doctors' ? 'Find Doctors' : tab === 'appointments' ? 'My Visits' : 'Records'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {/* Specialties */}
      {activeTab === 'doctors' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtiesRowScroll}
          contentContainerStyle={styles.specialtiesRow}
        >
          {SPECIALTIES.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selectedSpecialty === spec.id;
            return (
              <Pressable
                key={spec.id}
                style={[styles.specialtyChip, isSelected && { backgroundColor: spec.color, borderColor: spec.color }]}
                onPress={() => setSelectedSpecialty(isSelected ? null : spec.id)}
              >
                <Icon size={14} color={isSelected ? colors.surface.background : spec.color} />
                <Text
                  variant="caption"
                  style={[isSelected ? styles.semibold : styles.regular, { color: isSelected ? colors.surface.background : colors.foreground }]}
                >
                  {spec.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {loading && activeTab !== 'doctors' ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'doctors' && (
          <VStack gap={spacing.md} style={styles.section}>
            {filteredDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onPress={() => router.push(`/(telemedicine)/doctor/${doctor.id}`)}
              />
            ))}
          </VStack>
        )}

        {activeTab === 'appointments' && (
          <VStack gap={spacing.md} style={styles.section}>
            {upcomingAppointments.length > 0 && (
              <>
                <Text variant="bodyLg" style={styles.semibold}>Upcoming</Text>
                {upcomingAppointments.map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onPress={() => router.push(`/(telemedicine)/appointment/${apt.id}`)}
                  />
                ))}
              </>
            )}

            {upcomingAppointments.length === 0 && (
              <Card style={styles.emptyCard}>
                <VStack style={{ alignItems: 'center' }}>
                  <Calendar size={48} color={colors.textSecondary} />
                  <Text variant="body" style={[styles.medium, { marginTop: spacing.md }]}>
                    No upcoming appointments
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Book a consultation with a doctor
                  </Text>
                  <View style={{ marginTop: spacing.md }}>
                    <Button
                      label="Find Doctors"
                      onPress={() => setActiveTab('doctors')}
                    />
                  </View>
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        {activeTab === 'records' && (
          <VStack gap={spacing.md} style={styles.section}>
            <HStack style={styles.sectionHeader}>
              <Text variant="bodyLg" style={styles.semibold}>Health Records</Text>
              <Button
                label="Upload"
                size="sm"
                variant="secondary"
                onPress={() => router.push('/(telemedicine)/upload')}
              />
            </HStack>

            {healthRecords.length === 0 && (
              <Text variant="caption" tone="secondary">No health records uploaded yet.</Text>
            )}

            {healthRecords.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                onPress={() => router.push(`/(telemedicine)/record/${record.id}`)}
              />
            ))}

            <Card style={styles.uploadCard}>
              <HStack gap={spacing.md}>
                <View style={styles.uploadIcon}>
                  <Upload size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={styles.semibold}>Upload Records</Text>
                  <Text variant="caption" tone="secondary">
                    Keep all your health records in one place
                  </Text>
                </VStack>
                <Button
                  label="Upload"
                  size="sm"
                  onPress={() => router.push('/(telemedicine)/upload')}
                />
              </HStack>
            </Card>

            <Card style={styles.insuranceCard}>
              <HStack gap={spacing.md}>
                <View style={styles.insuranceIcon}>
                  <ShieldCheck size={24} color={colors.success} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={styles.semibold}>Health Insurance</Text>
                  <Text variant="caption" tone="secondary">
                    Get consultations covered by insurance
                  </Text>
                </VStack>
                <ChevronRight size={20} color={colors.textSecondary} />
              </HStack>
            </Card>
          </VStack>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  bold: { fontWeight: '700' },
  semibold: { fontWeight: '600' },
  medium: { fontWeight: '500' },
  regular: { fontWeight: '400' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  quickActions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
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
  specialtiesRowScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  specialtiesRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  specialtyChip: {
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
  doctorCard: {
    padding: spacing.md,
  },
  doctorCardFeatured: {
    borderColor: colors.brand[600],
    borderWidth: 1,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neighborBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  appointmentCard: {
    padding: spacing.md,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  recordCard: {
    padding: spacing.md,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  uploadCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insuranceCard: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  insuranceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: { height: 100 },
});
