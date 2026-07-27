import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock, LogIn, LogOut, Plus, QrCode, X } from 'lucide-react-native';
import { Avatar, Badge, Card, HStack, Text, VStack } from '@/components/ui';
import { LockedFeatureCard } from '@/components/LockedFeatureCard';
import { useOnboardingStore } from '@/store/onboardingStore';
import { STAFF_MEMBERS } from '@/data/community-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type VisitorLog = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  flat: string;
  status: 'pending' | 'approved' | 'denied';
  entryTime: string | null;
  exitTime:  string | null;
  createdAt: string;
};

type StatusTone = 'success' | 'warning' | 'neutral' | 'danger';
const STATUS_TONE: Record<string, StatusTone> = {
  approved: 'success', pending: 'warning', denied: 'danger',
};

export default function VisitorsScreen() {
  const router     = useRouter();
  const societyId  = useOnboardingStore((s) => s.societyId);
  const [tab,          setTab]          = useState<'visitors' | 'staff'>('visitors');
  const [visitors,     setVisitors]     = useState<VisitorLog[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add visitor form
  const [vName,    setVName]    = useState('');
  const [vPhone,   setVPhone]   = useState('');
  const [vPurpose, setVPurpose] = useState('');
  const [vFlat,    setVFlat]    = useState('');
  const [adding,   setAdding]   = useState(false);

  // Manual visitor-code entry (no camera/scanner library installed — real fallback)
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanCode,      setScanCode]      = useState('');
  const [scanning,      setScanning]      = useState(false);

  const loadVisitors = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/visitors?societyId=${societyId}`);
      const data = await res.json();
      setVisitors(data.items ?? []);
    } catch { setVisitors([]); } finally { setLoading(false); }
  }, [societyId]);

  useEffect(() => { if (tab === 'visitors') loadVisitors(); }, [tab, loadVisitors]);

  async function patchVisitor(id: string, action: 'approve' | 'deny' | 'entry' | 'exit'): Promise<boolean> {
    try {
      const res  = await fetch(`${BASE}/api/mobile/visitors`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, action }),
      });
      if (res.ok) {
        const updated: VisitorLog = await res.json();
        setVisitors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        return true;
      }
      Alert.alert('Not found', 'No visitor found with that ID.');
      return false;
    } catch {
      Alert.alert('Error', 'Action failed. Please try again.');
      return false;
    }
  }

  async function handleManualScan() {
    if (!scanCode.trim()) {
      Alert.alert('Required', 'Enter the visitor ID (e.g. vl-003).');
      return;
    }
    setScanning(true);
    const ok = await patchVisitor(scanCode.trim(), 'entry');
    setScanning(false);
    if (ok) {
      setShowScanModal(false);
      setScanCode('');
    }
  }

  async function addVisitor() {
    if (!vName.trim() || !vFlat.trim()) {
      Alert.alert('Required', 'Enter visitor name and flat number.');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/visitors`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:      vName.trim(),
          phone:     vPhone.trim(),
          purpose:   vPurpose.trim(),
          flat:      vFlat.trim(),
          societyId,
        }),
      });
      if (res.ok) {
        const entry: VisitorLog = await res.json();
        setVisitors((prev) => [entry, ...prev]);
        setShowAddModal(false);
        setVName(''); setVPhone(''); setVPurpose(''); setVFlat('');
      }
    } catch { Alert.alert('Error', 'Could not add visitor.'); }
    finally { setAdding(false); }
  }

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

  if (!societyId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={3} align="center" style={styles.topBar}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={20} color={colors.surface.heading} />
          </Pressable>
          <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Entry Management</Text>
        </HStack>
        <LockedFeatureCard
          title="Society feature"
          description="Map your community to manage visitor entry and household staff."
          ctaLabel="Map my community"
          onPress={() => router.push('/(community-setup)')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/explore')} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Entry Management</Text>
        <Pressable
          onPress={() => setShowScanModal(true)}
          style={styles.qrBtn}
          accessibilityRole="button"
          accessibilityLabel="Enter visitor code"
        >
          <QrCode size={20} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack gap={0} style={styles.tabs}>
        {(['visitors', 'staff'] as const).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
          >
            <Text
              variant="caption"
              style={{
                fontWeight: '700',
                textTransform: 'capitalize',
                color: tab === t ? colors.brand[600] : colors.surface.textSecondary,
              }}
            >
              {t === 'visitors' ? `Visitors (${visitors.length})` : 'Staff'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {tab === 'visitors' ? (
        loading ? (
          <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
        ) : (
          <FlatList
            data={visitors}
            keyExtractor={(v) => v.id}
            contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
            ListHeaderComponent={
              <Pressable
                onPress={() => setShowAddModal(true)}
                style={styles.addVisitorBtn}
                accessibilityRole="button"
              >
                <Plus size={16} color={colors.brand[600]} />
                <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                  Log a visitor
                </Text>
              </Pressable>
            }
            ListEmptyComponent={
              <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[6] }}>
                No visitors today
              </Text>
            }
            renderItem={({ item }) => (
              <Card padding={4} elevation="sm">
                <VStack gap={2}>
                  <HStack gap={3} align="center">
                    <Avatar name={item.name} size="md" />
                    <VStack gap={0.5} style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                        {item.name}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {item.purpose || 'Visitor'} · Flat {item.flat}
                      </Text>
                    </VStack>
                    <Badge label={item.status} tone={STATUS_TONE[item.status] ?? 'neutral'} />
                  </HStack>

                  {/* Entry / Exit times */}
                  <HStack gap={4}>
                    <HStack gap={1} align="center">
                      <LogIn size={13} color={colors.semantic.success} />
                      <Text variant="caption" style={{ color: colors.semantic.success }}>
                        In: {fmt(item.entryTime)}
                      </Text>
                    </HStack>
                    <HStack gap={1} align="center">
                      <LogOut size={13} color={colors.surface.textSecondary} />
                      <Text variant="caption" tone="secondary">
                        Out: {fmt(item.exitTime)}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Action buttons */}
                  <HStack gap={2}>
                    {item.status === 'pending' && (
                      <>
                        <Pressable
                          onPress={() => patchVisitor(item.id, 'approve')}
                          style={styles.approveBtn}
                          accessibilityRole="button"
                        >
                          <CheckCircle size={14} color={colors.semantic.success} />
                          <Text variant="caption" style={{ color: colors.semantic.success, fontWeight: '700' }}>
                            Approve
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => patchVisitor(item.id, 'deny')}
                          style={styles.denyBtn}
                          accessibilityRole="button"
                        >
                          <X size={14} color={colors.semantic.danger} />
                          <Text variant="caption" style={{ color: colors.semantic.danger, fontWeight: '700' }}>
                            Deny
                          </Text>
                        </Pressable>
                      </>
                    )}
                    {item.status === 'approved' && !item.exitTime && (
                      <Pressable
                        onPress={() => patchVisitor(item.id, 'exit')}
                        style={styles.exitBtn}
                        accessibilityRole="button"
                      >
                        <LogOut size={14} color={colors.brand[600]} />
                        <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                          Log Exit
                        </Text>
                      </Pressable>
                    )}
                    {item.exitTime && (
                      <HStack gap={1} align="center">
                        <Clock size={13} color={colors.surface.textSecondary} />
                        <Text variant="caption" tone="secondary">
                          Visit completed
                        </Text>
                      </HStack>
                    )}
                  </HStack>
                </VStack>
              </Card>
            )}
          />
        )
      ) : (
        <FlatList
          data={STAFF_MEMBERS}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
          renderItem={({ item }) => (
            <Card padding={4} elevation="sm">
              <HStack gap={3} align="center">
                <Avatar name={item.name} size="md" />
                <VStack gap={1} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                    {item.name}
                  </Text>
                  <Text variant="caption" tone="secondary">{item.role}</Text>
                </VStack>
                <Badge
                  label={item.todayStatus === 'present' ? 'Present' : item.todayStatus === 'absent' ? 'Absent' : 'Not yet'}
                  tone={item.todayStatus === 'present' ? 'success' : item.todayStatus === 'absent' ? 'danger' : 'neutral'}
                  leftIcon={item.todayStatus === 'present'
                    ? <CheckCircle size={11} color={colors.semantic.success} />
                    : undefined
                  }
                />
              </HStack>
            </Card>
          )}
        />
      )}

      {/* Add Visitor Modal */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAddModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[4] }}>
              <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Log Visitor</Text>
              <Pressable onPress={() => setShowAddModal(false)} accessibilityRole="button">
                <X size={20} color={colors.surface.textSecondary} />
              </Pressable>
            </HStack>

            <VStack gap={3}>
              <TextInput
                value={vName}
                onChangeText={setVName}
                placeholder="Visitor Name *"
                placeholderTextColor={colors.surface.textSecondary}
                style={styles.modalInput}
              />
              <TextInput
                value={vFlat}
                onChangeText={setVFlat}
                placeholder="Visiting Flat *"
                placeholderTextColor={colors.surface.textSecondary}
                style={styles.modalInput}
              />
              <TextInput
                value={vPurpose}
                onChangeText={setVPurpose}
                placeholder="Purpose (Guest, Delivery, Service…)"
                placeholderTextColor={colors.surface.textSecondary}
                style={styles.modalInput}
              />
              <TextInput
                value={vPhone}
                onChangeText={setVPhone}
                placeholder="Phone Number (optional)"
                placeholderTextColor={colors.surface.textSecondary}
                keyboardType="phone-pad"
                style={styles.modalInput}
              />
              <Pressable
                onPress={addVisitor}
                disabled={adding}
                style={[styles.modalSubmit, (adding || !vName.trim() || !vFlat.trim()) && { opacity: 0.5 }]}
                accessibilityRole="button"
              >
                {adding
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Log Entry</Text>
                }
              </Pressable>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Manual Visitor-Code Entry (QR scan fallback — no scanner library installed) */}
      <Modal visible={showScanModal} transparent animationType="slide" onRequestClose={() => setShowScanModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowScanModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <HStack gap={3} align="center" style={{ marginBottom: spacing[4] }}>
              <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Enter Visitor Code</Text>
              <Pressable onPress={() => setShowScanModal(false)} accessibilityRole="button">
                <X size={20} color={colors.surface.textSecondary} />
              </Pressable>
            </HStack>

            <VStack gap={3}>
              <Text variant="caption" tone="secondary">
                No scanner available on this device. Enter the visitor&apos;s ID / code shown on their pass to log entry.
              </Text>
              <TextInput
                value={scanCode}
                onChangeText={setScanCode}
                placeholder="Visitor ID (e.g. vl-003)"
                placeholderTextColor={colors.surface.textSecondary}
                autoCapitalize="none"
                style={styles.modalInput}
              />
              <Pressable
                onPress={handleManualScan}
                disabled={scanning}
                style={[styles.modalSubmit, (scanning || !scanCode.trim()) && { opacity: 0.5 }]}
                accessibilityRole="button"
              >
                {scanning
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text variant="body" style={{ color: '#fff', fontWeight: '700' }}>Log Entry</Text>
                }
              </Pressable>
            </VStack>
          </Pressable>
        </Pressable>
      </Modal>
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
  qrBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brand[50] ?? '#EEF4FB', alignItems: 'center', justifyContent: 'center',
  },
  tabs: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: spacing[3],
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.brand[600] },
  addVisitorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[2],
    paddingVertical: spacing[3], paddingHorizontal: spacing[4],
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.brand[400],
    borderStyle: 'dashed', marginBottom: spacing[3], justifyContent: 'center',
  },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[2], paddingHorizontal: spacing[3],
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.semantic.success,
    justifyContent: 'center',
  },
  denyBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[2], paddingHorizontal: spacing[3],
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.semantic.danger,
    justifyContent: 'center',
  },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingVertical: spacing[2], paddingHorizontal: spacing[3],
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.brand[400],
  },
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
});
