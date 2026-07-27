import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Car,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  QrCode,
  Bell,
  Users,
  ParkingCircle,
  History,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type Vehicle = {
  id: string;
  slotNumber: string;
  type: 'car' | 'bike';
  location: string;
  number: string;
  vehicleType: string;
  color: string;
  status: 'occupied' | 'vacant' | 'reserved';
};

export type VisitorRequest = {
  id: string;
  visitorName: string;
  vehicleNumber: string;
  vehicleType: string;
  purpose: string;
  requestedSlot: string;
  requestedTime: string;
  duration: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  createdAt: string;
};

/* ════════════════════════════════════════════════════════════════════════
   COMMUNITY-WIDE STATS (society-level, not user-editable — static display)
   ═══════════════════════════════════════════════════════════════════════ */

const COMMUNITY_STATS = {
  totalSlots: 250,
  occupied: 185,
  vacant: 45,
  visitorSlots: 20,
  visitorOccupied: 8,
};

/* ════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<VisitorRequest['status'], { color: string; bg: string; label: string }> = {
  pending: { color: colors.warning, bg: '#FEF3C7', label: 'Pending' },
  approved: { color: colors.success, bg: '#D1FAE5', label: 'Approved' },
  rejected: { color: colors.danger, bg: '#FEE2E2', label: 'Rejected' },
  active: { color: colors.brand[600], bg: colors.brand[50], label: 'Active' },
  completed: { color: colors.textSecondary, bg: colors.surfaceMuted, label: 'Completed' },
};

function SlotCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card style={styles.slotCard}>
      <HStack gap="md" style={styles.slotHeader}>
        <View style={[styles.slotIcon, { backgroundColor: vehicle.type === 'car' ? colors.brand[50] : '#E0E7FF' }]}>
          {vehicle.type === 'car' ? (
            <Car size={24} color={colors.brand[600]} />
          ) : (
            <ParkingCircle size={24} color="#4F46E5" />
          )}
        </View>
        <VStack style={{ flex: 1 }}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Slot {vehicle.slotNumber}</Text>
          <HStack gap="xs" align="center">
            <MapPin size={12} color={colors.textSecondary} />
            <Text variant="caption" tone="secondary">{vehicle.location}</Text>
          </HStack>
        </VStack>
        <View style={[styles.statusDot, { backgroundColor: vehicle.status === 'occupied' ? colors.success : colors.textSecondary }]} />
      </HStack>

      <View style={styles.divider} />
      <HStack gap="md" align="center" style={styles.vehicleInfo}>
        <VStack style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600' }}>{vehicle.number}</Text>
          <Text variant="caption" tone="secondary">{vehicle.vehicleType} • {vehicle.color}</Text>
        </VStack>
        <Pressable
          style={styles.qrButton}
          accessibilityRole="button"
          onPress={() =>
            Alert.alert(
              'Gate Entry Code',
              `No scanner available — show this to security for manual verification:\n\n${vehicle.number}\nSlot ${vehicle.slotNumber} · ${vehicle.location}`,
            )
          }
        >
          <QrCode size={20} color={colors.brand[600]} />
        </Pressable>
      </HStack>
    </Card>
  );
}

function VisitorRequestCard({ request, onAction }: { request: VisitorRequest; onAction: (id: string, action: 'approve' | 'reject') => void }) {
  const status = STATUS_CONFIG[request.status];

  return (
    <Card style={styles.requestCard}>
      <HStack style={styles.requestHeader}>
        <VStack style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '600' }}>{request.visitorName}</Text>
          <Text variant="caption" tone="secondary">{request.vehicleNumber} • {request.vehicleType}</Text>
        </VStack>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text variant="caption" style={{ color: status.color, fontWeight: '600' }}>{status.label}</Text>
        </View>
      </HStack>

      <View style={styles.divider} />

      <VStack gap="xs">
        <HStack gap="sm" align="center">
          <Clock size={14} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">{request.requestedTime} • {request.duration}</Text>
        </HStack>
        <HStack gap="sm" align="center">
          <MapPin size={14} color={colors.textSecondary} />
          <Text variant="caption" tone="secondary">Slot {request.requestedSlot}</Text>
        </HStack>
      </VStack>

      {request.status === 'pending' && (
        <>
          <View style={styles.divider} />
          <HStack gap="md">
            <View style={{ flex: 1 }}>
              <Button
                label="Reject"
                variant="destructive"
                size="sm"
                fullWidth
                onPress={() => onAction(request.id, 'reject')}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Approve"
                size="sm"
                fullWidth
                onPress={() => onAction(request.id, 'approve')}
              />
            </View>
          </HStack>
        </>
      )}
    </Card>
  );
}

export default function ParkingIndexScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'my' | 'requests' | 'community'>('my');
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);

  const load = useCallback(async () => {
    if (!userId || !pinCode) return;
    setLoading(true);
    try {
      const [vehiclesRes, requestsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/parking/vehicles?ownerId=${userId}`),
        fetch(`${BASE}/api/mobile/parking/visitor-requests?pinCode=${pinCode}`),
      ]);
      const vehiclesData = await vehiclesRes.json();
      setVehicles(vehiclesRes.ok ? vehiclesData.vehicles : []);
      const requestsData = await requestsRes.json();
      setVisitorRequests(requestsRes.ok ? requestsData.requests : []);
    } catch {
      setVehicles([]);
      setVisitorRequests([]);
    } finally {
      setLoading(false);
    }
  }, [userId, pinCode]);

  useEffect(() => { load(); }, [load]);

  const handleVisitorAction = (id: string, action: 'approve' | 'reject') => {
    Alert.alert(
      action === 'approve' ? 'Approve Request' : 'Reject Request',
      `Are you sure you want to ${action} this visitor parking request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          onPress: async () => {
            try {
              await fetch(`${BASE}/api/mobile/parking/visitor-requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'rejected' }),
              });
            } finally {
              load();
            }
          },
        },
      ],
    );
  };

  const pendingRequests = visitorRequests.filter((r) => r.status === 'pending').length;

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
      <HStack gap="md" align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.surface.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Parking</Text>
          <Text variant="caption" tone="secondary">Manage your parking & visitors</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(parking)/history')} accessibilityRole="button">
          <History size={20} color={colors.surface.foreground} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {[
          { id: 'my', label: 'My Slots' },
          { id: 'requests', label: 'Requests', badge: pendingRequests },
          { id: 'community', label: 'Community' },
        ].map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as 'my' | 'requests' | 'community')}
          >
            <Text
              variant="body"
              style={{
                fontWeight: activeTab === tab.id ? '600' : '400',
                color: activeTab === tab.id ? colors.brand[600] : colors.textSecondary,
              }}
            >
              {tab.label}
            </Text>
            {tab.badge && tab.badge > 0 && (
              <View style={styles.tabBadge}>
                <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>{tab.badge}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* My Slots Tab */}
        {activeTab === 'my' && (
          <VStack gap="md" style={styles.section}>
            <HStack style={styles.sectionHeader}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>My Parking Slots</Text>
              <Pressable onPress={() => router.push('/(parking)/add-vehicle')} accessibilityRole="button">
                <Plus size={20} color={colors.brand[600]} />
              </Pressable>
            </HStack>

            {vehicles.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Car size={40} color={colors.textSecondary} />
                <Text variant="bodyLg" style={{ marginTop: spacing.md, fontWeight: '500' }}>No vehicles yet</Text>
                <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                  Add a vehicle to assign it to your parking slot.
                </Text>
              </Card>
            ) : (
              vehicles.map((vehicle) => <SlotCard key={vehicle.id} vehicle={vehicle} />)
            )}

            {/* Book Visitor Parking */}
            <Card style={styles.ctaCard}>
              <HStack gap="md">
                <View style={styles.ctaIcon}>
                  <Users size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>Expecting visitors?</Text>
                  <Text variant="caption" tone="secondary">Book a visitor parking slot in advance</Text>
                </VStack>
                <ChevronRight size={20} color={colors.textSecondary} />
              </HStack>
            </Card>

            <Button label="Book Visitor Parking" variant="secondary" onPress={() => router.push('/(parking)/book-visitor')} fullWidth />
          </VStack>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <VStack gap="md" style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Visitor Requests</Text>

            {visitorRequests.length > 0 ? (
              visitorRequests.map((request) => (
                <VisitorRequestCard key={request.id} request={request} onAction={handleVisitorAction} />
              ))
            ) : (
              <Card style={styles.emptyCard}>
                <Bell size={48} color={colors.textSecondary} />
                <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                  No requests
                </Text>
                <Text variant="body" tone="secondary">
                  Visitor parking requests will appear here
                </Text>
              </Card>
            )}
          </VStack>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <VStack gap="md" style={styles.section}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <Text variant="h2" style={{ color: colors.brand[600], fontWeight: '700' }}>
                  {COMMUNITY_STATS.totalSlots}
                </Text>
                <Text variant="caption" tone="secondary">Total Slots</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="h2" style={{ color: colors.danger, fontWeight: '700' }}>
                  {COMMUNITY_STATS.occupied}
                </Text>
                <Text variant="caption" tone="secondary">Occupied</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="h2" style={{ color: colors.success, fontWeight: '700' }}>
                  {COMMUNITY_STATS.vacant}
                </Text>
                <Text variant="caption" tone="secondary">Vacant</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text variant="h2" style={{ color: colors.warning, fontWeight: '700' }}>
                  {COMMUNITY_STATS.visitorSlots - COMMUNITY_STATS.visitorOccupied}
                </Text>
                <Text variant="caption" tone="secondary">Visitor Free</Text>
              </Card>
            </View>

            {/* View Map */}
            <Pressable onPress={() => router.push('/(parking)/map')} accessibilityRole="button">
              <Card style={styles.mapCard}>
                <HStack gap="md">
                  <View style={[styles.ctaIcon, { backgroundColor: '#D1FAE5' }]}>
                    <MapPin size={24} color={colors.success} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>Parking Map</Text>
                    <Text variant="caption" tone="secondary">View nearby slot availability</Text>
                  </VStack>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </HStack>
              </Card>
            </Pressable>

            {/* Rules */}
            <Card style={styles.rulesCard}>
              <Text variant="body" style={[styles.rulesTitle, { fontWeight: '600' }]}>Parking Rules</Text>
              <VStack gap="sm">
                {[
                  'Visitor parking limited to 4 hours per visit',
                  'No parking in fire lanes or reserved spots',
                  'Two-wheelers only in designated zones',
                  'Report violations to security immediately',
                ].map((rule, i) => (
                  <HStack key={i} gap="sm">
                    <View style={styles.ruleDot} />
                    <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{rule}</Text>
                  </HStack>
                ))}
              </VStack>
            </Card>
          </VStack>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1 },
  tabs: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.brand[600],
  },
  tabBadge: {
    backgroundColor: colors.danger,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotCard: { padding: spacing.md },
  slotHeader: { alignItems: 'flex-start' },
  slotIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  vehicleInfo: {
    alignItems: 'center',
  },
  qrButton: {
    padding: spacing.sm,
    backgroundColor: colors.brand[50],
    borderRadius: radius.md,
  },
  requestCard: { padding: spacing.md },
  requestHeader: { alignItems: 'flex-start' },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  ctaCard: { padding: spacing.md },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    alignItems: 'center',
  },
  mapCard: { padding: spacing.md },
  rulesCard: { padding: spacing.md },
  rulesTitle: { marginBottom: spacing.sm },
  ruleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand[600],
    marginTop: 6,
  },
  bottomPadding: { height: 100 },
});
