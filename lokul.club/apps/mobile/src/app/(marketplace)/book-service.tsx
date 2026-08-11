// Unified service booking flow — slots (salon/clinic), windows (trades), site visits (projects)
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Home as HomeIcon, MapPin, Star, Store, Zap } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useCartStore } from '@/store/cartStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useBookingStore, bookingKindForCategory, DEMO_PROVIDERS, type BookingKind, type Provider } from '@/store/bookingStore';
import { colors, fontSize, radius, spacing } from '@lokul/ui-tokens';

const DAY_COUNT = 7;

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    let label: string;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    return { iso: d.toISOString().slice(0, 10), label, dayIndex: i };
  });
}

function slotTimes(dayIndex: number) {
  // 30-min slots 9:00–19:30, grouped; today hides past slots
  const groups: { title: string; slots: string[] }[] = [
    { title: 'Morning', slots: [] },
    { title: 'Afternoon', slots: [] },
    { title: 'Evening', slots: [] },
  ];
  const now = new Date();
  for (let h = 9; h < 20; h++) {
    for (const m of [0, 30]) {
      if (dayIndex === 0 && (h < now.getHours() || (h === now.getHours() && m <= now.getMinutes()))) continue;
      const label = `${((h + 11) % 12) + 1}:${m === 0 ? '00' : '30'} ${h < 12 ? 'AM' : 'PM'}`;
      if (h < 12) groups[0].slots.push(label);
      else if (h < 17) groups[1].slots.push(label);
      else groups[2].slots.push(label);
    }
  }
  return groups.filter((g) => g.slots.length > 0);
}

const WINDOWS = ['9 AM – 12 PM', '12 – 3 PM', '3 – 6 PM', '6 – 9 PM'];
const MORNING_WINDOWS = ['6 – 8 AM', '8 – 10 AM', '10 – 12 PM'];
const VISIT_SLOTS = ['10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'];
const ROOM_SIZES = ['1 RK', '1 BHK', '2 BHK', '3 BHK', 'Villa'];
const TIFFIN_PLANS = ['Daily', 'Weekdays only', 'Custom'];
const TIFFIN_MEALS = ['Lunch', 'Dinner'];

const PROBLEM_CHIPS: Record<string, string[]> = {
  repair: ['AC not cooling', 'Water leakage', 'Power issue', 'Strange noise', 'Not turning on'],
  movers: [],
};

