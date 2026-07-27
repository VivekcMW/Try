import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Dog,
  Cat,
  Bird,
  Fish,
  Heart,
  MapPin,
  Star,
  Scissors,
  Stethoscope,
  Home,
  GraduationCap,
  ShoppingBag,
  Users,
  ChevronRight,
  PawPrint,
  AlertTriangle,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

/* ════════════════════════════════════════════════════════════════════════
   TYPES & MOCK DATA (pet SERVICES — providers/clinics — have no backend
   model yet; community pets, sitters, and lost-pet reports are real,
   API-backed data below)
   ═══════════════════════════════════════════════════════════════════════ */

type ServiceCategory = {
  id: string;
  name: string;
  icon: typeof Scissors;
  color: string;
};

type PetService = {
  id: string;
  name: string;
  category: string;
  providerName: string;
  providerFlat?: string;
  isNeighbor: boolean;
  description: string;
  price: string;
  rating: number;
  reviews: number;
  distance: string;
  available: boolean;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'grooming', name: 'Grooming', icon: Scissors, color: '#EC4899' },
  { id: 'vet', name: 'Vet Care', icon: Stethoscope, color: '#EF4444' },
  { id: 'boarding', name: 'Boarding', icon: Home, color: '#10B981' },
  { id: 'training', name: 'Training', icon: GraduationCap, color: '#8B5CF6' },
  { id: 'supplies', name: 'Supplies', icon: ShoppingBag, color: '#F59E0B' },
  { id: 'walking', name: 'Walking', icon: PawPrint, color: '#3B82F6' },
];

export const SERVICES: PetService[] = [
  {
    id: '1',
    name: 'Pawfect Grooming',
    category: 'grooming',
    providerName: 'Anita',
    providerFlat: 'B-302',
    isNeighbor: true,
    description: 'Full grooming service - bath, haircut, nail trim. All breeds welcome.',
    price: '₹500-1200',
    rating: 4.9,
    reviews: 45,
    distance: 'Same building',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Sharma Pet Clinic',
    category: 'vet',
    providerName: 'Dr. R. Sharma',
    isNeighbor: false,
    description: 'Full veterinary services, vaccination, surgery, emergency care.',
    price: '₹300 consultation',
    rating: 4.8,
    reviews: 156,
    distance: '0.5 km',
    available: true,
  },
  {
    id: '3',
    name: 'Happy Tails Training',
    category: 'training',
    providerName: 'Vikram',
    providerFlat: 'A-105',
    isNeighbor: true,
    description: 'Basic obedience, potty training, behavior correction for dogs.',
    price: '₹2000/month',
    rating: 4.7,
    reviews: 23,
    distance: 'Same building',
    available: true,
  },
];

/* ════════════════════════════════════════════════════════════════════════ */

type ApiPet = {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'other';
  breed: string;
  owner: { id: string; name: string };
};

type ApiSitter = {
  id: string;
  petTypes: string[];
  experience: string;
  pricePerDayPaise: number;
  ratingAvg: number | null;
  user: { id: string; name: string };
};

type ApiLostPet = {
  id: string;
  name: string;
  breed: string;
  lastSeenAt: string | null;
  createdAt: string;
};

const PET_TYPE_ICONS = {
  dog: Dog,
  cat: Cat,
  bird: Bird,
  fish: Fish,
  other: PawPrint,
};

function ServiceCard({ service, onPress }: { service: PetService; onPress: () => void }) {
  const category = SERVICE_CATEGORIES.find(c => c.id === service.category);
  const Icon = category?.icon || Scissors;

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.serviceCard}>
        <HStack gap={spacing.md}>
          <View style={[styles.serviceIcon, { backgroundColor: `${category?.color || colors.brand[600]}20` }]}>
            <Icon size={24} color={category?.color || colors.brand[600]} />
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack style={styles.serviceHeader}>
              <Text variant="body" style={{ fontWeight: '600' }}>{service.name}</Text>
              {service.isNeighbor && (
                <View style={styles.neighborBadge}>
                  <Text variant="caption" style={{ color: colors.success }}>Neighbor</Text>
                </View>
              )}
            </HStack>
            <Text variant="caption" tone="secondary">{service.providerName}</Text>
            <Text variant="caption" tone="secondary" numberOfLines={1}>{service.description}</Text>
            <HStack gap={spacing.md} style={styles.serviceMeta}>
              <HStack gap={spacing.xs}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text variant="caption" style={{ fontWeight: '500' }}>{service.rating}</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <MapPin size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{service.distance}</Text>
              </HStack>
              <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '500' }}>{service.price}</Text>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

