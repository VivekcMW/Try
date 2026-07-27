import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Star,
  Shield,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  Edit,
  Trash2,
  Share2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react-native';
import { Card, HStack, Text, VStack, Avatar } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

type ApiHelper = {
  id: string;
  name: string;
  phone: string | null;
  photo: string | null;
  role: string;
  verificationStatus: VerificationStatus;
  rating: number;
  reviews: number;
  workingDays: string[];
  workingHours: string;
  monthlyPayPaise: number;
  worksAt: string[];
  lastVerifiedAt: string | null;
  notes: string | null;
  documents: Record<string, { verified: boolean; date?: string }>;
  owner: { id: string; name: string };
};

const STATUS_CONFIG: Record<VerificationStatus, { color: string; bg: string; label: string; icon: typeof Shield }> = {
  unverified: { color: colors.textSecondary, bg: colors.surfaceMuted, label: 'Not Verified', icon: Shield },
  pending: { color: colors.warning, bg: '#FEF3C7', label: 'Verification Pending', icon: Clock },
  verified: { color: colors.success, bg: '#D1FAE5', label: 'Verified', icon: ShieldCheck },
  rejected: { color: colors.danger, bg: '#FEE2E2', label: 'Verification Failed', icon: AlertTriangle },
};

export default function HelperProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [helper, setHelper] = useState<ApiHelper | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/domestic-help/helpers/${id}`);
      const data = await res.json();
      setHelper(res.ok ? data.helper : null);
    } catch {
      setHelper(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!helper) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={24} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Helper Profile</Text>
          <View style={{ width: 24 }} />
        </HStack>
        <View style={styles.notFound}>
          <User size={48} color={colors.textSecondary} />
          <Text variant="bodyLg" style={{ fontWeight: '500', marginTop: spacing.md }}>Helper not found</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
            This helper may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = STATUS_CONFIG[helper.verificationStatus];
  const StatusIcon = status.icon;

  const handleCall = () => {
    if (!helper.phone) return;
    Linking.openURL(`tel:${helper.phone.replace(/\s/g, '')}`);
  };

  const handleMessage = () => {
    if (!helper.phone) {
      Alert.alert('No phone number', 'This helper does not have a phone number on file.');
      return;
    }
    Linking.openURL(`sms:${helper.phone.replace(/\s/g, '')}`).catch(() =>
      Alert.alert('Could not open messages', 'Your device could not open the messaging app.'),
    );
  };

  const handleShare = () => {
    Alert.alert('Share Profile', 'Share this helper\'s verified profile with your neighbors');
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Helper',
      `Are you sure you want to remove ${helper.name} from your helpers list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${BASE}/api/mobile/domestic-help/helpers/${helper.id}`, { method: 'DELETE' });
            } finally {
              router.back();
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={[styles.headerTitle, { fontWeight: '700' }]}>Helper Profile</Text>
        <HStack gap={spacing.md}>
          <Pressable onPress={handleShare}>
            <Share2 size={20} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push(`/(domestic-help)/edit/${id}`)}>
            <Edit size={20} color={colors.foreground} />
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <VStack gap={spacing.md} style={styles.profileContent}>
            <Avatar size="xl" name={helper.name} source={helper.photo ? { uri: helper.photo } : undefined} />
            <VStack style={styles.profileInfo}>
              <Text variant="h2" style={{ fontWeight: '700' }}>{helper.name}</Text>
              <Text variant="bodyLg" tone="secondary">{helper.role}</Text>

              {helper.reviews > 0 && (
                <HStack gap={spacing.xs} style={styles.ratingRow}>
                  <Star size={16} color={colors.warning} fill={colors.warning} />
                  <Text variant="bodyLg" style={{ fontWeight: '600' }}>{helper.rating}</Text>
                  <Text variant="bodyLg" tone="secondary">({helper.reviews} reviews)</Text>
                </HStack>
              )}
            </VStack>

            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <StatusIcon size={16} color={status.color} />
              <Text variant="body" style={{ color: status.color, marginLeft: 6, fontWeight: '600' }}>
                {status.label}
              </Text>
            </View>
          </VStack>

          {/* Action Buttons */}
          <HStack gap={spacing.md} style={styles.actions}>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.success }]} onPress={handleCall}>
              <Phone size={20} color="#ffffff" />
              <Text variant="body" style={{ color: '#ffffff', fontWeight: '600' }}>Call</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: colors.brand[600] }]}
              onPress={handleMessage}
            >
              <MessageCircle size={20} color="#ffffff" />
              <Text variant="body" style={{ color: '#ffffff', fontWeight: '600' }}>Message</Text>
            </Pressable>
          </HStack>
        </Card>

        {/* Work Details */}
        <VStack gap={spacing.md} style={styles.section}>
          <Text variant="bodyLg" style={{ fontWeight: '600' }}>Work Details</Text>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Calendar size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Working Days</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.workingDays.join(', ') || '—'}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <Clock size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Working Hours</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.workingHours || '—'}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <IndianRupee size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Monthly Pay</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>₹{Math.round(helper.monthlyPayPaise / 100).toLocaleString()}</Text>
              </VStack>
            </HStack>
          </Card>

          <Card style={styles.detailCard}>
            <HStack gap={spacing.md}>
              <View style={styles.detailIcon}>
                <MapPin size={20} color={colors.brand[600]} />
              </View>
              <VStack style={{ flex: 1 }}>
                <Text variant="caption" tone="secondary">Also Works At</Text>
                <Text variant="body" style={{ fontWeight: '500' }}>{helper.worksAt.length ? helper.worksAt.join(', ') : '—'}</Text>
              </VStack>
            </HStack>
          </Card>
        </VStack>

        {/* Verification Documents */}
        <VStack gap={spacing.md} style={styles.section}>
          <HStack style={styles.sectionHeader}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Verification Documents</Text>
            {helper.lastVerifiedAt && (
              <Text variant="caption" tone="secondary">
                Last: {new Date(helper.lastVerifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
              </Text>
            )}
          </HStack>

          <Card style={styles.docsCard}>
            {Object.entries(helper.documents).map(([key, doc], i) => (
              <View key={key}>
                {i > 0 && <View style={styles.divider} />}
                <HStack style={styles.docRow}>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '500' }}>
                      {key === 'aadhaar' && '🪪 Aadhaar Verification'}
                      {key === 'police' && '🚔 Police Records Check'}
                      {key === 'photo' && '📷 Photo Verification'}
                      {key === 'address' && '📍 Address Verification'}
                    </Text>
                    {doc.verified && doc.date && (
                      <Text variant="caption" tone="secondary">Verified on {doc.date}</Text>
                    )}
                  </VStack>
                  {doc.verified ? (
                    <CheckCircle size={20} color={colors.success} />
                  ) : (
                    <XCircle size={20} color={colors.danger} />
                  )}
                </HStack>
              </View>
            ))}
          </Card>
        </VStack>

        {/* Notes */}
        {helper.notes && (
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Notes</Text>
            <Card style={styles.notesCard}>
              <Text variant="body" tone="secondary">{helper.notes}</Text>
            </Card>
          </VStack>
        )}

        {/* Danger Zone */}
        <VStack gap={spacing.md} style={styles.dangerSection}>
          <Pressable style={styles.dangerButton} onPress={handleDelete}>
            <Trash2 size={18} color={colors.danger} />
            <Text variant="body" style={{ color: colors.danger, fontWeight: '500' }}>
              Remove Helper
            </Text>
          </Pressable>
        </VStack>

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  scroll: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[6] },
  profileCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  profileContent: {
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  ratingRow: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCard: {
    padding: spacing.md,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  docsCard: {
    padding: spacing.md,
  },
  docRow: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  notesCard: {
    padding: spacing.md,
  },
  dangerSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  bottomPadding: { height: 100 },
});