export default function BookServiceScreen() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const createBooking = useBookingStore((s) => s.createBooking);
  const { societyName, tower, flat, pin, city } = useOnboardingStore();

  const merchantName = items[0]?.merchantName ?? 'Local Shop';
  const merchantId = items[0]?.merchantId ?? '0';
  // Category comes through the cart item kind hints; fall back by merchant id ranges
  const category = useMemo(() => {
    const byId: Record<string, string> = {
      '5': 'salon', '6': 'salon',
      '7': 'clinic', '8': 'clinic', '9': 'clinic',
      '10': 'repair', '11': 'repair',
      '12': 'movers',
      '13': 'pet_care',
      '14': 'lab_test',
      '15': 'pest_control',
      '16': 'event',
      '17': 'tiffin',
      '18': 'consult',
      '20': 'laundry',
      '21': 'maid', '22': 'cook', '23': 'driver',
      '24': 'carpenter',
      '25': 'painter',
      '27': 'gardener', '28': 'car_wash',
      '29': 'fitness', '30': 'massage',
      '32': 'tutor_academic', '33': 'elderly_care',
    };
    return byId[merchantId] ?? 'salon';
  }, [merchantId]);

  const kind: BookingKind = bookingKindForCategory(category);
  const isTrades = category === 'repair' || category === 'carpenter';
  const isLab = category === 'lab_test';
  const isPest = category === 'pest_control';
  const isLaundry = category === 'laundry';
  const isMovers = category === 'movers';
  const isEvent = category === 'event';
  const isProject = kind === 'project';
  const isPet = category === 'pet_care';
  const isClinic = category === 'clinic';
  const isTiffin = category === 'tiffin';
  const isConsult = category === 'consult';
  const fastingNeeded = isLab && items.some((i) => i.name.toLowerCase().includes('fasting') || i.name.toLowerCase().includes('body checkup') || i.name.toLowerCase().includes('hba1c'));

  const days = useMemo(() => nextDays(DAY_COUNT), []);
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [problem, setProblem] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<'normal' | 'emergency'>('normal');
  const [bookingFor, setBookingFor] = useState('Self');
  const [petName, setPetName] = useState('');
  const [locationType, setLocationType] = useState<'home' | 'clinic'>('home');
  const [notes, setNotes] = useState('');
  const [providerId, setProviderId] = useState<string | null>(null);
  const [roomCount, setRoomCount] = useState<string | null>(null);
  const [toAddress, setToAddress] = useState('');
  const [inventory, setInventory] = useState<string | null>(null);
  const [tiffinPlan, setTiffinPlan] = useState('Weekdays only');
  const [tiffinMeals, setTiffinMeals] = useState<string[]>(['Lunch']);
  const [consultMode, setConsultMode] = useState<'online' | 'office'>('online');

  const [providers, setProviders] = useState<Provider[]>(DEMO_PROVIDERS[merchantId] ?? []);
  useEffect(() => {
    let alive = true;
    fetch(`${process.env.EXPO_PUBLIC_API_BASE ?? ''}/api/mobile/merchants/${merchantId}/staff`)
      .then((r) => r.json())
      .then((data: { items?: { id: string; name: string; role: string; rating?: number; years?: number }[] }) => {
        if (alive && data.items && data.items.length > 0) {
          setProviders(data.items.map((s) => ({
            id: s.id, name: s.name, role: s.role, rating: s.rating ?? 0, years: s.years ?? 0,
          })));
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [merchantId]);
  const selectedProvider = providers.find((p) => p.id === providerId) ?? null;

  const savedAddress = [flat, tower ? `Tower ${tower}` : null, societyName, city, pin].filter(Boolean).join(', ');
  const needsAddress = isTrades || isLab || isPest || isLaundry || isProject || isTiffin || (isPet && locationType === 'home');

  const totalPaise = items.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0);
  const totalDuration = items.length * 30; // demo estimate: 30 min per service
  const visitFeePaise = isTrades ? (urgency === 'emergency' ? 19900 : 9900) : 0;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 });
    if (!res.canceled && res.assets[0]) setPhotoUri(res.assets[0].uri);
  };

  const windowChoices = isLab ? MORNING_WINDOWS : WINDOWS;
  const slotOptions = (() => {
    if (isProject && !isEvent) return VISIT_SLOTS;
    if (kind === 'window') return windowChoices;
    return null;
  })();
  const slotGroups = kind === 'slot' || isEvent ? slotTimes(isEvent ? 1 : dayIndex) : null;

  const confirmBooking = () => {
    if (!slot) {
      Alert.alert('Pick a time', isTrades ? 'Choose a visit window' : 'Choose a time slot');
      return;
    }
    if (isPet && !petName.trim()) {
      Alert.alert('Pet name', 'Tell us who we\u2019re pampering 🐾');
      return;
    }
    if (isPest && !roomCount) {
      Alert.alert('Home size', 'Select your home size so the team brings enough material');
      return;
    }
    if (isMovers && !toAddress.trim()) {
      Alert.alert('Drop location', 'Enter where you’re moving to');
      return;
    }
    const booking = createBooking({
      id: `bk-${Date.now()}`,
      kind,
      merchantId,
      merchantName,
      category,
      services: items.map((i) => ({ id: i.id, name: i.name, pricePaise: i.pricePaise })),
      date: days[dayIndex].iso,
      slotLabel: isProject && !isEvent ? `${slot} (site visit)` : slot,
      address: needsAddress ? savedAddress : undefined,
      bookingFor: isClinic ? bookingFor : undefined,
      petName: isPet ? petName.trim() : undefined,
      locationType: isPet ? locationType : undefined,
      providerName: selectedProvider?.name,
      providerRole: selectedProvider?.role,
      staffId: selectedProvider?.id,
      fromAddress: isMovers ? savedAddress : undefined,
      toAddress: isMovers ? toAddress.trim() : undefined,
      inventory: isMovers ? inventory ?? undefined : undefined,
      fastingRequired: fastingNeeded || undefined,
      roomCount: isPest ? roomCount ?? undefined : undefined,
      recurrence: isTiffin ? { plan: tiffinPlan, meals: tiffinMeals } : undefined,
      consultMode: isConsult ? consultMode : undefined,
      problem: isTrades && problem.trim() ? problem.trim() : undefined,
      problemPhotoUri: photoUri ?? undefined,
      urgency: isTrades ? urgency : undefined,
      visitFeePaise: visitFeePaise || undefined,
      milestones: (() => {
        if (isMovers) return [
          { label: 'Packing & loading', done: false },
          { label: 'In transit', done: false },
          { label: 'Unloading & setup', done: false },
        ];
        if (isEvent) return [
          { label: 'Requirements call', done: false },
          { label: 'Event day coverage', done: false },
          { label: 'Photos & video delivered', done: false },
        ];
        return undefined;
      })(),
      onsiteQuote: null,
      quote: null,
      totalPaise: totalPaise + visitFeePaise,
    });
    clearCart();
    router.replace({ pathname: '/(marketplace)/booking/[id]', params: { id: booking.id } } as never);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button" hitSlop={8}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="h3" style={{ color: colors.surface.heading }}>
            {(() => {
              if (isEvent) return 'Book Your Event';
              if (isProject) return 'Book Site Visit';
              if (isTiffin) return 'Start Subscription';
              if (isLaundry) return 'Schedule Pickup';
              return 'Book Appointment';
            })()}
          </Text>
          <Text variant="caption" tone="secondary">{merchantName}</Text>
        </VStack>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Services summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {items.length} service{items.length > 1 ? 's' : ''} · ₹{(totalPaise / 100).toFixed(0)}
          </Text>
          {items.map((i) => (
            <HStack key={i.id} gap={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>
                {i.name}{i.quantity > 1 ? ` × ${i.quantity}` : ''}
              </Text>
              <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                ₹{((i.pricePaise * i.quantity) / 100).toFixed(0)}
              </Text>
            </HStack>
          ))}
          {!isProject && (
            <Text variant="caption" tone="secondary">Est. duration ~{totalDuration} min</Text>
          )}
        </View>

        {/* Pet: home/clinic toggle + name */}
        {isPet && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Where should we serve?</Text>
            <HStack gap={2}>
              <Pressable
                style={[styles.toggle, locationType === 'home' && styles.toggleActive]}
                onPress={() => setLocationType('home')}
              >
                <HomeIcon size={16} color={locationType === 'home' ? colors.brand[600] : colors.surface.textSecondary} />
                <Text style={[styles.toggleText, locationType === 'home' && styles.toggleTextActive]}>At my home</Text>
              </Pressable>
              <Pressable
                style={[styles.toggle, locationType === 'clinic' && styles.toggleActive]}
                onPress={() => setLocationType('clinic')}
              >
                <Store size={16} color={locationType === 'clinic' ? colors.brand[600] : colors.surface.textSecondary} />
                <Text style={[styles.toggleText, locationType === 'clinic' && styles.toggleTextActive]}>At the clinic</Text>
              </Pressable>
            </HStack>
            <TextInput
              style={styles.input}
              placeholder="Pet's name (e.g. Bruno)"
              placeholderTextColor={colors.surface.textDisabled}
              value={petName}
              onChangeText={setPetName}
            />
          </View>
        )}

        {/* Trades: problem description + urgency */}
        {isTrades && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What's the problem?</Text>
            <HStack gap={2} wrap>
              {PROBLEM_CHIPS.repair.map((chip) => (
                <Pressable
                  key={chip}
                  style={[styles.chip, problem === chip && styles.chipActive]}
                  onPress={() => setProblem(chip)}
                >
                  <Text style={[styles.chipText, problem === chip && styles.chipTextActive]}>{chip}</Text>
                </Pressable>
              ))}
            </HStack>
            <TextInput
              style={[styles.input, { height: 72, textAlignVertical: 'top' }]}
              placeholder="Describe the issue (helps bring the right parts)…"
              placeholderTextColor={colors.surface.textDisabled}
              value={problem}
              onChangeText={setProblem}
              multiline
            />
            <Pressable style={styles.photoBtn} onPress={pickPhoto} accessibilityRole="button">
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              ) : (
                <>
                  <Camera size={18} color={colors.brand[600]} />
                  <Text style={styles.photoBtnText}>Add a photo (optional)</Text>
                </>
              )}
            </Pressable>

            <Text style={styles.cardTitle}>How urgent?</Text>
            <HStack gap={2}>
              <Pressable
                style={[styles.toggle, urgency === 'normal' && styles.toggleActive]}
                onPress={() => setUrgency('normal')}
              >
                <Text style={[styles.toggleText, urgency === 'normal' && styles.toggleTextActive]}>Normal · ₹99 visit</Text>
              </Pressable>
              <Pressable
                style={[styles.toggle, urgency === 'emergency' && styles.toggleEmergency]}
                onPress={() => setUrgency('emergency')}
              >
                <Zap size={14} color={urgency === 'emergency' ? colors.semantic.danger : colors.surface.textSecondary} />
                <Text style={[styles.toggleText, urgency === 'emergency' && { color: colors.semantic.danger, fontWeight: '700' }]}>
                  Emergency · ₹199
                </Text>
              </Pressable>
            </HStack>
            <Text variant="caption" tone="secondary">Visit fee is waived if you go ahead with the work</Text>
          </View>
        )}

        {/* Clinic: booking for */}
        {isClinic && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booking for</Text>
            <HStack gap={2} wrap>
              {['Self', 'Parent', 'Child', 'Other'].map((who) => (
                <Pressable
                  key={who}
                  style={[styles.chip, bookingFor === who && styles.chipActive]}
                  onPress={() => setBookingFor(who)}
                >
                  <Text style={[styles.chipText, bookingFor === who && styles.chipTextActive]}>{who}</Text>
                </Pressable>
              ))}
            </HStack>
          </View>
        )}

        {/* Choose specialist — salons/clinics/pet */}
        {providers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {isClinic ? 'Choose your doctor' : 'Choose your specialist'}
            </Text>
            <Pressable
              style={[styles.providerRow, providerId === null && styles.providerRowActive]}
              onPress={() => setProviderId(null)}
              accessibilityRole="button"
            >
              <View style={styles.providerAvatar}>
                <Text style={styles.providerInitial}>✦</Text>
              </View>
              <VStack gap={0} style={{ flex: 1 }}>
                <Text style={styles.providerName}>Any available</Text>
                <Text style={styles.providerRole}>Fastest slot — we’ll assign the best match</Text>
              </VStack>
            </Pressable>
            {providers.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.providerRow, providerId === p.id && styles.providerRowActive]}
                onPress={() => setProviderId(p.id)}
                accessibilityRole="button"
                accessibilityLabel={`Choose ${p.name}, ${p.role}`}
              >
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerInitial}>{p.name.replace('Dr. ', '').charAt(0)}</Text>
                </View>
                <VStack gap={0} style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{p.name}</Text>
                  <Text style={styles.providerRole}>{p.role} · {p.years} yrs</Text>
                </VStack>
                <HStack gap={1} align="center">
                  <Star size={12} color={colors.accent[500]} fill={colors.accent[500]} />
                  <Text style={styles.providerRating}>{p.rating.toFixed(1)}</Text>
                </HStack>
              </Pressable>
            ))}
          </View>
        )}

        {/* Movers: from → to + inventory */}
        {isMovers && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Moving from</Text>
            <HStack gap={2} align="center">
              <MapPin size={16} color={colors.brand[600]} />
              <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{savedAddress}</Text>
            </HStack>
            <Text style={styles.cardTitle}>Moving to *</Text>
            <TextInput
              style={styles.input}
              placeholder="New address (society, area, city)"
              placeholderTextColor={colors.surface.textDisabled}
              value={toAddress}
              onChangeText={setToAddress}
            />
            <Text style={styles.cardTitle}>Home size</Text>
            <HStack gap={2} wrap>
              {ROOM_SIZES.map((r) => (
                <Pressable key={r} style={[styles.chip, inventory === r && styles.chipActive]} onPress={() => setInventory(r)}>
                  <Text style={[styles.chipText, inventory === r && styles.chipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </HStack>
          </View>
        )}

        {/* Pest control: home size */}
        {isPest && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Home size *</Text>
            <Text variant="caption" tone="secondary">Helps the team bring the right amount of material</Text>
            <HStack gap={2} wrap>
              {ROOM_SIZES.map((r) => (
                <Pressable key={r} style={[styles.chip, roomCount === r && styles.chipActive]} onPress={() => setRoomCount(r)}>
                  <Text style={[styles.chipText, roomCount === r && styles.chipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </HStack>
          </View>
        )}

        {/* Lab: fasting notice */}
        {isLab && fastingNeeded && (
          <View style={[styles.card, { backgroundColor: colors.semantic.warningBg, borderColor: colors.accent[200] }]}>
            <Text style={[styles.cardTitle, { color: colors.semantic.warning }]}>🍽 Fasting required</Text>
            <Text variant="caption" style={{ color: colors.semantic.warning }}>
              Don't eat or drink (except water) for 8–10 hours before sample collection. Morning slots recommended.
            </Text>
          </View>
        )}

        {/* Tiffin: subscription plan */}
        {isTiffin && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery plan</Text>
            <HStack gap={2} wrap>
              {TIFFIN_PLANS.map((p) => (
                <Pressable key={p} style={[styles.chip, tiffinPlan === p && styles.chipActive]} onPress={() => setTiffinPlan(p)}>
                  <Text style={[styles.chipText, tiffinPlan === p && styles.chipTextActive]}>{p}</Text>
                </Pressable>
              ))}
            </HStack>
            <Text style={styles.cardTitle}>Meals</Text>
            <HStack gap={2}>
              {TIFFIN_MEALS.map((m) => {
                const on = tiffinMeals.includes(m);
                return (
                  <Pressable
                    key={m}
                    style={[styles.chip, on && styles.chipActive]}
                    onPress={() => setTiffinMeals((prev) => (on ? prev.filter((x) => x !== m) : [...prev, m]))}
                  >
                    <Text style={[styles.chipText, on && styles.chipTextActive]}>{m}</Text>
                  </Pressable>
                );
              })}
            </HStack>
            <Text variant="caption" tone="secondary">Pause or cancel anytime · first delivery on your chosen start date</Text>
          </View>
        )}

        {/* Consult: online vs office */}
        {isConsult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How do you want to consult?</Text>
            <HStack gap={2}>
              <Pressable
                style={[styles.toggle, consultMode === 'online' && styles.toggleActive]}
                onPress={() => setConsultMode('online')}
              >
                <Text style={[styles.toggleText, consultMode === 'online' && styles.toggleTextActive]}>📹 Online call</Text>
              </Pressable>
              <Pressable
                style={[styles.toggle, consultMode === 'office' && styles.toggleActive]}
                onPress={() => setConsultMode('office')}
              >
                <Text style={[styles.toggleText, consultMode === 'office' && styles.toggleTextActive]}>🏢 At office</Text>
              </Pressable>
            </HStack>
            {consultMode === 'online' && (
              <Text variant="caption" tone="secondary">A meeting link is shared once the expert confirms</Text>
            )}
          </View>
        )}

        {/* Date picker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {(() => {
              if (isTiffin) return 'Start date';
              if (isEvent) return 'Event date';
              return 'Pick a date';
            })()}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ gap: spacing[2] }}>
            {days.map((d) => (
              <Pressable
                key={d.iso}
                style={[styles.dayChip, dayIndex === d.dayIndex && styles.dayChipActive]}
                onPress={() => { setDayIndex(d.dayIndex); setSlot(null); }}
              >
                <Text style={[styles.dayChipText, dayIndex === d.dayIndex && styles.dayChipTextActive]}>{d.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Windows (trades/lab/laundry) or site-visit slots (project) */}
          {slotOptions && (
            <>
              <Text style={[styles.cardTitle, { marginTop: spacing[3] }]}>
                {(() => {
                  if (isProject) return 'Site visit time (free)';
                  if (isLab) return 'Sample collection window';
                  if (isLaundry) return 'Pickup window';
                  return 'Visit window';
                })()}
              </Text>
              <HStack gap={2} wrap>
                {slotOptions.map((w) => (
                  <Pressable
                    key={w}
                    style={[styles.slotChip, slot === w && styles.slotChipActive]}
                    onPress={() => setSlot(w)}
                  >
                    <Text style={[styles.slotChipText, slot === w && styles.slotChipTextActive]}>{w}</Text>
                  </Pressable>
                ))}
              </HStack>
            </>
          )}

          {/* Exact slot grid (salon/clinic/pet) */}
          {slotGroups?.map((group) => (
            <View key={group.title} style={{ marginTop: spacing[3] }}>
              <Text style={styles.groupTitle}>{group.title}</Text>
              <HStack gap={2} wrap>
                {group.slots.map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.slotChip, slot === s && styles.slotChipActive]}
                    onPress={() => setSlot(s)}
                  >
                    <Text style={[styles.slotChipText, slot === s && styles.slotChipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </HStack>
            </View>
          ))}
          {slotGroups && slotGroups.length === 0 && (
            <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2] }}>
              No slots left today — try tomorrow
            </Text>
          )}
        </View>

        {/* Address */}
        {needsAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service address</Text>
            <HStack gap={2} align="center">
              <MapPin size={16} color={colors.brand[600]} />
              <Text variant="body" style={{ color: colors.surface.heading, flex: 1 }}>{savedAddress}</Text>
            </HStack>
          </View>
        )}

        {/* Notes */}
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Any notes for the provider? (optional)"
            placeholderTextColor={colors.surface.textDisabled}
            value={notes}
            onChangeText={setNotes}
          />
          <Text variant="caption" tone="secondary">💵 Pay after service — at venue or via UPI</Text>
        </View>
      </ScrollView>

      {/* Confirm bar */}
      <View style={styles.confirmBar}>
        <VStack gap={0}>
          <Text style={styles.confirmTotal}>₹{((totalPaise + visitFeePaise) / 100).toFixed(0)}</Text>
          <Text variant="caption" tone="secondary">
            {visitFeePaise > 0 ? 'incl. visit fee' : 'pay after service'}
          </Text>
        </VStack>
        <Pressable style={styles.confirmBtn} onPress={confirmBooking} accessibilityRole="button">
          <Text style={styles.confirmBtnText}>
            {(() => {
              if (isEvent) return 'Book Event';
              if (isProject) return 'Request Site Visit';
              if (isTiffin) return 'Start Subscription';
              if (isLaundry) return 'Schedule Pickup';
              return 'Confirm Booking';
            })()}
          </Text>
        </Pressable>
      </View>
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
  card: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    gap: spacing[2.5],
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  groupTitle: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.surface.textSecondary,
    marginBottom: spacing[1.5],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2.5],
    fontSize: fontSize.sm,
    color: colors.surface.heading,
    backgroundColor: colors.surface.background,
  },
  chip: {
    paddingHorizontal: spacing[3],
    height: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.surface.textSecondary,
  },
  chipTextActive: {
    color: colors.brand[700],
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[2.5],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surfaceMuted,
  },
  providerRowActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[50],
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInitial: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.brand[600],
  },
  providerName: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  providerRole: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  providerRating: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1.5],
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surfaceMuted,
  },
  toggleActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
  toggleEmergency: {
    backgroundColor: colors.semantic.dangerBg,
    borderColor: colors.semantic.danger,
  },
  toggleText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.surface.textSecondary,
  },
  toggleTextActive: {
    color: colors.brand[700],
    fontWeight: '700',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    height: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand[200],
    borderStyle: 'dashed',
    backgroundColor: colors.brand[50],
    overflow: 'hidden',
  },
  photoBtnText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.brand[600],
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  dayChip: {
    paddingHorizontal: spacing[3.5],
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  dayChipText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.surface.textSecondary,
  },
  dayChipTextActive: {
    color: colors.surface.background,
  },
  slotChip: {
    paddingHorizontal: spacing[3],
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  slotChipText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.surface.heading,
  },
  slotChipTextActive: {
    color: colors.surface.background,
  },
  confirmBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    paddingBottom: spacing[6],
    backgroundColor: colors.surface.background,
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
  confirmTotal: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  confirmBtn: {
    height: 48,
    paddingHorizontal: spacing[6],
    borderRadius: radius.md,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.surface.background,
  },
});
