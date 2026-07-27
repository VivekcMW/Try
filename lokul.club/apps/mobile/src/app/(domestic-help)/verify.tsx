import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  FileText,
  Camera,
  MapPin,
  Fingerprint,
  AlertTriangle,
  Clock,
  Check,
  ChevronRight,
  CreditCard,
  Info,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack, Avatar } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const VERIFICATION_PRICE = 199;

type UnverifiedHelper = {
  id: string;
  name: string;
  role: string;
  photo: string | null;
};

export default function VerifyHelperScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [step, setStep] = useState<'select' | 'details' | 'payment' | 'processing' | 'done'>('select');
  const [selectedHelpers, setSelectedHelpers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [unverifiedHelpers, setUnverifiedHelpers] = useState<UnverifiedHelper[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers?ownerId=${userId}`);
      const data = await res.json();
      const helpers = res.ok ? data.helpers : [];
      setUnverifiedHelpers(
        helpers
          .filter((h: { verificationStatus: string }) => h.verificationStatus === 'unverified')
          .map((h: { id: string; name: string; role: string; photo: string | null }) => ({
            id: h.id,
            name: h.name,
            role: h.role,
            photo: h.photo,
          })),
      );
    } catch {
      setUnverifiedHelpers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const totalAmount = selectedHelpers.length * VERIFICATION_PRICE;

  const handleSelectHelper = (id: string) => {
    setSelectedHelpers(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const handleProceedToDetails = () => {
    if (selectedHelpers.length === 0) {
      Alert.alert('Select Helpers', 'Please select at least one helper to verify');
      return;
    }
    setStep('details');
  };

  const handleStartVerification = () => {
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!userId) return;
    setIsProcessing(true);
    setStep('processing');

    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, helperIds: selectedHelpers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'failed');
      }
      setStep('done');
    } catch (e) {
      setStep('payment');
      Alert.alert('Payment failed', e instanceof Error && e.message === 'Insufficient wallet balance'
        ? 'Your wallet balance is too low. Please top up and try again.'
        : 'Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 1: Select helpers
  if (step === 'select') {
    if (loading) {
      return (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Verify Helpers</Text>
          <View style={{ width: 24 }} />
        </HStack>

        <ScrollView style={styles.scroll}>
          {/* Info Banner */}
          <Card style={styles.infoBanner}>
            <HStack gap={spacing.md}>
              <View style={styles.infoIcon}>
                <Shield size={24} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Background Verification</Text>
                <Text variant="body" tone="secondary">
                  Professional background check including Aadhaar, police records, and address verification
                </Text>
              </VStack>
            </HStack>
          </Card>

          {/* Price Info */}
          <Card style={styles.priceCard}>
            <HStack style={styles.priceRow}>
              <Text variant="body">Verification Fee</Text>
              <Text variant="bodyLg" style={{ color: colors.brand[600], fontWeight: '700' }}>
                ₹{VERIFICATION_PRICE}/person
              </Text>
            </HStack>
            <Text variant="caption" tone="secondary">
              One-time fee • Valid for 1 year • Shareable with neighbors
            </Text>
          </Card>

          {/* Helper Selection */}
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Select Helpers to Verify</Text>
            
            {unverifiedHelpers.map((helper) => (
              <Pressable
                key={helper.id}
                onPress={() => handleSelectHelper(helper.id)}
              >
                <Card style={[
                  styles.helperCard,
                  selectedHelpers.includes(helper.id) && styles.helperCardSelected,
                ]}>
                  <HStack gap={spacing.md}>
                    <View style={[
                      styles.checkbox,
                      selectedHelpers.includes(helper.id) && styles.checkboxSelected,
                    ]}>
                      {selectedHelpers.includes(helper.id) && (
                        <Check size={16} color={colors.background} />
                      )}
                    </View>
                    <Avatar size="lg" name={helper.name} />
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '600' }}>{helper.name}</Text>
                      <Text variant="caption" tone="secondary">{helper.role}</Text>
                    </VStack>
                    <Text variant="body" style={{ fontWeight: '500' }}>₹{VERIFICATION_PRICE}</Text>
                  </HStack>
                </Card>
              </Pressable>
            ))}

            {unverifiedHelpers.length === 0 && (
              <Card style={styles.emptyCard}>
                <ShieldCheck size={48} color={colors.success} />
                <Text variant="bodyLg" style={[styles.emptyText, { fontWeight: '500' }]}>
                  All helpers are verified!
                </Text>
                <Text variant="body" tone="secondary">
                  You don't have any unverified helpers
                </Text>
              </Card>
            )}
          </VStack>
        </ScrollView>

        {/* Footer */}
        {selectedHelpers.length > 0 && (
          <View style={styles.footer}>
            <HStack style={styles.footerContent}>
              <VStack>
                <Text variant="caption" tone="secondary">Total Amount</Text>
                <Text variant="h3" style={{ fontWeight: '700' }}>₹{totalAmount}</Text>
              </VStack>
              <Button
                label={`Verify ${selectedHelpers.length} Helper${selectedHelpers.length > 1 ? 's' : ''}`}
                onPress={handleProceedToDetails}
              />
            </HStack>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Step 2: Verification details
  if (step === 'details') {
    const checks = [
      { icon: Fingerprint, title: 'Aadhaar Verification', desc: 'Government ID validation' },
      { icon: FileText, title: 'Police Records Check', desc: 'Criminal background check' },
      { icon: MapPin, title: 'Address Verification', desc: 'Current residence validation' },
      { icon: Camera, title: 'Photo Verification', desc: 'Identity photo matching' },
    ];

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => setStep('select')} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Verification Details</Text>
          <View style={{ width: 24 }} />
        </HStack>

        <ScrollView style={styles.scroll}>
          <VStack gap={spacing.lg} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>What's Included</Text>
            
            {checks.map((check, i) => (
              <HStack key={i} gap={spacing.md} style={styles.checkItem}>
                <View style={styles.checkIcon}>
                  <check.icon size={20} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '500' }}>{check.title}</Text>
                  <Text variant="caption" tone="secondary">{check.desc}</Text>
                </VStack>
                <ShieldCheck size={18} color={colors.success} />
              </HStack>
            ))}
          </VStack>

          {/* Timeline */}
          <Card style={styles.timelineCard}>
            <HStack gap={spacing.md}>
              <Clock size={20} color={colors.textSecondary} />
              <VStack>
                <Text variant="body" style={{ fontWeight: '500' }}>Verification Timeline</Text>
                <Text variant="caption" tone="secondary">
                  Results typically available within 24-48 hours
                </Text>
              </VStack>
            </HStack>
          </Card>

          {/* Terms */}
          <Card style={styles.termsCard}>
            <HStack gap={spacing.md}>
              <Info size={20} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                By proceeding, you confirm that you have the helper's consent for verification. 
                Results will be shared with you and can be shared with neighbors.
              </Text>
            </HStack>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={`Pay ₹${totalAmount} & Start Verification`}
            onPress={handleStartVerification}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Step 3: Payment
  if (step === 'payment') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => setStep('details')} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Payment</Text>
          <View style={{ width: 24 }} />
        </HStack>

        <ScrollView style={styles.scroll}>
          <Card style={styles.paymentSummary}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Order Summary</Text>
            <View style={styles.divider} />
            <HStack style={styles.summaryRow}>
              <Text variant="body" tone="secondary">Verification × {selectedHelpers.length}</Text>
              <Text variant="body">₹{totalAmount}</Text>
            </HStack>
            <HStack style={styles.summaryRow}>
              <Text variant="body" tone="secondary">GST (18%)</Text>
              <Text variant="body">₹{Math.round(totalAmount * 0.18)}</Text>
            </HStack>
            <View style={styles.divider} />
            <HStack style={styles.summaryRow}>
              <Text variant="bodyLg" style={{ fontWeight: '700' }}>Total</Text>
              <Text variant="bodyLg" style={{ color: colors.brand[600], fontWeight: '700' }}>
                ₹{totalAmount + Math.round(totalAmount * 0.18)}
              </Text>
            </HStack>
          </Card>

          {/* Payment Methods */}
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Payment Method</Text>
            
            {[
              { id: 'wallet', label: 'Lokul Wallet', balance: '₹500', icon: '💰' },
              { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, etc.', icon: '📱' },
              { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
            ].map((method) => (
              <Pressable key={method.id}>
                <Card style={styles.paymentMethod}>
                  <HStack gap={spacing.md}>
                    <Text style={styles.methodIcon}>{method.icon}</Text>
                    <VStack style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '500' }}>{method.label}</Text>
                      {method.balance && (
                        <Text variant="caption" tone="secondary">Balance: {method.balance}</Text>
                      )}
                      {method.desc && (
                        <Text variant="caption" tone="secondary">{method.desc}</Text>
                      )}
                    </VStack>
                    <ChevronRight size={20} color={colors.textSecondary} />
                  </HStack>
                </Card>
              </Pressable>
            ))}
          </VStack>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Pay Securely"
            onPress={handlePayment}
            leftIcon={<CreditCard size={18} color={colors.background} />}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Step 4: Processing
  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.processingContainer}>
          <View style={styles.processingIcon}>
            <Shield size={48} color={colors.brand[600]} />
          </View>
          <Text variant="h3" style={[styles.processingTitle, { fontWeight: '700' }]}>
            Processing Payment...
          </Text>
          <Text variant="body" tone="secondary" style={styles.processingText}>
            Please wait while we process your payment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Step 5: Done
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.doneContainer}>
        <View style={styles.doneIcon}>
          <ShieldCheck size={64} color={colors.success} />
        </View>
        <Text variant="h2" style={[styles.doneTitle, { fontWeight: '700' }]}>
          Verification Started!
        </Text>
        <Text variant="body" tone="secondary" style={styles.doneText}>
          You'll receive the verification results within 24-48 hours. 
          We'll notify you once it's complete.
        </Text>
        
        <VStack gap={spacing.md} style={styles.doneActions}>
          <Button
            label="View Status"
            onPress={() => router.replace('/(domestic-help)/')}
          />
          <Button
            label="Go to Home"
            variant="secondary"
            onPress={() => router.replace('/(tabs)/')}
          />
        </VStack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  infoBanner: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.brand[50],
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
  },
  priceRow: {
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  helperCard: {
    padding: spacing.md,
  },
  helperCardSelected: {
    borderColor: colors.brand[600],
    borderWidth: 2,
    backgroundColor: colors.brand[50],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  emptyText: { marginTop: spacing.md },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  footerContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkItem: {
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
  },
  checkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceMuted,
  },
  termsCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
  },
  paymentSummary: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  summaryRow: {
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  paymentMethod: {
    padding: spacing.md,
  },
  methodIcon: {
    fontSize: 24,
  },
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  processingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  processingTitle: { marginBottom: spacing.sm, textAlign: 'center' },
  processingText: { textAlign: 'center' },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[6],
  },
  doneIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  doneTitle: { marginBottom: spacing.sm, textAlign: 'center' },
  doneText: { textAlign: 'center', marginBottom: spacing[6] },
  doneActions: { width: '100%' },
});
