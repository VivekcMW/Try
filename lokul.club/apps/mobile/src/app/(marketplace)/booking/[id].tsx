// Booking tracker — slots, home-visit windows, and project (quote) flows with demo simulation
import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bike,
  CalendarCheck,
  CheckCircle2,
  Hammer,
  Hourglass,
  KeyRound,
  MapPin,
  Phone,
  ReceiptIndianRupee,
  Scissors,
  Star,
  Truck,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useBookingStore, type BookingStatus, type ServiceBooking } from '@/store/bookingStore';
import { colors, fontSize, radius, spacing } from '@lokul/ui-tokens';

const fmt = (paise: number) => `₹${(paise / 100).toFixed(0)}`;

type HeroSpec = { Icon: LucideIcon; color: string; title: string; sub: string };

function heroFor(b: ServiceBooking): HeroSpec {
  const when = `${b.date === new Date().toISOString().slice(0, 10) ? 'Today' : b.date} · ${b.slotLabel}`;
  switch (b.status) {
    case 'requested':
      return { Icon: Hourglass, color: colors.accent[600], title: `Waiting for ${b.merchantName}`, sub: 'Providers usually accept within 15 minutes' };
    case 'confirmed':
      return { Icon: CalendarCheck, color: colors.brand[600], title: 'Appointment confirmed!', sub: when };
    case 'checked_in':
      return { Icon: Scissors, color: colors.brand[600], title: 'You\u2019re checked in', sub: 'Sit back — you\u2019re in good hands' };
    case 'accepted':
      return { Icon: CalendarCheck, color: colors.brand[600], title: 'Visit confirmed!', sub: when };
    case 'on_the_way':
      return { Icon: Bike, color: colors.brand[600], title: 'Provider is on the way', sub: `Heading to ${b.address ?? 'your address'}` };
    case 'arrived':
      return { Icon: KeyRound, color: colors.brand[600], title: 'Provider has arrived', sub: 'Share the start code below to begin' };
    case 'quote_pending':
      return { Icon: ReceiptIndianRupee, color: colors.accent[600], title: 'Extra work needed', sub: 'Review and approve the revised estimate' };
    case 'in_progress':
      return { Icon: Wrench, color: colors.brand[600], title: 'Work in progress', sub: 'The provider is on it' };
    case 'work_done':
      return { Icon: Hammer, color: colors.semantic.success, title: 'Work completed!', sub: `Confirm and pay ${fmt(b.totalPaise)}` };
    case 'visit_scheduled':
      return { Icon: CalendarCheck, color: colors.brand[600], title: 'Site visit scheduled', sub: when };
    case 'visit_done':
      return { Icon: Hourglass, color: colors.accent[600], title: 'Preparing your quote', sub: 'The team is calculating your estimate' };
    case 'quote_shared':
      return { Icon: ReceiptIndianRupee, color: colors.accent[600], title: 'Quote is ready!', sub: 'Review the estimate below' };
    case 'quote_accepted':
      return { Icon: ReceiptIndianRupee, color: colors.brand[600], title: 'Quote accepted', sub: 'Pay the token advance to lock your date' };
    case 'scheduled':
      return { Icon: Truck, color: colors.brand[600], title: 'Job scheduled!', sub: 'Track progress milestone by milestone' };
    case 'completed':
      return { Icon: CheckCircle2, color: colors.semantic.success, title: 'All done. Thank you!', sub: 'Rate your experience below' };
    case 'cancelled':
      return { Icon: XCircle, color: colors.semantic.danger, title: 'Booking cancelled', sub: 'Any payment made will be refunded' };
    default:
      return { Icon: Hourglass, color: colors.gray[500], title: 'Processing…', sub: '' };
  }
}

