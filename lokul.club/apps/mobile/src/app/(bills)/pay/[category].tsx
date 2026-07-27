import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  CheckCircle,
  Zap,
  Flame,
  Droplets,
  Wifi,
  Tv,
  Phone,
  CreditCard,
  Building,
  IndianRupee,
  Wallet,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';
import { type SavedBiller } from '../index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CATEGORY_INFO: Record<string, { name: string; icon: typeof Zap; color: string; providers: string[] }> = {
  electricity: { name: 'Electricity', icon: Zap, color: '#F59E0B', providers: ['Adani Electricity', 'MSEDCL', 'Tata Power', 'BSES Rajdhani', 'BSES Yamuna'] },
  gas: { name: 'Gas', icon: Flame, color: '#EF4444', providers: ['Mahanagar Gas', 'Adani Gas', 'IGL', 'Gujarat Gas', 'Sabarmati Gas'] },
  water: { name: 'Water', icon: Droplets, color: '#3B82F6', providers: ['Municipal Corporation', 'BWSSB', 'Delhi Jal Board', 'MCGM'] },
  broadband: { name: 'Broadband', icon: Wifi, color: '#8B5CF6', providers: ['Jio Fiber', 'Airtel Xstream', 'ACT Fibernet', 'BSNL', 'Hathway'] },
  dth: { name: 'DTH / Cable', icon: Tv, color: '#10B981', providers: ['Tata Play', 'Airtel DTH', 'Dish TV', 'Sun Direct', 'Videocon d2h'] },
  mobile: { name: 'Mobile Postpaid', icon: Phone, color: '#EC4899', providers: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL'] },
  creditcard: { name: 'Credit Card', icon: CreditCard, color: '#6366F1', providers: ['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank', 'Kotak Mahindra'] },
  society: { name: 'Society Maintenance', icon: Building, color: '#14B8A6', providers: ['Your Society'] },
};

