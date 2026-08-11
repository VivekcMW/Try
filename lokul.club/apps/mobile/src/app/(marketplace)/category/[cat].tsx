import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Star } from 'lucide-react-native';
import { Avatar, Card, HStack, Text, VStack } from '@/components/ui';
import { SERVICE_CATEGORIES } from '@/data/community-seed';
import { useOnboardingStore } from '@/store/onboardingStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ProviderItem = {
  id: string;
  name: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  priceLabel?: string;
  pricePaise?: number;
  verified?: boolean;
  category: string;
  // For service listings: ownerId == userId
  ownerId?: string;
  // For peer listings: listingId present
  listingId?: string;
};

export default function CategoryScreen() {
  const { cat }  = useLocalSearchParams<{ cat: string }>();
  const router   = useRouter();
  const pinCode  = useOnboardingStore((s) => s.pin);
  const category = SERVICE_CATEGORIES.find((c) => c.id === cat);
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  // Demo shops per category so pills always land somewhere useful (ids match storefront demo data)
  const DEMO_BY_CATEGORY: Record<string, ProviderItem[]> = {
    // Home Help
    maid: [
      { id: '21', name: 'Lakshmi Home Cleaning', bio: 'Daily cleaning, deep cleans & utensils — trial visit available', rating: 4.5, reviewCount: 87, priceLabel: 'From ₹2,500/mo', verified: true, category: 'maid' },
    ],
    cook: [
      { id: '22', name: "Anita's Kitchen Service", bio: 'Home cooks for daily meals — trial meal available', rating: 4.6, reviewCount: 64, priceLabel: 'From ₹3,500/mo', verified: true, category: 'cook' },
    ],
    tiffin: [
      { id: '17', name: 'Ghar Ka Khana Tiffin', bio: 'Home-style tiffins — monthly plans, fresh daily', rating: 4.5, reviewCount: 261, priceLabel: 'From ₹2,600/mo', verified: true, category: 'tiffin' },
    ],
    driver: [
      { id: '23', name: 'Ravi On-Call Drivers', bio: 'Verified drivers — hourly, daily or monthly', rating: 4.4, reviewCount: 121, priceLabel: 'From ₹600/4hrs', verified: true, category: 'driver' },
    ],
    // Home & Trades
    plumber: [
      { id: '11', name: 'Sharma Plumbing & Electrical', bio: 'Leaks, wiring & fittings — 30-day warranty', rating: 4.3, reviewCount: 98, priceLabel: 'From ₹200', verified: false, category: 'plumber' },
    ],
    electrician: [
      { id: '11', name: 'Sharma Plumbing & Electrical', bio: 'Wiring, switchboards & installations', rating: 4.3, reviewCount: 98, priceLabel: 'From ₹200', verified: false, category: 'electrician' },
    ],
    carpenter: [
      { id: '24', name: 'WoodCraft Carpentry', bio: 'Furniture repair, fittings & custom woodwork', rating: 4.5, reviewCount: 73, priceLabel: 'From ₹250', verified: false, category: 'carpenter' },
    ],
    ac_repair: [
      { id: '10', name: 'QuickFix AC & Appliance Repair', bio: 'AC, fridge & washing machine — doorstep repair', rating: 4.5, reviewCount: 176, priceLabel: 'Visit ₹99 (waived on repair)', verified: true, category: 'ac_repair' },
    ],
    appliance_repair: [
      { id: '10', name: 'QuickFix AC & Appliance Repair', bio: 'Fridge, washing machine & microwave repair', rating: 4.5, reviewCount: 176, priceLabel: 'Visit ₹99 (waived on repair)', verified: true, category: 'appliance_repair' },
    ],
    water_purifier: [
      { id: '10', name: 'QuickFix AC & Appliance Repair', bio: 'RO service, filter change & installation', rating: 4.5, reviewCount: 176, priceLabel: 'From ₹300', verified: true, category: 'water_purifier' },
    ],
    cctv_security: [
      { id: '11', name: 'Sharma Plumbing & Electrical', bio: 'CCTV installation & smart doorbells', rating: 4.3, reviewCount: 98, priceLabel: 'From ₹500', verified: false, category: 'cctv_security' },
    ],
    painter: [
      { id: '25', name: 'ColorMax Painting & Civil', bio: 'Home painting & waterproofing — free site visit', rating: 4.6, reviewCount: 95, priceLabel: 'From ₹2,500/wall', verified: true, category: 'painter' },
    ],
    mason: [
      { id: '25', name: 'ColorMax Painting & Civil', bio: 'Minor civil work, tiling & repairs', rating: 4.6, reviewCount: 95, priceLabel: 'Site visit free', verified: true, category: 'mason' },
    ],
    pest_control: [
      { id: '15', name: 'ShieldPro Pest Control', bio: 'Cockroach, termite & bed-bug — 90-day warranty', rating: 4.4, reviewCount: 112, priceLabel: 'From ₹899', verified: true, category: 'pest_control' },
    ],
    packers_movers: [
      { id: '12', name: 'SafeNest Packers & Movers', bio: 'Local shifting · free site visit · insured transit', rating: 4.6, reviewCount: 220, priceLabel: 'From ₹3,000', verified: true, category: 'packers_movers' },
    ],
    car_wash: [
      { id: '28', name: 'ShineAuto Car Wash @Home', bio: 'Doorstep eco wash & detailing', rating: 4.4, reviewCount: 108, priceLabel: 'From ₹300', verified: true, category: 'car_wash' },
    ],
    laundry: [
      { id: '20', name: 'Sparkle Wash Laundry', bio: 'Free pickup & delivery — wash, iron, dry-clean', rating: 4.3, reviewCount: 154, priceLabel: 'From ₹80/kg', verified: false, category: 'laundry' },
    ],
    gardener: [
      { id: '27', name: 'GreenThumb Mali Services', bio: 'Garden maintenance & terrace garden setup', rating: 4.3, reviewCount: 41, priceLabel: 'From ₹800', verified: false, category: 'gardener' },
    ],
    // Personal Care
    salon: [
      { id: '5', name: 'Glamour Touch Salon', bio: 'Haircuts, facials & grooming for men & women', rating: 4.6, reviewCount: 94, priceLabel: 'From ₹80', verified: true, category: 'salon' },
      { id: '6', name: 'Style Studio Unisex Salon', bio: 'Hair spa, manicure & bridal packages', rating: 4.2, reviewCount: 58, priceLabel: 'From ₹60', verified: false, category: 'salon' },
    ],
    barber: [
      { id: '5', name: 'Glamour Touch Salon', bio: 'Haircuts, beard styling & grooming', rating: 4.6, reviewCount: 94, priceLabel: 'From ₹80', verified: true, category: 'barber' },
    ],
    mehendi: [
      { id: '6', name: 'Style Studio Unisex Salon', bio: 'Bridal & festive mehendi artists', rating: 4.2, reviewCount: 58, priceLabel: 'From ₹500', verified: false, category: 'mehendi' },
    ],
    fitness: [
      { id: '29', name: 'FitLife Trainers & Yoga', bio: 'Personal training at home or society gym', rating: 4.7, reviewCount: 66, priceLabel: 'From ₹800/session', verified: true, category: 'fitness' },
    ],
    yoga: [
      { id: '29', name: 'FitLife Trainers & Yoga', bio: 'Morning yoga batches at the clubhouse', rating: 4.7, reviewCount: 66, priceLabel: 'From ₹300/class', verified: true, category: 'yoga' },
    ],
    massage: [
      { id: '30', name: 'Relax Spa & Massage @Home', bio: 'Certified therapists at your home', rating: 4.5, reviewCount: 59, priceLabel: 'From ₹1,500', verified: true, category: 'massage' },
    ],
    physiotherapy: [
      { id: '30', name: 'Relax Spa & Massage @Home', bio: 'Physiotherapy at home — posture & recovery', rating: 4.5, reviewCount: 59, priceLabel: 'From ₹700/session', verified: true, category: 'physiotherapy' },
    ],
    dietitian: [
      { id: '7', name: 'Sunrise Family Clinic', bio: 'Diet consultations with clinical nutritionist', rating: 4.8, reviewCount: 210, priceLabel: 'From ₹300', verified: true, category: 'dietitian' },
    ],
    nurse: [
      { id: '7', name: 'Sunrise Family Clinic', bio: 'Home nursing & injection visits', rating: 4.8, reviewCount: 210, priceLabel: 'From ₹300/visit', verified: true, category: 'nurse' },
    ],
    lab_test: [
      { id: '14', name: 'HealthFirst Diagnostics @Home', bio: 'Blood tests at home — reports in 24h', rating: 4.6, reviewCount: 188, priceLabel: 'From ₹400', verified: true, category: 'lab_test' },
    ],
    pet_care: [
      { id: '13', name: 'Happy Paws Grooming & Vet', bio: 'Grooming at home or clinic · vet consultations', rating: 4.7, reviewCount: 143, priceLabel: 'From ₹350', verified: true, category: 'pet_care' },
    ],
    // Professional
    photographer: [
      { id: '16', name: 'Moments Photography & Events', bio: 'Weddings, birthdays & society events', rating: 4.8, reviewCount: 76, priceLabel: 'From ₹8,000', verified: true, category: 'photographer' },
    ],
    ca_accountant: [
      { id: '18', name: 'LegalEase CA & Advocates', bio: 'ITR, GST & compliance — online or office', rating: 4.7, reviewCount: 89, priceLabel: 'From ₹999', verified: true, category: 'ca_accountant' },
    ],
    lawyer: [
      { id: '18', name: 'LegalEase CA & Advocates', bio: 'Legal consultations, notary & agreements', rating: 4.7, reviewCount: 89, priceLabel: 'From ₹1,200', verified: true, category: 'lawyer' },
    ],
    interior_designer: [
      { id: '25', name: 'ColorMax Painting & Civil', bio: 'Interior makeovers — free site visit & quote', rating: 4.6, reviewCount: 95, priceLabel: 'Site visit free', verified: true, category: 'interior_designer' },
    ],
    event_planner: [
      { id: '16', name: 'Moments Photography & Events', bio: 'End-to-end event planning & decor', rating: 4.8, reviewCount: 76, priceLabel: 'From ₹15,000', verified: true, category: 'event_planner' },
    ],
    catering: [
      { id: '16', name: 'Moments Photography & Events', bio: 'Event catering — veg & non-veg menus', rating: 4.8, reviewCount: 76, priceLabel: 'From ₹250/plate', verified: true, category: 'catering' },
    ],
    tutor_academic: [
      { id: '32', name: 'BrightMinds Tutors', bio: 'Maths, science & English — free demo class', rating: 4.8, reviewCount: 112, priceLabel: 'From ₹4,000/mo', verified: true, category: 'tutor_academic' },
    ],
    career_counsellor: [
      { id: '18', name: 'LegalEase CA & Advocates', bio: 'Career & education guidance sessions', rating: 4.7, reviewCount: 89, priceLabel: 'From ₹999', verified: true, category: 'career_counsellor' },
    ],
    insurance_advisor: [
      { id: '18', name: 'LegalEase CA & Advocates', bio: 'Health & term insurance guidance', rating: 4.7, reviewCount: 89, priceLabel: 'Free consultation', verified: true, category: 'insurance_advisor' },
    ],
    // Society
    society_maintenance: [
      { id: '11', name: 'Sharma Plumbing & Electrical', bio: 'Common-area electrical & plumbing upkeep', rating: 4.3, reviewCount: 98, priceLabel: 'From ₹200', verified: false, category: 'society_maintenance' },
    ],
    elderly_care: [
      { id: '33', name: 'CareNest Elder & Child Care', bio: 'Verified caretakers — free meet & greet', rating: 4.6, reviewCount: 48, priceLabel: 'From ₹1,200/day', verified: true, category: 'elderly_care' },
    ],
    childcare: [
      { id: '33', name: 'CareNest Elder & Child Care', bio: 'Background-verified nannies — free meet & greet', rating: 4.6, reviewCount: 48, priceLabel: 'From ₹18,000/mo', verified: true, category: 'childcare' },
    ],
  };

  const applyDemoFallback = useCallback((items: ProviderItem[]) => {
    if (items.length > 0) return items;
    return DEMO_BY_CATEGORY[cat ?? ''] ?? [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  const load = useCallback(async () => {
    if (!pinCode) { setProviders(applyDemoFallback([])); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      // Fetch from both merchants and peer service-listings in parallel
      const [merchantRes, listingRes] = await Promise.allSettled([
        fetch(`${BASE}/api/mobile/merchants?pinCode=${pinCode}&category=${encodeURIComponent(cat ?? '')}`, { signal: controller.signal }),
        fetch(`${BASE}/api/mobile/service-listings?pinCode=${pinCode}&category=${encodeURIComponent(cat ?? '')}`, { signal: controller.signal }),
      ]);

      const merchantItems: ProviderItem[] = [];
      if (merchantRes.status === 'fulfilled' && merchantRes.value.ok) {
        const data = await merchantRes.value.json();
        (data.items ?? []).forEach((m: any) => {
          merchantItems.push({
            id:         m.id,
            name:       m.name,
            bio:        m.description,
            rating:     m.ratingAvg,
            reviewCount: m.ratingCount,
            priceLabel: m.priceLabel ?? undefined,
            verified:   m.owner?.kycTier !== 'bronze',
            category:   m.category,
            ownerId:    m.ownerId ?? m.owner?.id,
          });
        });
      }

      const listingItems: ProviderItem[] = [];
      if (listingRes.status === 'fulfilled' && listingRes.value.ok) {
        const data = await listingRes.value.json();
        (data.items ?? []).forEach((l: any) => {
          // Avoid showing duplicate if same user has both a merchant and a listing
          const alreadyShown = merchantItems.some((m) => m.ownerId === l.userId);
          if (!alreadyShown) {
            listingItems.push({
              id:          l.id,
              name:        l.user?.name ?? 'Provider',
              bio:         l.description || l.title,
              rating:      l.ratingAvg ?? undefined,
              reviewCount: l.ratingCount,
              pricePaise:  l.pricePaise,
              priceLabel:  l.pricePaise > 0 ? `₹${(l.pricePaise / 100).toFixed(0)}/${l.priceUnit ?? 'session'}` : 'Contact for price',
              verified:    l.user?.kycTier !== 'bronze',
              category:    l.category,
              ownerId:     l.userId,
              listingId:   l.id,
            });
          }
        });
      }

      setProviders(applyDemoFallback([...listingItems, ...merchantItems]));
    } catch {
      const demo = applyDemoFallback([]);
      setProviders(demo);
      setError(demo.length === 0 ? 'Could not reach the server. Pull to retry.' : null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, [pinCode, cat, applyDemoFallback]);

  useEffect(() => { load(); }, [load]);

  function openBooking(item: ProviderItem) {
    if (item.listingId) {
      // Peer service listing — pass listingId + price as params
      router.push({
        pathname: '/(marketplace)/book/[id]' as never,
        params: { id: item.ownerId ?? item.id, listingId: item.listingId, pricePaise: String(item.pricePaise ?? 0) },
      } as never);
    } else {
      // Merchants open their storefront — services are added to cart and booked there
      router.push({ pathname: '/(marketplace)/merchant/[id]', params: { id: item.id } } as never);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          {category?.label ?? 'Services'}
        </Text>
      </HStack>

      <FlatList
        data={providers}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] }}
        ListHeaderComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing[8] }} color={colors.brand[600]} /> : null}
        ListEmptyComponent={
          !loading ? (
            <VStack gap={3} align="center" style={{ marginTop: spacing[8], paddingHorizontal: spacing[6] }}>
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                {error ?? 'No service providers yet in this category.'}
              </Text>
              <Pressable onPress={load} accessibilityRole="button" style={styles.retryBtn}>
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>Retry</Text>
              </Pressable>
            </VStack>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openBooking(item)} accessibilityRole="button">
            <Card padding={4} elevation="sm">
              <HStack gap={3} align="center">
                <Avatar name={item.name} size="lg" />
                <VStack gap={1} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                    {item.name}
                  </Text>
                  {item.bio && <Text variant="caption" tone="secondary">{item.bio.slice(0, 60)}{item.bio.length > 60 ? '…' : ''}</Text>}
                  {item.rating != null && (
                  <HStack gap={1} align="center">
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text variant="caption" style={{ fontWeight: '700', color: colors.surface.heading }}>
                      {item.rating.toFixed(1)}
                    </Text>
                    {item.reviewCount != null && <Text variant="caption" tone="secondary">({item.reviewCount})</Text>}
                  </HStack>
                  )}
                  {item.priceLabel && (
                    <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                      {item.priceLabel}
                    </Text>
                  )}
                </VStack>
                <VStack gap={1} align="center">
                  {item.verified && (
                    <View style={styles.verifiedBadge}>
                      <CheckCircle size={14} color={colors.semantic.success} />
                    </View>
                  )}
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.brand[600] }}>Book →</Text>
                </VStack>
              </HStack>
            </Card>
          </Pressable>
        )}
      />
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
  verifiedBadge: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.semantic.success + '18',
  },
  retryBtn: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    borderRadius: 8, borderWidth: 1, borderColor: colors.brand[600],
  },
});