function stepsFor(b: ServiceBooking): { label: string; key: BookingStatus[] }[] {
  if (b.kind === 'slot') {
    if (b.recurrence) {
      return [
        { label: 'Subscription requested', key: ['requested'] },
        { label: 'Kitchen confirmed', key: ['confirmed'] },
        { label: 'First delivery', key: ['checked_in'] },
        { label: 'Active', key: ['completed'] },
      ];
    }
    return [
      { label: 'Requested', key: ['requested'] },
      { label: 'Confirmed', key: ['confirmed'] },
      { label: 'Checked in', key: ['checked_in'] },
      { label: 'Completed', key: ['completed'] },
    ];
  }
  if (b.kind === 'window') {
    if (b.category === 'laundry') {
      return [
        { label: 'Pickup requested', key: ['requested'] },
        { label: 'Pickup confirmed', key: ['accepted'] },
        { label: 'Agent on the way', key: ['on_the_way'] },
        { label: 'Clothes picked up', key: ['arrived', 'quote_pending'] },
        { label: 'Washing & ironing', key: ['in_progress'] },
        { label: 'Delivered back', key: ['work_done', 'completed'] },
      ];
    }
    if (b.category === 'lab_test') {
      return [
        { label: 'Requested', key: ['requested'] },
        { label: 'Phlebotomist assigned', key: ['accepted'] },
        { label: 'On the way', key: ['on_the_way'] },
        { label: 'Sample collected', key: ['arrived', 'quote_pending', 'in_progress'] },
        { label: 'Report ready', key: ['work_done', 'completed'] },
      ];
    }
    return [
      { label: 'Requested', key: ['requested'] },
      { label: 'Accepted', key: ['accepted'] },
      { label: 'On the way', key: ['on_the_way'] },
      { label: 'Arrived', key: ['arrived', 'quote_pending'] },
      { label: 'Work in progress', key: ['in_progress'] },
      { label: 'Done & paid', key: ['work_done', 'completed'] },
    ];
  }
  if (b.category === 'event') {
    return [
      { label: 'Event requested', key: ['visit_scheduled'] },
      { label: 'Quote shared', key: ['visit_done', 'quote_shared'] },
      { label: 'Advance paid', key: ['quote_accepted'] },
      { label: 'Event day', key: ['scheduled'] },
      { label: 'Delivered', key: ['work_done', 'completed'] },
    ];
  }
  return [
    { label: 'Site visit', key: ['visit_scheduled'] },
    { label: 'Quote shared', key: ['visit_done', 'quote_shared'] },
    { label: 'Advance paid', key: ['quote_accepted'] },
    { label: 'Job in progress', key: ['scheduled'] },
    { label: 'Completed', key: ['work_done', 'completed'] },
  ];
}

