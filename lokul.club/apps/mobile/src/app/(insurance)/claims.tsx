import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { INSURANCE_ICON_MAP } from '@/data/insurance-catalog';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { type ApiPolicy } from './index';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const CLAIM_STATUS_LABEL: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

type ApiClaim = {
  id: string;
  description: string;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected';
  createdAt: string;
  policy: { id: string; planName: string; provider: string; policyNumber: string };
};

export default function ClaimsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [policies, setPolicies] = useState<ApiPolicy[]>([]);
  const [claims, setClaims] = useState<ApiClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const [filingFor, setFilingFor] = useState<ApiPolicy | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [policiesRes, claimsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/insurance/policies?ownerId=${userId}`),
        fetch(`${BASE}/api/mobile/insurance/claims?ownerId=${userId}`),
      ]);
      const policiesData = await policiesRes.json();
      setPolicies(policiesRes.ok ? policiesData.policies : []);
      const claimsData = await claimsRes.json();
      setClaims(claimsRes.ok ? claimsData.claims : []);
    } catch {
      setPolicies([]);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  function startClaim(policy: ApiPolicy) {
    setFilingFor(policy);
    setDescription('');
  }

  async function submitClaim() {
    if (!filingFor) return;
    if (description.trim().length < 5) {
      Alert.alert('Description too short', 'Please describe your claim in a few more words.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/insurance/claims`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyId: filingFor.id, description: description.trim() }),
      });
      if (!res.ok) throw new Error('failed');
      Alert.alert('Claim filed', `Your claim for ${filingFor.planName} has been submitted. We'll update you on its status.`);
      setFilingFor(null);
      setDescription('');
      load();
    } catch {
      Alert.alert('Error', 'Could not file the claim — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

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
        <Pressable onPress={() => (filingFor ? setFilingFor(null) : router.back())} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>{filingFor ? 'File a Claim' : 'Claims'}</Text>
          <Text variant="caption" tone="secondary">
            {filingFor ? filingFor.planName : 'Track and file insurance claims'}
          </Text>
        </VStack>
        <View style={{ width: 24 }} />
      </HStack>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {filingFor ? (
          <VStack gap={spacing.md}>
            <Card style={styles.policySummary}>
              <Text variant="body" style={{ fontWeight: '600' }}>{filingFor.planName}</Text>
              <Text variant="caption" tone="secondary">{filingFor.provider} • {filingFor.policyNumber}</Text>
            </Card>
            <Text variant="body" style={{ fontWeight: '700' }}>Describe what happened</Text>
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={5}
              placeholder="e.g. Hospitalized for 3 days due to fever, need reimbursement…"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
            <Button
              label={submitting ? 'Submitting…' : 'Submit Claim'}
              onPress={submitClaim}
              disabled={submitting}
              fullWidth
            />
          </VStack>
        ) : (
          <VStack gap={spacing.lg}>
            <VStack gap={spacing.md}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Your Policies</Text>
              {policies.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <FileText size={40} color={colors.textSecondary} />
                  <Text variant="body" tone="secondary" style={{ textAlign: 'center', marginTop: spacing.sm }}>
                    You don't have any policies to file a claim against yet.
                  </Text>
                </Card>
              ) : (
                policies.map((policy) => {
                  const Icon = INSURANCE_ICON_MAP[policy.categoryIcon as keyof typeof INSURANCE_ICON_MAP] ?? INSURANCE_ICON_MAP.Shield;
                  return (
                    <Card key={policy.id} style={styles.policyCard}>
                      <HStack gap={spacing.md} align="center">
                        <View style={styles.policyIcon}>
                          <Icon size={22} color={colors.brand[600]} />
                        </View>
                        <VStack style={{ flex: 1 }}>
                          <Text variant="body" style={{ fontWeight: '600' }}>{policy.planName}</Text>
                          <Text variant="caption" tone="secondary">{policy.provider} • {policy.policyNumber}</Text>
                        </VStack>
                      </HStack>
                      <View style={{ marginTop: spacing.md }}>
                        <Button label="File a Claim" variant="secondary" size="sm" onPress={() => startClaim(policy)} />
                      </View>
                    </Card>
                  );
                })
              )}
            </VStack>

            <VStack gap={spacing.md}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Claim History</Text>
              {claims.length === 0 ? (
                <Text variant="caption" tone="secondary">No claims filed yet.</Text>
              ) : (
                claims.map((claim) => {
                  return (
                    <Card key={claim.id} style={styles.claimCard}>
                      <HStack style={{ justifyContent: 'space-between' }}>
                        <Text variant="body" style={{ fontWeight: '600' }}>{claim.policy.planName}</Text>
                        <View style={styles.claimStatusBadge}>
                          <Text variant="caption" tone="brand" style={{ fontWeight: '600' }}>
                            {CLAIM_STATUS_LABEL[claim.status] ?? claim.status}
                          </Text>
                        </View>
                      </HStack>
                      <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>{claim.description}</Text>
                      <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
                        Filed on {new Date(claim.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </Card>
                  );
                })
              )}
            </VStack>
          </VStack>
        )}
        <View style={{ height: 100 }} />
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
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  policySummary: { padding: spacing.md, backgroundColor: colors.surfaceMuted },
  textarea: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.foreground,
    backgroundColor: colors.background,
    minHeight: 120,
  },
  emptyCard: { padding: spacing.xl, alignItems: 'center' },
  policyCard: { padding: spacing.md },
  policyIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimCard: { padding: spacing.md },
  claimStatusBadge: {
    backgroundColor: colors.brand[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
});
