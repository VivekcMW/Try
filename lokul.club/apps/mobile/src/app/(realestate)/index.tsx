import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MapPin,
  Building,
  Home,
  BedDouble,
  Maximize,
  Heart,
  Phone,
  MessageCircle,
  Star,
  ChevronRight,
  BadgeCheck,
  Users,
  IndianRupee,
  Key,
} from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing, radius } from '@lokul/ui-tokens';
import { useOnboardingStore } from '@/store/onboardingStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export type PropertyDealType = 'sale' | 'rent' | 'pg';

export const PROPERTY_TYPES = [
  { id: 'sale', label: 'Buy', icon: Key },
  { id: 'rent', label: 'Rent', icon: Home },
  { id: 'pg', label: 'PG', icon: Users },
];

export function formatPrice(pricePaise: number, type: PropertyDealType): string {
  const price = Math.round(pricePaise / 100);
  if (type === 'rent' || type === 'pg') {
    return `₹${price.toLocaleString()}`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString()}`;
}

type ApiProperty = {
  id: string;
  title: string;
  dealType: PropertyDealType;
  buildingType: 'apartment' | 'house' | 'villa' | 'plot' | 'pg';
  bhk: string | null;
  areaSqft: number;
  pricePaise: number;
  priceUnit: string | null;
  location: string;
  furnishing: string | null;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  owner: { id: string; name: string; kycTier: string };
};

type ApiAgent = {
  id: string;
  specialization: string[];
  experience: string;
  ratingAvg: number | null;
  ratingCount: number;
  verified: boolean;
  user: { id: string; name: string; _count: { propertyListings: number } };
};

function PropertyCard({ property, onPress }: { property: ApiProperty; onPress: () => void }) {
  const [liked, setLiked] = useState(false);

  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.propertyCard, property.featured && styles.propertyCardFeatured]}>
        <View style={styles.propertyImageContainer}>
          <View style={styles.propertyImage}>
            {property.buildingType === 'apartment' ? (
              <Building size={40} color={colors.textSecondary} />
            ) : property.buildingType === 'villa' ? (
              <Home size={40} color={colors.textSecondary} />
            ) : (
              <BedDouble size={40} color={colors.textSecondary} />
            )}
          </View>
          <Pressable
            style={styles.heartButton}
            onPress={(e) => { e.stopPropagation(); setLiked(!liked); }}
          >
            <Heart
              size={20}
              color={liked ? colors.danger : colors.background}
              fill={liked ? colors.danger : 'transparent'}
            />
          </Pressable>
          {property.featured && (
            <View style={styles.featuredBadge}>
              <Star size={10} color={colors.background} fill={colors.background} />
              <Text variant="caption" style={{ color: colors.background, fontSize: 10 }}>Featured</Text>
            </View>
          )}
        </View>

        <VStack gap={spacing.sm} style={styles.propertyContent}>
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3" style={{ color: colors.brand[600], fontWeight: '700' }}>
              {formatPrice(property.pricePaise, property.dealType)}
              {property.priceUnit && (
                <Text variant="caption" tone="secondary">{property.priceUnit}</Text>
              )}
            </Text>
            <View style={[
              styles.typeBadge,
              { backgroundColor: property.dealType === 'sale' ? '#DBEAFE' : property.dealType === 'rent' ? '#D1FAE5' : '#FEF3C7' }
            ]}>
              <Text
                variant="caption"
                style={{
                  color: property.dealType === 'sale' ? colors.info : property.dealType === 'rent' ? colors.success : colors.warning,
                  fontWeight: '500'
                }}
              >
                For {property.dealType === 'pg' ? 'PG' : property.dealType.charAt(0).toUpperCase() + property.dealType.slice(1)}
              </Text>
            </View>
          </HStack>

          <Text variant="body" style={{ fontWeight: '600' }} numberOfLines={1}>{property.title}</Text>

          <HStack gap={spacing.md} style={{ flexWrap: 'wrap' }}>
            {property.bhk && (
              <HStack gap={spacing.xs}>
                <BedDouble size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{property.bhk}</Text>
              </HStack>
            )}
            <HStack gap={spacing.xs}>
              <Maximize size={14} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{property.areaSqft} sq.ft</Text>
            </HStack>
            {property.furnishing && (
              <HStack gap={spacing.xs}>
                <Home size={14} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{property.furnishing}</Text>
              </HStack>
            )}
          </HStack>

          <HStack gap={spacing.xs}>
            <MapPin size={14} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[600] }}>{property.location}</Text>
          </HStack>

          <View style={styles.divider} />
          <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <HStack gap={spacing.sm}>
              <View style={styles.posterAvatar}>
                <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '700' }}>
                  {property.owner.name.charAt(0)}
                </Text>
              </View>
              <VStack>
                <HStack gap={spacing.xs}>
                  <Text variant="caption" style={{ fontWeight: '500' }}>{property.owner.name}</Text>
                  {property.verified && <BadgeCheck size={12} color={colors.success} />}
                </HStack>
              </VStack>
            </HStack>
            <HStack gap={spacing.sm}>
              <Pressable style={styles.contactBtn}>
                <Phone size={16} color={colors.brand[600]} />
              </Pressable>
              <Pressable style={styles.contactBtn}>
                <MessageCircle size={16} color={colors.brand[600]} />
              </Pressable>
            </HStack>
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
}

function AgentCard({ agent, onPress }: { agent: ApiAgent; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.agentCard}>
        <HStack gap={spacing.md}>
          <View style={styles.agentAvatar}>
            <Text variant="body" style={{ color: colors.brand[600], fontWeight: '700' }}>
              {agent.user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <VStack style={{ flex: 1 }}>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Text variant="body" style={{ fontWeight: '600' }}>{agent.user.name}</Text>
              {agent.verified && <BadgeCheck size={14} color={colors.success} />}
            </HStack>
            <Text variant="caption" tone="secondary">{agent.experience}</Text>
            <HStack gap={spacing.md} style={{ marginTop: spacing.xs }}>
              <HStack gap={spacing.xs}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text variant="caption">{agent.ratingAvg?.toFixed(1) ?? 'New'} ({agent.ratingCount})</Text>
              </HStack>
              <HStack gap={spacing.xs}>
                <Building size={12} color={colors.textSecondary} />
                <Text variant="caption" tone="secondary">{agent.user._count.propertyListings} listings</Text>
              </HStack>
            </HStack>
          </VStack>
          <ChevronRight size={20} color={colors.textSecondary} />
        </HStack>
      </Card>
    </Pressable>
  );
}

export default function RealEstateScreen() {
  const router = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const [activeType, setActiveType] = useState<PropertyDealType>('sale');
  const [activeTab, setActiveTab] = useState<'listings' | 'agents'>('listings');
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!pinCode) { setLoading(false); return; }
    setLoading(true);
    try {
      const [propsRes, agentsRes] = await Promise.all([
        fetch(`${BASE}/api/mobile/realestate/properties?pinCode=${pinCode}&dealType=${activeType}`),
        fetch(`${BASE}/api/mobile/realestate/agents?pinCode=${pinCode}`),
      ]);
      const [propsData, agentsData] = await Promise.all([propsRes.json(), agentsRes.json()]);
      setProperties(propsData.properties ?? []);
      setAgents(agentsData.agents ?? []);
    } catch {
      setProperties([]);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [pinCode, activeType]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <HStack style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={24} color={colors.foreground} />
        </Pressable>
        <VStack style={styles.headerTitle}>
          <Text variant="h3" style={{ fontWeight: '700' }}>Real Estate</Text>
          <Text variant="caption" tone="secondary">Properties in your locality</Text>
        </VStack>
        <HStack gap={spacing.md}>
          <Pressable onPress={() => router.push('/(realestate)/search')}>
            <Search size={22} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push('/(realestate)/post')}>
            <Plus size={24} color={colors.brand[600]} />
          </Pressable>
        </HStack>
      </HStack>

      {/* Property Type Selector */}
      <HStack style={styles.typeSelector}>
        {PROPERTY_TYPES.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.id;
          return (
            <Pressable
              key={type.id}
              style={[styles.typeBtn, isActive && styles.typeBtnActive]}
              onPress={() => setActiveType(type.id as PropertyDealType)}
            >
              <Icon size={18} color={isActive ? colors.background : colors.brand[600]} />
              <Text
                variant="body"
                style={{ color: isActive ? colors.background : colors.brand[600], fontWeight: isActive ? '600' : '400' }}
              >
                {type.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {/* Tabs */}
      <HStack style={styles.tabs}>
        {(['listings', 'agents'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              variant="body"
              style={{ color: activeTab === tab ? colors.brand[600] : colors.textSecondary, fontWeight: activeTab === tab ? '600' : '400' }}
            >
              {tab === 'listings' ? 'Properties' : 'Local Agents'}
            </Text>
          </Pressable>
        ))}
      </HStack>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      ) : (
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'listings' && (
          <VStack gap={spacing.md} style={styles.section}>
            {/* Filter Bar */}
            <HStack style={styles.filterBar}>
              <Pressable style={styles.filterBtn}>
                <Filter size={14} color={colors.textSecondary} />
                <Text variant="caption">Filters</Text>
              </Pressable>
              <Pressable style={styles.filterBtn}>
                <IndianRupee size={14} color={colors.textSecondary} />
                <Text variant="caption">Price</Text>
              </Pressable>
              <Pressable style={styles.filterBtn}>
                <BedDouble size={14} color={colors.textSecondary} />
                <Text variant="caption">BHK</Text>
              </Pressable>
              <Pressable style={styles.filterBtn}>
                <BadgeCheck size={14} color={colors.textSecondary} />
                <Text variant="caption">Verified</Text>
              </Pressable>
            </HStack>

            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onPress={() => router.push(`/(realestate)/property/${property.id}`)}
              />
            ))}

            {properties.length === 0 && (
              <Card style={styles.emptyCard}>
                <VStack style={{ alignItems: 'center' }}>
                  <Building size={48} color={colors.textSecondary} />
                  <Text variant="body" style={{ marginTop: spacing.md, fontWeight: '500' }}>
                    No properties found
                  </Text>
                  <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
                    Check back later or adjust your filters
                  </Text>
                </VStack>
              </Card>
            )}
          </VStack>
        )}

        {activeTab === 'agents' && (
          <VStack gap={spacing.md} style={styles.section}>
            <Text variant="body" tone="secondary">
              Connect with real estate agents from your neighborhood
            </Text>

            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onPress={() => router.push(`/(realestate)/agent/${agent.id}`)}
              />
            ))}

            <Card style={styles.becomeAgentCard}>
              <HStack gap={spacing.md}>
                <View style={styles.agentIcon}>
                  <Key size={24} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '600' }}>List Your Property</Text>
                  <Text variant="caption" tone="secondary">
                    Reach thousands of potential buyers & tenants
                  </Text>
                </VStack>
                <Button
                  label="Post"
                  size="sm"
                  onPress={() => router.push('/(realestate)/post')}
                />
              </HStack>
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
  typeSelector: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
  },
  typeBtnActive: {
    backgroundColor: colors.brand[600],
  },
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
    paddingTop: spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  propertyCard: {
    padding: 0,
    overflow: 'hidden',
  },
  propertyCardFeatured: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  propertyImageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  propertyContent: {
    padding: spacing.md,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  posterAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentCard: {
    padding: spacing.md,
  },
  agentAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  becomeAgentCard: {
    padding: spacing.md,
    backgroundColor: colors.brand[50],
    marginTop: spacing.md,
  },
  agentIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: spacing[6],
    alignItems: 'center',
  },
  bottomPadding: { height: 100 },
});