export default function BookingTrackerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === id));
  const { setStatus, setOnsiteQuote, approveOnsiteQuote, setQuote, acceptQuote, counterQuote, acceptCounter, payAdvance, completeMilestone, setRating } = useBookingStore();
  const [stars, setStars] = useState(0);
  const [counterInput, setCounterInput] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const simStarted = useRef(false);

  // Demo simulation — drives the provider side
  useEffect(() => {
    if (!booking || simStarted.current) return;
    simStarted.current = true;
    const t = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms));
    const bid = booking.id;

    if (booking.kind === 'slot' && booking.status === 'requested') {
      t(8000, () => setStatus(bid, 'confirmed'));
      t(30000, () => setStatus(bid, 'checked_in'));
      t(50000, () => setStatus(bid, 'completed'));
    }
    if (booking.kind === 'window' && booking.status === 'requested') {
      t(8000, () => setStatus(bid, 'accepted'));
      t(20000, () => setStatus(bid, 'on_the_way'));
      t(35000, () => setStatus(bid, 'arrived'));
      if (booking.category === 'repair') {
        // Extra work discovered on-site → customer must approve
        t(48000, () => setOnsiteQuote(bid, { label: 'Replacement capacitor (part)', pricePaise: 45000 }));
      } else {
        // Lab / laundry / pest flows run straight through
        t(48000, () => setStatus(bid, 'in_progress'));
        t(65000, () => setStatus(bid, 'work_done'));
      }
    }
    if (booking.kind === 'project' && booking.status === 'visit_scheduled') {
      t(12000, () => setStatus(bid, 'visit_done'));
      t(20000, () =>
        setQuote(bid, booking.category === 'event'
          ? {
              lineItems: [
                { label: 'Photography team (full event)', pricePaise: 800000 },
                { label: 'Decor & setup', pricePaise: 500000 },
                { label: 'Edited photos + highlight video', pricePaise: 200000 },
              ],
              totalPaise: 1500000,
            }
          : {
              lineItems: [
                { label: 'Packing material & labour', pricePaise: 450000 },
                { label: 'Transport (7 km)', pricePaise: 350000 },
                { label: 'Loading & unloading team', pricePaise: 200000 },
              ],
              totalPaise: 1000000,
            }
        )
      );
    }
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  // After on-site approval → work done; after scheduled → milestones tick
  useEffect(() => {
    if (!booking) return;
    if (booking.kind === 'window' && booking.status === 'in_progress') {
      const t = setTimeout(() => setStatus(booking.id, 'work_done'), 15000);
      return () => clearTimeout(t);
    }
    if (booking.kind === 'project' && booking.status === 'scheduled' && booking.milestones) {
      const next = booking.milestones.findIndex((m) => !m.done);
      if (next >= 0) {
        const t = setTimeout(() => completeMilestone(booking.id, next), 10000);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.status, booking?.milestones]);

  // Demo: merchant accepts a fair counter-offer after a short delay
  useEffect(() => {
    if (!booking?.counterPaise || booking.status !== 'quote_shared') return;
    const t = setTimeout(() => acceptCounter(booking.id), 8000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.counterPaise, booking?.status]);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text variant="body" style={{ padding: spacing[6] }}>Booking not found.</Text>
      </SafeAreaView>
    );
  }

  const hero = heroFor(booking);
  const steps = stepsFor(booking);
  const orderedStatuses = steps.flatMap((s) => s.key);
  const currentIdx = orderedStatuses.indexOf(booking.status);
  const stepStateAt = (i: number): 'done' | 'active' | 'todo' => {
    if (booking.status === 'completed') return 'done';
    const stepStart = orderedStatuses.indexOf(steps[i].key[0]);
    if (steps[i].key.includes(booking.status)) return 'active';
    return stepStart < currentIdx ? 'done' : 'todo';
  };
  const canCancel = ['requested', 'confirmed', 'accepted', 'visit_scheduled'].includes(booking.status);

  const cancel = () =>
    Alert.alert('Cancel booking?', 'The provider will be notified.', [
      { text: 'Keep booking', style: 'cancel' },
      { text: 'Cancel', style: 'destructive', onPress: () => { timers.current.forEach(clearTimeout); setStatus(booking.id, 'cancelled'); } },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)' as never)} style={styles.backBtn} accessibilityRole="button" hitSlop={8}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>Booking</Text>
          <Text variant="caption" tone="secondary">{booking.merchantName}</Text>
        </VStack>
        <Pressable style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Call provider">
          <Phone size={16} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[12] }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <hero.Icon size={30} color={hero.color} strokeWidth={2.2} />
          </View>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSub}>{hero.sub}</Text>
        </View>

        {/* Timeline */}
        {booking.status !== 'cancelled' && (
          <View style={styles.card}>
            {steps.map((step, i) => {
              const st = stepStateAt(i);
              return (
                <View key={step.label} style={styles.stepRow}>
                  <View style={styles.stepRail}>
                    <View style={[styles.dot, st === 'done' && styles.dotDone, st === 'active' && styles.dotActive]} />
                    {i < steps.length - 1 && <View style={[styles.rail, st === 'done' && styles.railDone]} />}
                  </View>
                  <Text style={[styles.stepLabel, st === 'done' && styles.stepLabelDone, st === 'active' && styles.stepLabelActive]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Start OTP — visible from acceptance until work starts */}
        {booking.kind === 'window' && ['accepted', 'on_the_way', 'arrived'].includes(booking.status) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Start code</Text>
            <Text variant="caption" tone="secondary">Share only when the provider is at your door</Text>
            <View style={styles.otpBox}>
              <Text style={styles.otpText}>{booking.otp}</Text>
            </View>
          </View>
        )}

        {/* On-site quote approval */}
        {booking.status === 'quote_pending' && booking.onsiteQuote && (
          <View style={[styles.card, styles.quoteCard]}>
            <Text style={styles.cardTitle}>Additional work found</Text>
            <HStack gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{booking.onsiteQuote.label}</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{fmt(booking.onsiteQuote.pricePaise)}</Text>
            </HStack>
            <Text variant="caption" tone="secondary">
              New total: {fmt(booking.totalPaise + booking.onsiteQuote.pricePaise)} · work pauses until you decide
            </Text>
            <HStack gap={2}>
              <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => approveOnsiteQuote(booking.id)}>
                <Text style={styles.actionPrimaryText}>Approve & continue</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={cancel}>
                <Text style={styles.actionText}>Decline</Text>
              </Pressable>
            </HStack>
          </View>
        )}

        {/* Project quote */}
        {booking.status === 'quote_shared' && booking.quote && (
          <View style={[styles.card, styles.quoteCard]}>
            <Text style={styles.cardTitle}>Your quote</Text>
            {booking.quote.lineItems.map((li) => (
              <HStack key={li.label} gap={2} style={{ justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{li.label}</Text>
                <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{fmt(li.pricePaise)}</Text>
              </HStack>
            ))}
            <View style={styles.divider} />
            <HStack gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Total</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>{fmt(booking.quote.totalPaise)}</Text>
            </HStack>
            <Text variant="caption" tone="secondary">Valid for 7 days · 20% token advance locks your date</Text>
            {booking.counterPaise ? (
              <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                Your counter of {fmt(booking.counterPaise)} sent — waiting for the team…
              </Text>
            ) : showCounter ? (
              <HStack gap={2} align="center">
                <TextInput
                  style={styles.counterInput}
                  placeholder={`e.g. ${Math.round(booking.quote.totalPaise / 100 * 0.9)}`}
                  placeholderTextColor={colors.surface.textDisabled}
                  keyboardType="number-pad"
                  value={counterInput}
                  onChangeText={setCounterInput}
                />
                <Pressable
                  style={[styles.actionBtn, styles.actionPrimary, { flex: 0, paddingHorizontal: spacing[4] }]}
                  onPress={() => {
                    const rupees = Number.parseInt(counterInput, 10);
                    if (!rupees || rupees <= 0) return;
                    counterQuote(booking.id, rupees * 100);
                    setShowCounter(false);
                  }}
                >
                  <Text style={styles.actionPrimaryText}>Send</Text>
                </Pressable>
              </HStack>
            ) : null}
            <HStack gap={2}>
              <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => acceptQuote(booking.id)}>
                <Text style={styles.actionPrimaryText}>Accept quote</Text>
              </Pressable>
              {!booking.counterPaise && (
                <Pressable style={styles.actionBtn} onPress={() => setShowCounter((v) => !v)}>
                  <Text style={styles.actionText}>Counter ₹</Text>
                </Pressable>
              )}
              <Pressable style={styles.actionBtn} onPress={cancel}>
                <Text style={styles.actionText}>Decline</Text>
              </Pressable>
            </HStack>
          </View>
        )}

        {/* Advance payment */}
        {booking.status === 'quote_accepted' && (
          <View style={[styles.card, styles.quoteCard]}>
            <Text style={styles.cardTitle}>Token advance</Text>
            <Text variant="body" style={{ color: colors.surface.heading }}>
              Pay {fmt(booking.advancePaise ?? 0)} (20%) to confirm your job date. Balance after completion.
            </Text>
            <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => payAdvance(booking.id)}>
              <Text style={styles.actionPrimaryText}>Pay advance via UPI</Text>
            </Pressable>
          </View>
        )}

        {/* Milestones */}
        {booking.kind === 'project' && booking.milestones && ['scheduled', 'work_done', 'completed'].includes(booking.status) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Job progress</Text>
            {booking.milestones.map((m) => (
              <HStack key={m.label} gap={2} align="center">
                <CheckCircle2 size={18} color={m.done ? colors.semantic.success : colors.gray[300]} />
                <Text variant="body" style={{ color: m.done ? colors.surface.heading : colors.surface.textSecondary }}>
                  {m.label}
                </Text>
              </HStack>
            ))}
          </View>
        )}

        {/* Confirm & pay */}
        {booking.status === 'work_done' && (
          <View style={[styles.card, styles.quoteCard]}>
            <Text style={styles.cardTitle}>Confirm completion</Text>
            <Text variant="body" style={{ color: colors.surface.heading }}>
              Total payable: {fmt(booking.kind === 'project' ? booking.totalPaise - (booking.advancePaid ? booking.advancePaise ?? 0 : 0) : booking.totalPaise)}
              {booking.kind === 'project' && booking.advancePaid ? ' (advance adjusted)' : ''}
            </Text>
            <Pressable style={[styles.actionBtn, styles.actionPrimary]} onPress={() => setStatus(booking.id, 'completed')}>
              <Text style={styles.actionPrimaryText}>Confirm & Pay</Text>
            </Pressable>
          </View>
        )}

        {/* Tele-consult: join link once confirmed */}
        {booking.consultMode === 'online' && ['confirmed', 'checked_in'].includes(booking.status) && (
          <View style={[styles.card, { borderColor: colors.brand[200], backgroundColor: colors.brand[50] }]}>
            <Text style={styles.cardTitle}>Your online consultation</Text>
            <Text variant="caption" tone="secondary">Join 5 minutes before {booking.slotLabel}</Text>
            <Pressable
              style={[styles.actionBtn, styles.actionPrimary]}
              onPress={() => Alert.alert('Joining call…', 'Video calling will connect here (demo).')}
            >
              <Text style={styles.actionPrimaryText}>📹 Join Call</Text>
            </Pressable>
          </View>
        )}

        {/* Booking details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          {booking.services.map((s) => (
            <HStack key={s.id} gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{s.name}</Text>
              <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{fmt(s.pricePaise)}</Text>
            </HStack>
          ))}
          {!!booking.visitFeePaise && (
            <HStack gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body" tone="secondary">Visit fee {booking.urgency === 'emergency' ? '(emergency)' : ''}</Text>
              <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>{fmt(booking.visitFeePaise)}</Text>
            </HStack>
          )}
          <View style={styles.divider} />
          <HStack gap={2} align="center">
            <CalendarCheck size={14} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">{booking.date} · {booking.slotLabel}</Text>
          </HStack>
          {!!booking.address && (
            <HStack gap={2} align="center">
              <MapPin size={14} color={colors.surface.textSecondary} />
              <Text variant="caption" tone="secondary" style={{ flex: 1 }}>{booking.address}</Text>
            </HStack>
          )}
          {!!booking.providerName && (
            <Text variant="caption" tone="secondary">
              👤 {booking.providerName}{booking.providerRole ? ` · ${booking.providerRole}` : ''}
            </Text>
          )}
          {!!booking.fromAddress && !!booking.toAddress && (
            <Text variant="caption" tone="secondary">
              📦 {booking.fromAddress} → {booking.toAddress}{booking.inventory ? ` · ${booking.inventory}` : ''}
            </Text>
          )}
          {!!booking.roomCount && (
            <Text variant="caption" tone="secondary">🏠 Home size: {booking.roomCount}</Text>
          )}
          {!!booking.fastingRequired && (
            <Text variant="caption" style={{ color: colors.semantic.warning, fontWeight: '600' }}>
              🍽 Fasting required — 8-10 hrs before collection
            </Text>
          )}
          {!!booking.recurrence && (
            <Text variant="caption" tone="secondary">
              🔁 {booking.recurrence.plan}{booking.recurrence.meals?.length ? ` · ${booking.recurrence.meals.join(' + ')}` : ''}
            </Text>
          )}
          {!!booking.consultMode && (
            <Text variant="caption" tone="secondary">
              {booking.consultMode === 'online' ? '📹 Online consultation' : '🏢 At office'}
            </Text>
          )}
          {!!booking.petName && (
            <Text variant="caption" tone="secondary">🐾 For {booking.petName} · {booking.locationType === 'home' ? 'at home' : 'at clinic'}</Text>
          )}
          {!!booking.bookingFor && booking.bookingFor !== 'Self' && (
            <Text variant="caption" tone="secondary">Booking for: {booking.bookingFor}</Text>
          )}
          {!!booking.problem && (
            <Text variant="caption" tone="secondary">Issue: {booking.problem}</Text>
          )}
        </View>

        {/* Rating */}
        {booking.status === 'completed' && !booking.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How was the service?</Text>
            <HStack gap={3} style={{ justifyContent: 'center', marginVertical: spacing[2] }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => setStars(s)} hitSlop={6} accessibilityRole="button">
                  <Star size={34} color={s <= stars ? colors.accent[500] : colors.gray[300]} fill={s <= stars ? colors.accent[500] : 'transparent'} />
                </Pressable>
              ))}
            </HStack>
            <Pressable
              style={[styles.actionBtn, styles.actionPrimary, stars === 0 && { opacity: 0.5 }]}
              disabled={stars === 0}
              onPress={() => { setRating(booking.id, stars); Alert.alert('Thank you! ⭐', 'Your rating helps this provider grow.'); }}
            >
              <Text style={styles.actionPrimaryText}>Submit Rating</Text>
            </Pressable>
          </View>
        )}
        {!!booking.rating && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your rating</Text>
            <HStack gap={1}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={20} color={s <= booking.rating! ? colors.accent[500] : colors.gray[300]} fill={s <= booking.rating! ? colors.accent[500] : 'transparent'} />
              ))}
            </HStack>
          </View>
        )}

        {/* Cancel */}
        {canCancel && (
          <Pressable onPress={cancel} style={styles.cancelBtn} accessibilityRole="button">
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    backgroundColor: colors.surface.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.surface.surfaceMuted,
    borderWidth: 1, borderColor: colors.surface.border,
    alignItems: 'center', justifyContent: 'center',
  },
  heroCard: {
    margin: spacing[4],
    marginBottom: 0,
    alignItems: 'center',
    gap: spacing[1.5],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.brand[50],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    borderWidth: 1,
    borderColor: colors.surface.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.surface.heading,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: colors.surface.textSecondary,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[2],
  },
  quoteCard: {
    borderColor: colors.accent[200],
    backgroundColor: colors.accent[50],
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  stepRow: { flexDirection: 'row', gap: spacing[3] },
  stepRail: { alignItems: 'center', width: 16 },
  dot: {
    width: 12, height: 12, borderRadius: radius.full,
    borderWidth: 2, borderColor: colors.gray[300],
    backgroundColor: colors.surface.background, marginTop: 2,
  },
  dotDone: { borderColor: colors.semantic.success, backgroundColor: colors.semantic.success },
  dotActive: { borderColor: colors.brand[600], backgroundColor: colors.brand[100] },
  rail: { width: 2, flex: 1, minHeight: 16, backgroundColor: colors.gray[200], marginVertical: 2 },
  railDone: { backgroundColor: colors.semantic.success },
  stepLabel: { flex: 1, fontSize: fontSize.sm, color: colors.surface.textDisabled, paddingBottom: spacing[2.5] },
  stepLabelDone: { color: colors.surface.heading },
  stepLabelActive: { color: colors.brand[600], fontWeight: '700' },
  otpBox: {
    alignSelf: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2.5],
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[200],
    borderStyle: 'dashed',
    borderRadius: radius.md,
  },
  otpText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brand[700],
    letterSpacing: 8,
  },
  divider: { height: 1, backgroundColor: colors.surface.border, marginVertical: spacing[1] },
  counterInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    fontSize: fontSize.sm,
    color: colors.surface.heading,
    backgroundColor: colors.surface.background,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  actionPrimaryText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  cancelBtn: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.semantic.danger,
    backgroundColor: colors.surface.background,
  },
  cancelBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.semantic.danger,
  },
});