export default function PayBillScreen() {
  const router = useRouter();
  const { category, billerId } = useLocalSearchParams<{ category: string; billerId?: string }>();
  const userId = useWalletStore((s) => s.userId);
  const balancePaise = useWalletStore((s) => s.balancePaise);

  const [initialBiller, setInitialBiller] = useState<SavedBiller | null>(null);
  const [step, setStep] = useState<'provider' | 'details' | 'confirm' | 'success'>(billerId ? 'confirm' : 'provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [matchedBillerId, setMatchedBillerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!billerId || !userId) return;
    fetch(`${BASE}/api/mobile/bills/billers?ownerId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const found = (data.billers as SavedBiller[] | undefined)?.find((b) => b.id === billerId);
        if (found) {
          setInitialBiller(found);
          setSelectedProvider(found.provider);
          setAccountNumber(found.accountNumber);
          setAmount(found.lastBillAmountPaise != null ? String(Math.round(found.lastBillAmountPaise / 100)) : '');
          setMatchedBillerId(found.id);
        }
      })
      .catch(() => {});
  }, [billerId, userId]);

  const categoryInfo = CATEGORY_INFO[category || ''] || CATEGORY_INFO.electricity;
  const Icon = categoryInfo.icon;

  const filteredProviders = categoryInfo.providers.filter(p =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFetchBill = async () => {
    if (!accountNumber.trim()) {
      Alert.alert('Error', 'Please enter your account number');
      return;
    }
    if (!userId) return;
    try {
      const res = await fetch(
        `${BASE}/api/mobile/bills/billers?ownerId=${userId}&category=${category}&accountNumber=${encodeURIComponent(accountNumber.trim())}`,
      );
      const data = await res.json();
      const found: SavedBiller | null = res.ok ? data.biller : null;
      if (found) {
        setMatchedBillerId(found.id);
        setAmount(found.lastBillAmountPaise != null ? String(Math.round(found.lastBillAmountPaise / 100)) : '');
      } else {
        setMatchedBillerId(null);
        setAmount('');
        Alert.alert('No saved bill found', 'We could not find a saved bill for this account. You can still enter the amount manually.');
      }
    } catch {
      setMatchedBillerId(null);
    }
    setStep('confirm');
  };

  const handlePay = () => {
    const amt = Number(amount);
    if (!amount.trim() || Number.isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to pay.');
      return;
    }
    if (!userId) {
      Alert.alert('Not signed in', 'Please complete onboarding first.');
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `Pay ₹${amt} to ${selectedProvider || categoryInfo.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            const amountPaise = Math.round(amt * 100);
            if (amountPaise > balancePaise) {
              Alert.alert('Payment failed', 'Insufficient wallet balance. Please add money to your Lokul Wallet and try again.');
              return;
            }
            setPaying(true);
            try {
              const res = await fetch(`${BASE}/api/mobile/bills/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ownerId: userId,
                  billerId: matchedBillerId ?? undefined,
                  biller: selectedProvider || categoryInfo.name,
                  provider: selectedProvider || categoryInfo.name,
                  amountPaise,
                }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? 'failed');
              }
              useWalletStore.getState().spend(amountPaise, `Bill payment: ${selectedProvider || categoryInfo.name}`, accountNumber || undefined);
              setStep('success');
            } catch {
              Alert.alert('Payment failed', 'Please try again.');
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle size={80} color={colors.success} />
          </View>
          <Text variant="h2" style={[styles.successTitle, { fontWeight: '700' }]}>Payment Successful!</Text>
          <Text variant="body" tone="secondary" style={styles.successSubtitle}>
            Your payment of ₹{amount} has been processed
          </Text>
          
          <Card style={styles.receiptCard}>
            <VStack gap={spacing.sm}>
              <HStack style={styles.receiptRow}>
                <Text variant="caption" tone="secondary">Provider</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{selectedProvider || 'Adani Electricity'}</Text>
              </HStack>
              <HStack style={styles.receiptRow}>
                <Text variant="caption" tone="secondary">Account No.</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{accountNumber || '1234567890'}</Text>
              </HStack>
              <HStack style={styles.receiptRow}>
                <Text variant="caption" tone="secondary">Amount Paid</Text>
                <Text variant="body" style={{ color: colors.success, fontWeight: '700' }}>₹{amount}</Text>
              </HStack>
              <HStack style={styles.receiptRow}>
                <Text variant="caption" tone="secondary">Transaction ID</Text>
                <Text variant="caption" style={{ fontWeight: '500' }}>TXN{Date.now()}</Text>
              </HStack>
              <HStack style={styles.receiptRow}>
                <Text variant="caption" tone="secondary">Cashback</Text>
                <Text variant="body" style={{ color: colors.success, fontWeight: '500' }}>+₹{Math.floor(Number(amount) * 0.02)}</Text>
              </HStack>
            </VStack>
          </Card>

          <VStack gap={spacing.md} style={styles.successActions}>
            <Button label="Done" onPress={() => router.back()} style={{ width: '100%' }} />
            <Pressable onPress={() => Alert.alert('Download Receipt', 'Receipt downloaded successfully')}>
              <Text variant="body" style={{ color: colors.brand[600], fontWeight: '500' }}>Download Receipt</Text>
            </Pressable>
          </VStack>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => {
          if (step === 'provider') router.back();
          else if (step === 'details') setStep('provider');
          else if (step === 'confirm') setStep('details');
        }} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{categoryInfo.name}</Text>
          <Text variant="caption" tone="secondary">
            {step === 'provider' ? 'Select provider' : step === 'details' ? 'Enter details' : 'Confirm payment'}
          </Text>
        </VStack>
        <View style={[styles.headerIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
          <Icon size={20} color={categoryInfo.color} />
        </View>
      </HStack>

      {/* Progress */}
      <HStack style={styles.progressBar}>
        <View style={[styles.progressStep, styles.progressStepActive]} />
        <View style={[styles.progressStep, (step === 'details' || step === 'confirm') && styles.progressStepActive]} />
        <View style={[styles.progressStep, step === 'confirm' && styles.progressStepActive]} />
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 'provider' && (
          <VStack gap={spacing.md} style={styles.section}>
            {/* Search */}
            <View style={styles.searchBox}>
              <Search size={18} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search provider..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Providers List */}
            {filteredProviders.map((provider) => (
              <Pressable
                key={provider}
                style={styles.providerCard}
                onPress={() => {
                  setSelectedProvider(provider);
                  setStep('details');
                }}
              >
                <HStack gap={spacing.md}>
                  <View style={[styles.providerIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
                    <Icon size={24} color={categoryInfo.color} />
                  </View>
                  <Text variant="body" style={{ flex: 1, fontWeight: '500' }}>{provider}</Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </HStack>
              </Pressable>
            ))}
          </VStack>
        )}

        {step === 'details' && (
          <VStack gap={spacing.lg} style={styles.section}>
            <Card style={styles.selectedProvider}>
              <HStack gap={spacing.md}>
                <View style={[styles.providerIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
                  <Icon size={24} color={categoryInfo.color} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>{selectedProvider}</Text>
                  <Text variant="caption" tone="secondary">{categoryInfo.name}</Text>
                </VStack>
                <Pressable onPress={() => setStep('provider')}>
                  <Text variant="caption" style={{ color: colors.brand[600] }}>Change</Text>
                </Pressable>
              </HStack>
            </Card>

            <VStack gap={spacing.sm}>
              <Text variant="body" style={{ fontWeight: '500' }}>Account/Consumer Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your account number"
                placeholderTextColor={colors.textSecondary}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="default"
                autoCapitalize="characters"
              />
            </VStack>

            <Button label="Fetch Bill" onPress={handleFetchBill} />
          </VStack>
        )}

        {step === 'confirm' && (
          <VStack gap={spacing.lg} style={styles.section}>
            {/* Bill Details */}
            <Card style={styles.billCard}>
              <VStack gap={spacing.md}>
                <HStack>
                  <View style={[styles.providerIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
                    <Icon size={24} color={categoryInfo.color} />
                  </View>
                  <VStack style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>{selectedProvider || 'Adani Electricity'}</Text>
                    <Text variant="caption" tone="secondary">Account: {accountNumber || '1234567890'}</Text>
                  </VStack>
                </HStack>

                <View style={styles.divider} />

                <VStack style={styles.billAmount}>
                  <Text variant="caption" tone="secondary">Bill Amount</Text>
                  <Text variant="h1" style={{ color: colors.brand[600], fontWeight: '700' }}>₹{amount || '0'}</Text>
                  <Text variant="caption" tone="secondary">Due: Jun 15, 2026</Text>
                </VStack>
              </VStack>
            </Card>

            {/* Amount Input */}
            <VStack gap={spacing.sm}>
              <Text variant="body" style={{ fontWeight: '500' }}>Pay Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text variant="h3" style={{ fontWeight: '700' }}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </VStack>

            {/* Cashback Info */}
            <Card style={styles.cashbackInfo}>
              <HStack gap={spacing.sm}>
                <IndianRupee size={16} color={colors.success} />
                <Text variant="caption" style={{ flex: 1 }}>
                  <Text style={{ color: colors.success, fontWeight: '600' }}>₹{Math.floor(Number(amount || 0) * 0.02)} cashback</Text>
                  {' '}will be credited to your wallet
                </Text>
              </HStack>
            </Card>

            {/* Payment Method */}
            <VStack gap={spacing.sm}>
              <Text variant="body" style={{ fontWeight: '500' }}>Payment Method</Text>
              <Pressable style={[styles.paymentMethod, styles.paymentMethodSelected]}>
                <HStack gap={spacing.md}>
                  <View style={styles.walletIcon}>
                    <Wallet size={20} color={colors.brand[600]} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '500' }}>Lokul Wallet</Text>
                    <Text variant="caption" tone="secondary">Balance: ₹{Math.round(balancePaise / 100).toLocaleString()}</Text>
                  </VStack>
                  <CheckCircle size={20} color={colors.brand[600]} />
                </HStack>
              </Pressable>
            </VStack>

            <Button label={paying ? 'Processing…' : `Pay ₹${amount || '0'}`} onPress={handlePay} disabled={paying} loading={paying} />
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
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: colors.brand[600],
  },
  scroll: { flex: 1 },
  section: {
    padding: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.foreground,
  },
  providerCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedProvider: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billCard: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  billAmount: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  cashbackInfo: {
    padding: spacing.md,
    backgroundColor: '#D1FAE5',
  },
  paymentMethod: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paymentMethodSelected: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[50],
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  receiptCard: {
    padding: spacing.lg,
    width: '100%',
    backgroundColor: colors.surfaceMuted,
  },
  receiptRow: {
    justifyContent: 'space-between',
  },
  successActions: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  bottomPadding: { height: 50 },
});
