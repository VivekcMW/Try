import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  TextInput,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Award,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  MessageCircle,
  Plus,
  Send,
  Share2,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { useRewardStore, REWARDS, type Reward } from '@/store/rewardStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ReferralStatus = 'joined' | 'pending' | 'invited';

interface ReferralEntry {
  id: string;
  name: string;
  flat: string;
  status: ReferralStatus;
  date: string;
  creditsEarned?: number;
}

const TIERS = [
  { label: 'Bronze', min: 0,  max: 4,  bonus: null,   color: '#CD7F32' },
  { label: 'Silver', min: 5,  max: 9,  bonus: 100,    color: '#9CA3AF' },
  { label: 'Gold',   min: 10, max: Infinity, bonus: 250, color: '#F59E0B' },
];

const STATUS_META: Record<ReferralStatus, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
  joined:  { label: 'Joined ✓',  color: colors.semantic?.success ?? '#059669', Icon: CheckCircle2 },
  pending: { label: 'Pending',   color: '#F59E0B',                             Icon: Clock },
  invited: { label: 'Invited',   color: colors.gray[400],                      Icon: MessageCircle },
};

export default function ReferScreen() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const name    = useOnboardingStore((s) => s.name ?? 'USER');
  const rewardBalance = useRewardStore((s) => s.balance);
  const earnPoints    = useRewardStore((s) => s.earn);
  const redeemReward  = useRewardStore((s) => s.redeem);
  const hasRedeemed   = useRewardStore((s) => s.hasRedeemed);
  const [copied,  setCopied]  = useState(false);
  const [history, setHistory] = useState<ReferralEntry[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const REFERRAL_CODE = `LOKUL-${name.replace(/\s/g,'').toUpperCase().slice(0,6)}`;
  const INVITE_LINK   = `https://lokul.club/join?ref=${userId}`;
  const INVITE_MESSAGE = `Hey! I'm using Lokul to connect with neighbors, buy/sell locally, and stay safe. Join using my link and we both get ₹50 credits!\n\n${INVITE_LINK}`;

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${BASE}/api/mobile/referrals?userId=${userId}`);
      const data = await res.json();
      const records: Array<{ id: string; refereePhone: string; status: string; creditPaise: number; createdAt: string }> = data.referrals ?? [];
      setTotalEarned(Math.round((data.totalCreditPaise ?? 0) / 100));
      setHistory(records.map((r) => ({
        id: r.id,
        name: r.refereePhone,
        flat: '',
        status: r.status === 'rewarded' ? 'joined' : r.status === 'pending' ? 'pending' : 'invited',
        date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        creditsEarned: r.creditPaise > 0 ? Math.round(r.creditPaise / 100) : undefined,
      })));
      // Earn points for joined referrals (idempotent — handled in store)
      records.filter((r) => r.status === 'rewarded').forEach((r) => {
        earnPoints('referral_join', `${r.refereePhone} joined Lokul`, r.id);
      });
    } catch { /* noop */ }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Batch invite state ───────────────────────────────────────────────────
  const [batchPhoneInput, setBatchPhoneInput] = useState('');
  const [batchPhones,     setBatchPhones]     = useState<string[]>([]);
  const [batchSending,    setBatchSending]    = useState(false);
  const [batchResult,     setBatchResult]     = useState<{ sentCount: number } | null>(null);

  const addBatchPhone = () => {
    const cleaned = batchPhoneInput.trim().replace(/\s/g, '');
    if (!cleaned) return;
    if (!/^\+?[\d\-]{8,15}$/.test(cleaned)) return;
    const e164 = cleaned.startsWith('+') ? cleaned : `+91${cleaned.replace(/^0/, '')}`;
    if (!batchPhones.includes(e164)) setBatchPhones((p) => [...p, e164]);
    setBatchPhoneInput('');
  };

  const sendBatch = async () => {
    if (!userId || batchPhones.length === 0) return;
    setBatchSending(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/referrals/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId: userId, phones: batchPhones }),
      });
      const data = await res.json();
      setBatchResult({ sentCount: data.sentCount ?? batchPhones.length });
      // Earn points for each invite sent
      batchPhones.forEach((phone) => earnPoints('referral_invite', `Invited ${phone}`));
      setBatchPhones([]);
      load();
    } catch { /* noop */ } finally { setBatchSending(false); }
  };

  const handleRedeem = async (reward: Reward) => {
    setRedeemingId(reward.id);
    try {
      const txId = `redeem-${Date.now()}`;
      const success = redeemReward(reward, txId);
      if (success) {
        // Notify server of redemption
        await fetch(`${BASE}/api/mobile/referrals/rewards/redeem`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, rewardId: reward.id, txId }),
        }).catch(() => {}); // non-blocking — local state already updated
      }
    } finally {
      setRedeemingId(null);
    }
  };

  const totalJoined   = history.filter((r) => r.status === 'joined').length;
  const currentTier   = TIERS.find((t) => totalJoined >= t.min && totalJoined <= t.max) ?? TIERS[0];
  const nextTier      = TIERS[TIERS.indexOf(currentTier) + 1];
  const progressPct   = nextTier
    ? ((totalJoined - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const handleCopy = async () => {
    try {
      await Share.share({ message: INVITE_LINK });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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
    Linking.openURL(`sms:?body=${encodeURIComponent(INVITE_MESSAGE)}`);
  };

  const handleNativeShare = async () => {
    try {
      await Share.share({ message: INVITE_MESSAGE, url: INVITE_LINK });
    } catch {
      // user cancelled — no-op
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          hitSlop={10}
        >
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text style={styles.headerTitle}>Refer &amp; Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Stats banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalJoined}</Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{totalEarned}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Invited</Text>
          </View>
        </View>

        {/* LokuPoints balance card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsLeft}>
            <View style={styles.pointsIconWrap}>
              <Zap size={18} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.pointsBalance}>{rewardBalance.toLocaleString('en-IN')}</Text>
              <Text style={styles.pointsLabel}>LokuPoints</Text>
            </View>
          </View>
          <View style={styles.pointsRight}>
            <Text style={styles.pointsHint}>Earn points, redeem for perks</Text>
          </View>
        </View>

        {/* Rewards section */}
        <Text style={styles.sectionLabel}>REDEEM LOKUPOINTS</Text>
        <View style={styles.card}>
          {REWARDS.map((reward, index) => {
            const canAfford = rewardBalance >= reward.cost;
            const redeemed  = hasRedeemed(reward.id);
            const isLast    = index === REWARDS.length - 1;
            return (
              <View key={reward.id} style={[styles.rewardRow, !isLast && styles.historyDivider]}>
                <View style={styles.rewardIconWrap}>
                  {reward.category === 'cashback' && <Gift size={16} color={colors.brand[600]} />}
                  {reward.category === 'subscription' && <Award size={16} color="#F59E0B" />}
                  {reward.category === 'badge' && <Trophy size={16} color="#9CA3AF" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardDesc}>{reward.description}</Text>
                  <Text style={[styles.rewardCost, !canAfford && styles.rewardCostInsuf]}>
                    {reward.cost.toLocaleString('en-IN')} pts
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleRedeem(reward)}
                  disabled={!canAfford || redeemed || redeemingId === reward.id}
                  style={[styles.redeemBtn, (!canAfford || redeemed) && styles.redeemBtnDisabled]}
                  accessibilityRole="button"
                >
                  {redeemingId === reward.id
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.redeemBtnText}>{redeemed ? 'Redeemed' : 'Redeem'}</Text>
                  }
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Tier progress card */}
        <View style={styles.card}>
          <View style={styles.tierRow}>
            <View style={[styles.tierBadge, { backgroundColor: currentTier.color + '22' }]}>
              <Trophy size={16} color={currentTier.color} strokeWidth={2} />
              <Text style={[styles.tierName, { color: currentTier.color }]}>{currentTier.label}</Text>
            </View>
            {nextTier && (
              <Text style={styles.tierNext}>
                {nextTier.min - totalJoined} more to {nextTier.label}
                {nextTier.bonus ? ` (+₹${nextTier.bonus} bonus)` : ''}
              </Text>
            )}
          </View>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progressPct, 100)}%`, backgroundColor: currentTier.color }]} />
          </View>
          <View style={styles.tierLabelsRow}>
            {TIERS.map((t) => (
              <Text key={t.label} style={[styles.tierTickLabel, { color: totalJoined >= t.min ? t.color : colors.gray[300] }]}>
                {t.label}
              </Text>
            ))}
          </View>
        </View>

        {/* Referral code + share */}
        <Text style={styles.sectionLabel}>YOUR REFERRAL CODE</Text>
        <View style={styles.card}>
          <View style={styles.codeRow}>
            <View style={styles.giftCircle}>
              <Gift size={20} color={colors.brand[600]} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
              <Text style={styles.codeSub}>₹50 credits for you &amp; your friend</Text>
            </View>
            <Pressable
              onPress={handleCopy}
              style={[styles.copyBtn, copied && styles.copyBtnDone]}
              accessibilityLabel="Share link"
            >
              {copied
                ? <Check size={16} color={colors.semantic?.success ?? '#059669'} />
                : <Copy size={16} color={colors.brand[600]} />
              }
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
                {copied ? 'Shared!' : 'Share'}
              </Text>
            </Pressable>
          </View>

          {/* Share buttons */}
          <View style={styles.shareRow}>
            <Pressable onPress={handleWhatsApp} style={styles.shareBtn} accessibilityLabel="Share via WhatsApp">
              <View style={[styles.shareIcon, { backgroundColor: '#25D36620' }]}>
                <MessageCircle size={20} color="#25D366" strokeWidth={2} />
              </View>
              <Text style={styles.shareBtnLabel}>WhatsApp</Text>
            </Pressable>
            <Pressable onPress={handleSMS} style={styles.shareBtn} accessibilityLabel="Share via SMS">
              <View style={[styles.shareIcon, { backgroundColor: colors.brand[50] }]}>
                <Share2 size={20} color={colors.brand[600]} strokeWidth={2} />
              </View>
              <Text style={styles.shareBtnLabel}>SMS</Text>
            </Pressable>
            <Pressable onPress={handleNativeShare} style={styles.shareBtn} accessibilityLabel="More share options">
              <View style={[styles.shareIcon, { backgroundColor: colors.gray[100] }]}>
                <Share2 size={20} color={colors.gray[600]} strokeWidth={2} />
              </View>
              <Text style={styles.shareBtnLabel}>More</Text>
            </Pressable>
          </View>
        </View>

        {/* Batch invite */}
        <Text style={styles.sectionLabel}>INVITE BY PHONE NUMBERS</Text>
        <View style={styles.card}>
          <View style={styles.batchInputRow}>
            <TextInput
              style={styles.batchInput}
              placeholder="+91XXXXXXXXXX"
              placeholderTextColor={colors.gray[400]}
              value={batchPhoneInput}
              onChangeText={setBatchPhoneInput}
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={addBatchPhone}
            />
            <Pressable onPress={addBatchPhone} style={styles.batchAddBtn} accessibilityRole="button">
              <Plus size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Added phones */}
          {batchPhones.length > 0 && (
            <View style={styles.batchTagsRow}>
              {batchPhones.map((p) => (
                <View key={p} style={styles.batchTag}>
                  <Text style={styles.batchTagText}>{p}</Text>
                  <Pressable onPress={() => setBatchPhones((prev) => prev.filter((x) => x !== p))} hitSlop={6}>
                    <X size={12} color={colors.brand[600]} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {batchResult && (
            <Text style={styles.batchSuccess}>✓ Invites sent to {batchResult.sentCount} contacts!</Text>
          )}

          <Pressable
            onPress={sendBatch}
            disabled={batchPhones.length === 0 || batchSending}
            style={[styles.batchSendBtn, (batchPhones.length === 0 || batchSending) && { opacity: 0.5 }]}
            accessibilityRole="button"
          >
            {batchSending
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Send size={15} color="#fff" /><Text style={styles.batchSendText}>Send {batchPhones.length > 0 ? `(${batchPhones.length})` : ''} Invites</Text></>
            }
          </Pressable>
        </View>

        {/* Referral history */}
        <Text style={styles.sectionLabel}>REFERRAL HISTORY</Text>
        <View style={styles.card}>
          {history.map((entry, index) => {
            const meta = STATUS_META[entry.status];
            const isLast = index === history.length - 1;
            return (
              <View key={entry.id} style={[styles.historyRow, !isLast && styles.historyDivider]}>
                <View style={styles.historyAvatar}>
                  <Text style={styles.historyInitial}>{entry.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyName}>{entry.name}</Text>
                  <Text style={styles.historySub}>{entry.flat} · {entry.date}</Text>
                </View>
                <View style={styles.historyRight}>
                  <View style={[styles.statusPill, { backgroundColor: meta.color + '18' }]}>
                    <meta.Icon size={11} color={meta.color} strokeWidth={2.5} />
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                  {entry.creditsEarned ? (
                    <Text style={styles.creditsEarned}>+₹{entry.creditsEarned}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* Reward tiers info */}
        <Text style={styles.sectionLabel}>REWARD TIERS</Text>
        <View style={styles.card}>
          {TIERS.map((t, index) => {
            const isActive = currentTier.label === t.label;
            const isLast = index === TIERS.length - 1;
            return (
              <View key={t.label} style={[styles.tierInfoRow, !isLast && styles.historyDivider]}>
                <View style={[styles.tierDot, { backgroundColor: t.color + '22', borderColor: isActive ? t.color : 'transparent' }]}>
                  <Trophy size={14} color={t.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierInfoName, isActive && { color: t.color }]}>
                    {t.label}{isActive ? '  (current)' : ''}
                  </Text>
                  <Text style={styles.tierInfoSub}>
                    {t.max === Infinity ? `${t.min}+ referrals` : `${t.min}–${t.max} referrals`}
                  </Text>
                </View>
                <Text style={styles.tierInfoBonus}>
                  {t.bonus ? `+₹${t.bonus} bonus` : '₹50 / join'}
                </Text>
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
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] },

  // Batch invite
  batchInputRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2] },
  batchInput: {
    flex: 1, borderWidth: 1, borderColor: colors.surface.border,
    borderRadius: 10, paddingHorizontal: spacing[3], paddingVertical: spacing[2.5],
    fontSize: 14, color: colors.surface.heading,
  },
  batchAddBtn: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
  },
  batchTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] },
  batchTag: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    backgroundColor: colors.brand[50], borderRadius: 20,
    paddingHorizontal: spacing[2.5], paddingVertical: spacing[1],
    borderWidth: 1, borderColor: colors.brand[200],
  },
  batchTagText:  { fontSize: 12, color: colors.brand[700], fontWeight: '600' },
  batchSendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2],
    backgroundColor: colors.brand[600], borderRadius: 12,
    paddingVertical: spacing[3], marginTop: spacing[2],
  },
  batchSendText:  { color: '#fff', fontWeight: '700', fontSize: 14 },
  batchSuccess:   { color: colors.semantic?.success ?? '#059669', fontSize: 13, fontWeight: '600', marginBottom: spacing[2] },

  // Stats banner
  statsBanner: {
    flexDirection: 'row', backgroundColor: colors.brand[600],
    borderRadius: 16, paddingVertical: spacing[4],
  },
  statItem: { flex: 1, alignItems: 'center', gap: spacing[1] },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.75)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: spacing[2] },

  // LokuPoints card
  pointsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFBEB', borderRadius: 16, borderWidth: 1, borderColor: '#FDE68A',
    padding: spacing[4],
  },
  pointsLeft:     { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  pointsIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  pointsBalance:  { fontSize: 24, fontWeight: '800', color: '#92400E' },
  pointsLabel:    { fontSize: 11, fontWeight: '600', color: '#B45309' },
  pointsRight:    { maxWidth: 100 },
  pointsHint:     { fontSize: 11, color: '#B45309', textAlign: 'right' },

  // Rewards
  rewardRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing[3], padding: spacing[4] },
  rewardIconWrap:  { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface.surfaceMuted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rewardTitle:     { fontSize: 14, fontWeight: '700', color: colors.surface.heading },
  rewardDesc:      { fontSize: 12, color: colors.surface.textSecondary, marginTop: 1 },
  rewardCost:      { fontSize: 12, fontWeight: '700', color: '#F59E0B', marginTop: 3 },
  rewardCostInsuf: { color: colors.gray[400] },
  redeemBtn:       { backgroundColor: colors.brand[600], borderRadius: 8, paddingHorizontal: spacing[3], paddingVertical: spacing[2], minWidth: 72, alignItems: 'center' },
  redeemBtnDisabled: { backgroundColor: colors.gray[200] },
  redeemBtnText:   { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: colors.surface.background,
    borderRadius: 16, borderWidth: 0.5, borderColor: colors.surface.border,
    overflow: 'hidden',
  },

  // Tier progress
  tierRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[3],
  },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1.5],
    paddingHorizontal: spacing[3], paddingVertical: spacing[1.5], borderRadius: 20,
  },
  tierName: { fontSize: 13, fontWeight: '700' },
  tierNext: { fontSize: 12, color: colors.surface.textSecondary, flexShrink: 1, textAlign: 'right' },
  progressTrack: {
    height: 6, backgroundColor: colors.gray[100],
    marginHorizontal: spacing[4], borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: 3 },
  tierLabelsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingTop: spacing[1.5], paddingBottom: spacing[4],
  },
  tierTickLabel: { fontSize: 11, fontWeight: '600' },

  // Referral code
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: colors.gray[400], letterSpacing: 0.6,
  },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  giftCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  codeValue: { fontSize: 18, fontWeight: '800', color: colors.brand[700], letterSpacing: 1.5 },
  codeSub: { fontSize: 12, color: colors.surface.textSecondary, marginTop: 2 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[1],
    paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.brand[600],
  },
  copyBtnDone: { borderColor: colors.semantic?.success ?? '#059669' },
  copyBtnText: { fontSize: 13, fontWeight: '600', color: colors.brand[600] },
  copyBtnTextDone: { color: colors.semantic?.success ?? '#059669' },

  // Share row
  shareRow: {
    flexDirection: 'row', paddingVertical: spacing[3], paddingHorizontal: spacing[2],
  },
  shareBtn: { flex: 1, alignItems: 'center', gap: spacing[1.5] },
  shareIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  shareBtnLabel: { fontSize: 11, fontWeight: '500', color: colors.surface.heading },

  // History
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3.5],
  },
  historyDivider: { borderBottomWidth: 0.5, borderBottomColor: colors.surface.border },
  historyAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  historyInitial: { fontSize: 16, fontWeight: '700', color: colors.brand[600] },
  historyName: { fontSize: 14, fontWeight: '600', color: colors.surface.heading },
  historySub: { fontSize: 12, color: colors.surface.textSecondary, marginTop: 1 },
  historyRight: { alignItems: 'flex-end', gap: spacing[1] },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  creditsEarned: { fontSize: 12, fontWeight: '700', color: colors.semantic?.success ?? '#059669' },

  // Tier info rows
  tierInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3.5],
  },
  tierDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  tierInfoName: { fontSize: 14, fontWeight: '700', color: colors.surface.heading },
  tierInfoSub: { fontSize: 12, color: colors.surface.textSecondary, marginTop: 1 },
  tierInfoBonus: { fontSize: 13, fontWeight: '600', color: colors.surface.textSecondary },
});
