import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Zap,
  Flame,
  Droplets,
  Wifi,
  Tv,
  Phone,
  CreditCard,
  Building,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  History,
  Bell,
  IndianRupee,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack, Badge } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type SavedBiller = {
  id: string;
  category: string;
  provider: string;
  accountNumber: string;
  nickname: string;
  lastBillAmountPaise: number | null;
  dueDate: string | null;
  status: 'due' | 'paid' | 'overdue';
  reminderEnabled: boolean;
};

export type RecentPayment = {
  id: string;
  billerId: string | null;
  biller: string;
  provider: string;
  amountPaise: number;
  createdAt: string;
  status: 'success' | 'pending' | 'failed';
};

type BillCategory = {
  id: string;
  name: string;
  icon: typeof Zap;
  color: string;
  providers: string[];
};

const BILL_CATEGORIES: BillCategory[] = [
  { id: 'electricity', name: 'Electricity', icon: Zap, color: '#F59E0B', providers: ['Adani Electricity', 'MSEDCL', 'Tata Power', 'BSES Rajdhani', 'BSES Yamuna'] },
  { id: 'gas', name: 'Gas', icon: Flame, color: '#EF4444', providers: ['Mahanagar Gas', 'Adani Gas', 'IGL', 'Gujarat Gas', 'Sabarmati Gas'] },
  { id: 'water', name: 'Water', icon: Droplets, color: '#3B82F6', providers: ['Municipal Corporation', 'BWSSB', 'Delhi Jal Board', 'MCGM'] },
  { id: 'broadband', name: 'Broadband', icon: Wifi, color: '#8B5CF6', providers: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL', 'Hathway'] },
  { id: 'dth', name: 'DTH / Cable', icon: Tv, color: '#10B981', providers: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct', 'Videocon d2h'] },
  { id: 'mobile', name: 'Mobile Postpaid', icon: Phone, color: '#EC4899', providers: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'] },
  { id: 'creditcard', name: 'Credit Card', icon: CreditCard, color: '#6366F1', providers: ['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank', 'Kotak Mahindra'] },
  { id: 'society', name: 'Society Maintenance', icon: Building, color: '#14B8A6', providers: ['Your Society'] },
];

/* ════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG = {
  due: { color: colors.warning, bg: '#FEF3C7', label: 'Due Soon' },
  paid: { color: colors.success, bg: '#D1FAE5', label: 'Paid' },
  overdue: { color: colors.danger, bg: '#FEE2E2', label: 'Overdue' },
};

function BillerCard({ biller, onPress }: { biller: SavedBiller; onPress: () => void }) {
  const status = STATUS_CONFIG[biller.status];
  const Icon = BILL_CATEGORIES.find((c) => c.id === biller.category)?.icon || Building;

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.billerCard, biller.status === 'overdue' && styles.billerCardOverdue]}>
        <HStack style={styles.billerHeader}>
          <View style={[styles.billerIcon, { backgroundColor: `${BILL_CATEGORIES.find(c => c.id === biller.category)?.color}20` }]}>
            <Icon size={24} color={BILL_CATEGORIES.find(c => c.id === biller.category)?.color} />
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{biller.nickname}</Text>
            <Text variant="caption" tone="secondary">{biller.provider}</Text>
          </VStack>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text variant="caption" style={{ color: status.color, fontWeight: '600' }}>{status.label}</Text>
          </View>
        </HStack>

        {biller.lastBillAmountPaise != null && (
          <>
            <View style={styles.divider} />
            <HStack style={styles.billerFooter}>
              <VStack>
                <Text variant="caption" tone="secondary">Amount Due</Text>
                <Text variant="bodyLg" style={{ color: colors.brand[600], fontWeight: '700' }}>
                  ₹{Math.round(biller.lastBillAmountPaise / 100).toLocaleString()}
                </Text>
              </VStack>
              <VStack style={{ alignItems: 'flex-end' }}>
                <Text variant="caption" tone="secondary">Due Date</Text>
                <Text variant="body" style={{ color: biller.status === 'overdue' ? colors.danger : colors.foreground, fontWeight: '500' }}>
                  {biller.dueDate}
                </Text>
              </VStack>
              <Button label="Pay" size="sm" onPress={onPress} />
            </HStack>
          </>
        )}
      </Card>
    </Pressable>
  );
}

function CategoryCard({ category, onPress }: { category: BillCategory; onPress: () => void }) {
  const Icon = category.icon;

  return (
    <Pressable style={styles.categoryCard} onPress={onPress}>
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
        <Icon size={24} color={category.color} />
      </View>
      <Text variant="caption" style={{ fontWeight: '500' }} numberOfLines={1}>{category.name}</Text>
    </Pressable>
  );
}

export default function BillPaymentIndexScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [activeTab, setActiveTab] = useState<'pay' | 'history'>('pay');
  const [loading, setLoading] = useState(true);
  const [SAVED_BILLERS, setSavedBillers] = useState<SavedBiller[]>([]);
  const [RECENT_PAYMENTS, setRecentPayments] = useState<RecentPayment[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [billersRes, paymentsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/bills/billers?ownerId=${userId}`),
        fetch(`${BASE}/api/mobile/bills/payments?ownerId=${userId}`),
      ]);
      const billersData = await billersRes.json();
      setSavedBillers(billersRes.ok ? billersData.billers : []);
      const paymentsData = await paymentsRes.json();
      setRecentPayments(paymentsRes.ok ? paymentsData.payments : []);
    } catch {
      setSavedBillers([]);
      setRecentPayments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const dueBills = SAVED_BILLERS.filter(b => b.status !== 'paid');
  const totalDue = dueBills.reduce((sum, b) => sum + (b.lastBillAmountPaise ?? 0), 0);

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
          <Text variant="h3" style={{ fontWeight: '700' }}>Bill Payments</Text>
          <Text variant="caption" tone="secondary">Pay utilities & earn cashback</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(bills)/reminders')}>
          <Bell size={20} color={colors.foreground} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'pay' && styles.tabActive]}
          onPress={() => setActiveTab('pay')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'pay' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'pay' ? '600' : '400',
            }}
          >
            Pay Bills
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'history' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'history' ? '600' : '400',
            }}
          >
            Payment History
          </Text>
        </Pressable>
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'pay' ? (
          <>
            {/* Due Summary */}
            {totalDue > 0 && (
              <Card style={styles.summaryCard}>
                <HStack style={styles.summaryContent}>
                  <VStack>
                    <Text variant="caption" tone="secondary">Total Due</Text>
                    <Text variant="h2" style={{ color: colors.danger, fontWeight: '700' }}>
                      ₹{Math.round(totalDue / 100).toLocaleString()}
                    </Text>
                    <Text variant="caption" tone="secondary">{dueBills.length} bills pending</Text>
                  </VStack>
                  <Button
                    label="Pay All"
                    onPress={() => Alert.alert('Pay All', `Pay all ${dueBills.length} bills totaling ₹${Math.round(totalDue / 100)}?`)}
                  />
                </HStack>
              </Card>
            )}

            {/* Categories Grid */}
            <VStack gap={spacing.sm} style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Pay New Bill</Text>
              </HStack>
              <View style={styles.categoriesGrid}>
                {BILL_CATEGORIES.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onPress={() => router.push(`/(bills)/pay/${category.id}`)}
                  />
                ))}
              </View>
            </VStack>

            {/* Saved Billers */}
            <VStack gap={spacing.md} style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Saved Billers</Text>
                <Pressable onPress={() => router.push('/(bills)/add')}>
                  <Plus size={20} color={colors.brand[600]} />
                </Pressable>
              </HStack>

              {SAVED_BILLERS.map((biller) => (
                <BillerCard
                  key={biller.id}
                  biller={biller}
                  onPress={() => router.push(`/(bills)/pay/${biller.category}?billerId=${biller.id}`)}
                />
              ))}
            </VStack>

            {/* Cashback Banner */}
            <Card style={styles.cashbackCard}>
              <HStack gap={spacing.md}>
                <View style={styles.cashbackIcon}>
                  <IndianRupee size={24} color={colors.success} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>Earn Cashback!</Text>
                  <Text variant="caption" tone="secondary">
                    Get up to 2% cashback on all bill payments. Credited to your Lokul Wallet.
                  </Text>
                </VStack>
              </HStack>
            </Card>
          </>
        ) : (
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Recent Payments</Text>
            
            {RECENT_PAYMENTS.map((payment) => (
              <Card key={payment.id} style={styles.paymentCard}>
                <HStack gap={spacing.md}>
                  <View style={styles.paymentIcon}>
                    <CheckCircle size={20} color={colors.success} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '500' }}>{payment.biller}</Text>
                    <Text variant="caption" tone="secondary">
                      {payment.provider} • {new Date(payment.createdAt).toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Text>
                  </VStack>
                  <Text variant="body" style={{ fontWeight: '600' }}>₹{Math.round(payment.amountPaise / 100)}</Text>
                </HStack>
              </Card>
            ))}

            {RECENT_PAYMENTS.length === 0 && (
              <Card style={styles.emptyCard}>
                <History size={48} color={colors.textSecondary} />
                <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                  No payment history
                </Text>
                <Text variant="body" tone="secondary">
                  Your payments will appear here
                </Text>
              </Card>
            )}
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
    paddingHorizontal: spacing.lg,
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
  scroll: { flex: 1 },
  summaryCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
    borderWidth: 1,
  },
  summaryContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryCard: {
    width: '23%',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  billerCard: {
    padding: spacing.md,
  },
  billerCardOverdue: {
    borderColor: colors.danger,
    borderWidth: 1,
  },
  billerHeader: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  billerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  billerFooter: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cashbackCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#D1FAE5',
  },
  cashbackIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCard: {
    padding: spacing.md,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  bottomPadding: { height: 100 },
});
