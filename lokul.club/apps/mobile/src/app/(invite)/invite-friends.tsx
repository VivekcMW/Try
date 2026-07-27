import { useCallback, useEffect, useState } from 'react';
import {
  Clipboard,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Copy, Gift, MessageCircle, Share2, X } from 'lucide-react-native';
import { colors, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const FALLBACK_CODE = 'LOKUL-VIVEK42';

function buildCode(userId: string | null) {
  if (!userId) return FALLBACK_CODE;
  return `LOKUL-${userId.slice(-6).toUpperCase()}`;
}

interface Suggestion {
  id: string;
  name: string;
  flat: string;
  tower: string;
}

const SUGGESTIONS: Suggestion[] = [
  { id: 's1', name: 'Arun Kapoor',   flat: 'A-201', tower: 'Tower A' },
  { id: 's2', name: 'Meena Iyer',    flat: 'B-304', tower: 'Tower B' },
  { id: 's3', name: 'Deepak Singh',  flat: 'C-501', tower: 'Tower C' },
  { id: 's4', name: 'Pooja Nambiar', flat: 'A-102', tower: 'Tower A' },
  { id: 's5', name: 'Raj Verma',     flat: 'B-402', tower: 'Tower B' },
];

export default function InviteFriendsScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);
  const [copied, setCopied] = useState(false);
  const [invited, setInvited] = useState<Set<string>>(new Set());
  const [joinedCount, setJoinedCount] = useState(0);

  const REFERRAL_CODE = buildCode(userId);
  const INVITE_LINK = `https://lokul.club/join?ref=${REFERRAL_CODE}`;
  const INVITE_MESSAGE = `Hey! I'm using Lokul to connect with neighbors, buy/sell locally, and stay safe. Join using my link and we both get ₹50 credits!\n\n${INVITE_LINK}`;

  const loadReferralStats = useCallback(async () => {
    if (!userId) return;
    try {
      const base = process.env.EXPO_PUBLIC_API_BASE ?? '';
      const res = await fetch(`${base}/api/mobile/referrals?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        const records: { referee?: { id: string } }[] = data.records ?? [];
        setJoinedCount(records.filter((r) => r.referee?.id).length);
      }
    } catch {
      // ignore — use defaults
    }
  }, [userId]);

  useEffect(() => { loadReferralStats(); }, [loadReferralStats]);

  const handleCopy = () => {
    Clipboard.setString(INVITE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({ message: INVITE_MESSAGE, url: INVITE_LINK });
    } catch {
      // user cancelled — no-op
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(INVITE_MESSAGE);
    Linking.openURL(`whatsapp://send?text=${encoded}`).catch(() =>
      Linking.openURL(`https://wa.me/?text=${encoded}`)
    );
  };

  const handleSMS = () => {
    const encoded = encodeURIComponent(INVITE_MESSAGE);
    Linking.openURL(`sms:?body=${encoded}`);
  };

  const handleInvite = (id: string) => {
    setInvited((prev) => new Set(prev).add(id));
  };

  const sentCount = invited.size;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
        >
          <X size={20} color={colors.surface.heading} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.giftIcon}>
            <Gift size={28} color={colors.brand[600]} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Earn ₹50 Lokul Credits</Text>
          <Text style={styles.heroSub}>
            For every neighbor who joins Lokul using your referral link
          </Text>
          <View style={styles.codePill}>
            <Text style={styles.codeLabel}>YOUR CODE</Text>
            <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
          </View>
        </View>

        {/* Stats row */}
        {sentCount > 0 && (
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {sentCount} invite{sentCount !== 1 ? 's' : ''} sent
              {'  ·  '}
              {joinedCount} joined
            </Text>
          </View>
        )}

        {/* Share row */}
        <Text style={styles.sectionLabel}>SHARE VIA</Text>
        <View style={styles.shareRow}>
          <Pressable onPress={handleWhatsApp} style={styles.shareBtn} accessibilityLabel="Share via WhatsApp">
            <View style={[styles.shareIcon, { backgroundColor: '#25D36620' }]}>
              <MessageCircle size={22} color="#25D366" strokeWidth={2} />
            </View>
            <Text style={styles.shareBtnLabel}>WhatsApp</Text>
          </Pressable>

          <Pressable onPress={handleSMS} style={styles.shareBtn} accessibilityLabel="Share via SMS">
            <View style={[styles.shareIcon, { backgroundColor: colors.brand[50] }]}>
              <Share2 size={22} color={colors.brand[600]} strokeWidth={2} />
            </View>
            <Text style={styles.shareBtnLabel}>SMS</Text>
          </Pressable>

          <Pressable onPress={handleNativeShare} style={styles.shareBtn} accessibilityLabel="More share options">
            <View style={[styles.shareIcon, { backgroundColor: colors.gray[100] }]}>
              <Share2 size={22} color={colors.gray[600]} strokeWidth={2} />
            </View>
            <Text style={styles.shareBtnLabel}>More</Text>
          </Pressable>

          <Pressable onPress={handleCopy} style={styles.shareBtn} accessibilityLabel="Copy invite link">
            <View style={[styles.shareIcon, { backgroundColor: copied ? '#ECFDF5' : colors.gray[100] }]}>
              {copied
                ? <Check size={22} color={colors.semantic?.success ?? '#059669'} strokeWidth={2} />
                : <Copy size={22} color={colors.gray[600]} strokeWidth={2} />
              }
            </View>
            <Text style={styles.shareBtnLabel}>{copied ? 'Copied!' : 'Copy link'}</Text>
          </Pressable>
        </View>

        {/* Suggested contacts */}
        <Text style={[styles.sectionLabel, { marginTop: spacing[2] }]}>SUGGEST FROM YOUR BUILDING</Text>
        <View style={styles.suggestCard}>
          {SUGGESTIONS.map((item, index) => {
            const isInvited = invited.has(item.id);
            const isLast = index === SUGGESTIONS.length - 1;
            return (
              <View key={item.id} style={[styles.suggestRow, !isLast && styles.suggestDivider]}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>{item.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestName}>{item.name}</Text>
                  <Text style={styles.suggestSub}>{item.flat} · {item.tower}</Text>
                </View>
                <Pressable
                  onPress={() => handleInvite(item.id)}
                  disabled={isInvited}
                  style={[styles.inviteBtn, isInvited && styles.inviteBtnDone]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.inviteBtnText, isInvited && styles.inviteBtnTextDone]}>
                    {isInvited ? 'Invited ✓' : 'Invite'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.surface.heading },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] },

  heroCard: {
    backgroundColor: colors.surface.background,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.surface.border,
    padding: spacing[5], alignItems: 'center', gap: spacing[2],
  },
  giftIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing[1],
  },
  heroTitle: { fontSize: 18, fontWeight: '700', color: colors.surface.heading, textAlign: 'center' },
  heroSub: { fontSize: 13, color: colors.surface.textSecondary, textAlign: 'center', lineHeight: 19 },
  codePill: {
    marginTop: spacing[3],
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[200],
    borderRadius: 12, paddingHorizontal: spacing[4], paddingVertical: spacing[2.5],
  },
  codeLabel: { fontSize: 10, fontWeight: '700', color: colors.brand[400], letterSpacing: 0.8 },
  codeValue: { fontSize: 16, fontWeight: '800', color: colors.brand[700], letterSpacing: 1.5 },

  statsRow: {
    backgroundColor: colors.brand[50], borderRadius: 10,
    paddingHorizontal: spacing[4], paddingVertical: spacing[2.5],
    alignItems: 'center',
  },
  statsText: { fontSize: 13, fontWeight: '600', color: colors.brand[700] },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.gray[400],
    letterSpacing: 0.6, marginBottom: spacing[2],
  },

  shareRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: colors.surface.background,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.surface.border,
    paddingVertical: spacing[4],
  },
  shareBtn: { flex: 1, alignItems: 'center', gap: spacing[1.5] },
  shareIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  shareBtnLabel: { fontSize: 11, fontWeight: '500', color: colors.surface.heading },

  suggestCard: {
    backgroundColor: colors.surface.background,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3.5],
    backgroundColor: colors.surface.background,
  },
  suggestDivider: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6366F120',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: '#6366F1' },
  suggestName: { fontSize: 15, fontWeight: '600', color: colors.surface.heading },
  suggestSub: { fontSize: 12, color: colors.surface.textSecondary, marginTop: 1 },
  inviteBtn: {
    paddingHorizontal: spacing[3.5], paddingVertical: spacing[2],
    backgroundColor: '#6366F1', borderRadius: 20,
  },
  inviteBtnDone: { backgroundColor: colors.gray[100] },
  inviteBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  inviteBtnTextDone: { color: colors.gray[500] },
});