function PetCard({ pet, onPress }: { pet: ApiPet; onPress: () => void }) {
  const Icon = PET_TYPE_ICONS[pet.type];

  return (
    <Pressable onPress={onPress} style={styles.petCard}>
      <View style={styles.petAvatar}>
        <Icon size={28} color={colors.brand[600]} />
      </View>
      <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>{pet.name}</Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>{pet.breed}</Text>
      <Text variant="caption" tone="secondary" numberOfLines={1}>{pet.owner.name}</Text>
    </Pressable>
  );
}

function SitterCard({ sitter, onPress }: { sitter: ApiSitter; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.sitterCard}>
        <HStack gap={spacing.md}>
          <View style={styles.sitterAvatar}>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '700' }}>
              {sitter.user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '600' }}>{sitter.user.name}</Text>
            <Text variant="caption" tone="secondary">{sitter.experience}</Text>
            <HStack gap={spacing.sm}>
              {sitter.petTypes.map(type => (
                <View key={type} style={styles.petTypeChip}>
                  <Text variant="caption">{type}</Text>
                </View>
              ))}
            </HStack>
          </VStack>
          <VStack style={{ alignItems: 'flex-end' }}>
            <HStack gap={spacing.xs}>
              <Star size={12} color={colors.warning} fill={colors.warning} />
              <Text variant="caption" style={{ fontWeight: '500' }}>{sitter.ratingAvg?.toFixed(1) ?? 'New'}</Text>
            </HStack>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '600' }}>
              ₹{Math.round(sitter.pricePerDayPaise / 100)}/day
            </Text>
          </VStack>
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function PetServicesScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [activeTab, setActiveTab] = useState<'services' | 'community' | 'sitters'>('services');
  const [communityPets, setCommunityPets] = useState<ApiPet[]>([]);
  const [sitters, setSitters] = useState<ApiSitter[]>([]);
  const [lostPets, setLostPets] = useState<ApiLostPet[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const [petsRes, sittersRes, lostRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/pets?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/pets/sitters?pinCode=${pinCode}`),
        fetch(`${BASE}/api/mobile/pets/lost?pinCode=${pinCode}`),
      ]);
      const [petsData, sittersData, lostData] = await Promise.all([petsRes.json(), sittersRes.json(), lostRes.json()]);
      setCommunityPets(petsData.pets ?? []);
      setSitters(sittersData.sitters ?? []);
      setLostPets((lostData.reports ?? []).filter((r: { found?: boolean }) => !r.found));
    } catch {
      setCommunityPets([]);
      setSitters([]);
      setLostPets([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Pet Services</Text>
          <Text variant="caption" tone="secondary">Care for your furry friends</Text>
        </VStack>
        <Pressable onPress={() => router.push('/(pets)/my-pets')}>
          <PawPrint size={20} color={colors.brand[600]} />
        </Pressable>
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'services' && styles.tabActive]}
          onPress={() => setActiveTab('services')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'services' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'services' ? '600' : '400',
            }}
          >
            Services
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'community' && styles.tabActive]}
          onPress={() => setActiveTab('community')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'community' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'community' ? '600' : '400',
            }}
          >
            Community
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'sitters' && styles.tabActive]}
          onPress={() => setActiveTab('sitters')}
        >
          <Text
            variant="body"
            style={{
              color: activeTab === 'sitters' ? colors.brand[600] : colors.textSecondary,
              fontWeight: activeTab === 'sitters' ? '600' : '400',
            }}
          >
            Pet Sitters
          </Text>
        </Pressable>
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'services' && (
          <>
            {/* Lost Pet Alert */}
            {lostPets.length > 0 && (
              <Card style={styles.lostPetAlert}>
                <HStack gap={spacing.md}>
                  <View style={styles.alertIcon}>
                    <AlertTriangle size={24} color={colors.danger} />
                  </View>
                  <VStack style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600' }}>Lost Pet Alert</Text>
                    <Text variant="caption" tone="secondary">
                      {lostPets[0].name} ({lostPets[0].breed})
                    </Text>
                  </VStack>
                  <Button label="Help" size="sm" variant="secondary" onPress={() => router.push('/(pets)/lost')} />
                </HStack>
              </Card>
            )}

            {/* Service Categories */}
            <View style={styles.categoriesGrid}>
              {SERVICE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Pressable
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => router.push(`/(pets)/category/${cat.id}`)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                      <Icon size={24} color={cat.color} />
                    </View>
                    <Text variant="caption" style={{ fontWeight: '500' }}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Services */}
            <VStack gap={spacing.md} style={styles.section}>
              <HStack style={styles.sectionHeader}>
                <Text variant="bodyLg" style={{ fontWeight: '600' }}>Nearby Services</Text>
                <Pressable>
                  <Text variant="caption" style={{ color: colors.brand[600] }}>View All</Text>
                </Pressable>
              </HStack>
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onPress={() => router.push(`/(pets)/service/${service.id}`)}
                />
              ))}
            </VStack>
          </>
        )}

        {activeTab === 'community' && (
          <VStack gap={spacing.md} style={styles.section}>
            <HStack style={styles.sectionHeader}>
              <Text variant="bodyLg" style={{ fontWeight: '600' }}>Pets in Your Building</Text>
              <Pressable onPress={() => router.push('/(pets)/add-pet')}>
                <Plus size={20} color={colors.brand[600]} />
              </Pressable>
            </HStack>

            <View style={styles.petsGrid}>
              {communityPets.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onPress={() => router.push(`/(pets)/pet/${pet.id}`)}
                />
              ))}
            </View>

            {/* Playdate Section */}
            <Card style={styles.playdateCard}>
              <HStack gap={spacing.md}>
                <View style={styles.playdateIcon}>
                  <Users size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>Pet Playdates</Text>
                  <Text variant="caption" tone="secondary">
                    Schedule playdates with neighborhood pets
                  </Text>
                </VStack>
                <Button label="Schedule" size="sm" variant="secondary" onPress={() => router.push('/(pets)/playdate')} />
              </HStack>
            </Card>
          </VStack>
        )}

        {activeTab === 'sitters' && (
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="bodyLg" style={{ fontWeight: '600' }}>Trusted Pet Sitters</Text>
            <Text variant="caption" tone="secondary">
              Verified neighbors who can care for your pet while you're away
            </Text>

            {sitters.map((sitter) => (
              <SitterCard
                key={sitter.id}
                sitter={sitter}
                onPress={() => router.push(`/(pets)/sitter/${sitter.id}`)}
              />
            ))}

            <Card style={styles.becomeSitterCard}>
              <VStack style={{ alignItems: 'center' }}>
                <Heart size={32} color={colors.brand[600]} />
                <Text variant="body" style={{ marginTop: spacing.sm, fontWeight: '600' }}>
                  Become a Pet Sitter
                </Text>
                <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                  Love pets? Earn by taking care of neighborhood pets.
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <Button
                    label="Register as Sitter"
                    variant="secondary"
                    onPress={() => router.push('/(pets)/become-sitter')}
                  />
                </View>
              </VStack>
            </Card>
          </VStack>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
      )}
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
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lostPetAlert: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#FEE2E2',
    borderColor: colors.danger,
    borderWidth: 1,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryCard: {
    width: '31%',
    alignItems: 'center',
    padding: spacing.md,
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
  serviceCard: {
    padding: spacing.md,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceHeader: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  neighborBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  serviceMeta: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  petCard: {
    width: '23%',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
  },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  playdateCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  playdateIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sitterCard: {
    padding: spacing.md,
  },
  sitterAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  petTypeChip: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  becomeSitterCard: {
    padding: spacing[6],
    marginTop: spacing.md,
  },
  bottomPadding: { height: 100 },
});
