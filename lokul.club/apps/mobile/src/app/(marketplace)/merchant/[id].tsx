import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle, Clock, MapPin, Package, Search, ShoppingCart, Star } from 'lucide-react-native';
import { Avatar, Badge, Button, Card, HStack, Text, VStack } from '@/components/ui';
import { AdSlot } from '@/components/AdSlot';
import { useWalletStore } from '@/store/walletStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useCartStore } from '@/store/cartStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type ApiMerchant = {
  id: string; name: string; bio?: string; rating?: number; reviewCount?: number;
  priceLabel?: string; verified?: boolean; responseTime?: string;
  societiesServed?: string[]; category?: string;
  owner?: { id: string; name: string; avatarUrl?: string };
  ownerId?: string;
  acceptingOrders?: boolean;
  closedReason?: string;
  closedUntil?: string;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  estimatedDeliveryMins?: number;
};

type CatalogItem = {
  id: string; name: string; description?: string; pricePaise: number;
  unit?: string; imageUrl?: string; isAvailable: boolean; kind: string;
};

export default function MerchantProfileScreen() {
  const { id }  = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const addToCart = useCartStore((s) => s.addItem);
  const getItemQuantity = useCartStore((s) => s.getItemQuantity);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const [merchant, setMerchant] = useState<ApiMerchant | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [loading,  setLoading]  = useState(true);

  // Filter and sort catalog items
  const filteredItems = catalogItems
    .filter((item) => {
      if (!searchQuery) return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.pricePaise - b.pricePaise;
      return a.name.localeCompare(b.name);
    });

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch merchant details
      const res  = await fetch(`${BASE}/api/mobile/merchants/${id}`);
      const data = await res.json();
      setMerchant(data);
      
      // Fetch catalog items
      const catalogRes = await fetch(`${BASE}/api/mobile/merchants/${id}/catalog`);
      const catalogData = await catalogRes.json();
      setCatalogItems(catalogData.items || []);
    } catch { /* noop */ } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!merchant) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text variant="body" style={{ padding: spacing[6] }}>Provider not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Provider Profile</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing[16] }}>
        {/* Closed Alert */}
        {merchant.acceptingOrders === false && (
          <Card padding={3} style={{ margin: spacing[4], backgroundColor: '#FEF3C7', borderColor: '#F59E0B', borderWidth: 1 }}>
            <HStack gap={2} align="center">
              <AlertTriangle size={20} color="#D97706" />
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '600', color: '#92400E' }}>
                  Currently Not Accepting Orders
                </Text>
                {merchant.closedReason && (
                  <Text variant="caption" style={{ color: '#78350F' }}>
                    Reason: {merchant.closedReason}
                  </Text>
                )}
                {merchant.closedUntil && (
                  <Text variant="caption" style={{ color: '#78350F' }}>
                    Reopens: {new Date(merchant.closedUntil).toLocaleString()}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Card>
        )}

        {/* Hero */}
        <VStack gap={3} align="center" style={styles.hero}>
          <Avatar name={merchant.name} size="xl" />
          <Text variant="h3" style={{ color: colors.surface.heading, textAlign: 'center' }}>
            {merchant.name}
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            {merchant.priceLabel}
          </Text>
          <HStack gap={2} style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {merchant.verified && (
              <Badge label="Verified" tone="success"
                leftIcon={<CheckCircle size={11} color={colors.semantic.success} />} />
            )}
          </HStack>
        </VStack>

        {/* Stats row */}
        <Card padding={4} elevation="sm" style={styles.statsCard}>
          <HStack gap={0} style={{ justifyContent: 'space-around' }}>
            <VStack gap={0} align="center">
              <HStack gap={1} align="center">
                <Star size={14} color="#F59E0B" fill="#F59E0B" />
                <Text variant="h3" style={{ color: colors.surface.heading }}>{merchant.rating?.toFixed(1) ?? '—'}</Text>
              </HStack>
              <Text variant="caption" tone="secondary">Rating</Text>
            </VStack>
            <View style={styles.statDivider} />
            <VStack gap={0} align="center">
              <Text variant="h3" style={{ color: colors.surface.heading }}>{merchant.reviewCount ?? 0}</Text>
              <Text variant="caption" tone="secondary">Reviews</Text>
            </VStack>
          </HStack>
        </Card>

        {/* About */}
        <VStack gap={2} style={styles.section}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>About</Text>
          <Text variant="body" style={{ color: colors.surface.heading, lineHeight: 22 }}>
            {merchant.bio ?? `${merchant.name} is a trusted service provider in Kumar Sienna, verified by the community.`}
          </Text>
        </VStack>

        {/* In-feed ad */}
        <View style={{ marginHorizontal: spacing[4], marginTop: spacing[3] }}>
          <AdSlot placement="marketplace" pinCode={pinCode ?? undefined} />
        </View>

        {/* Details */}
        <VStack gap={2} style={styles.section}>
          <HStack gap={2} align="center">
              <Text variant="caption" tone="secondary" style={{ width: 100 }}>Starting at</Text>
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {merchant.priceLabel ?? 'Contact for price'}
              </Text>
            </HStack>
          {(merchant.businessHoursStart && merchant.businessHoursEnd) && (
            <HStack gap={2} align="center">
              <Clock size={14} color={colors.gray[400]} />
              <Text variant="caption" tone="secondary">
                {merchant.businessHoursStart} - {merchant.businessHoursEnd}
              </Text>
            </HStack>
          )}
          {merchant.estimatedDeliveryMins && (
            <HStack gap={2} align="center">
              <Clock size={14} color={colors.brand[600]} />
              <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
                Ready in ~{merchant.estimatedDeliveryMins} mins
              </Text>
            </HStack>
          )}
          {!!merchant.responseTime && (
            <HStack gap={2} align="center">
              <Clock size={14} color={colors.gray[400]} />
              <Text variant="caption" tone="secondary">Responds in {merchant.responseTime}</Text>
            </HStack>
          )}
          {merchant.societiesServed && merchant.societiesServed.length > 0 && (
            <HStack gap={2} align="center">
              <MapPin size={14} color={colors.gray[400]} />
              <Text variant="caption" tone="secondary">{merchant.societiesServed.join(', ')}</Text>
            </HStack>
          )}
        </VStack>

        {/* Catalog Items */}
        {catalogItems.length > 0 && (
          <VStack gap={3} style={styles.section}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Products & Services
            </Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={18} color={colors.gray[400]} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
                placeholderTextColor={colors.gray[400]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Sort Options */}
            <HStack gap={2}>
              <Pressable
                onPress={() => setSortBy('name')}
                style={[styles.sortChip, sortBy === 'name' && styles.sortChipActive]}
              >
                <Text variant="caption" style={{ color: sortBy === 'name' ? colors.brand[600] : colors.gray[600], fontWeight: sortBy === 'name' ? '600' : '400' }}>
                  Name
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSortBy('price')}
                style={[styles.sortChip, sortBy === 'price' && styles.sortChipActive]}
              >
                <Text variant="caption" style={{ color: sortBy === 'price' ? colors.brand[600] : colors.gray[600], fontWeight: sortBy === 'price' ? '600' : '400' }}>
                  Price
                </Text>
              </Pressable>
            </HStack>

            {filteredItems.map((item) => (
              <Card key={item.id} padding={3} elevation="sm">
                <HStack gap={3}>
                  <View style={styles.itemImage}>
                    <View style={styles.itemImagePlaceholder}>
                      <Package size={24} color={colors.gray[400]} />
                    </View>
                  </View>
                  <VStack gap={1} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '600', color: colors.surface.heading }}>
                      {item.name}
                    </Text>
                    {!!item.description && (
                      <Text variant="caption" tone="secondary" numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                    <HStack gap={2} align="center">
                      <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                        ₹{(item.pricePaise / 100).toFixed(2)}
                      </Text>
                      {item.unit && (
                        <Text variant="caption" tone="secondary">per {item.unit}</Text>
                      )}
                    </HStack>
                    {getItemQuantity(item.id) > 0 ? (
                      <HStack gap={2} align="center" style={{ marginTop: spacing[2] }}>
                        <Button
                          label="-"
                          size="sm"
                          variant="secondary"
                          onPress={() => {
                            const qty = getItemQuantity(item.id);
                            useCartStore.getState().updateQuantity(item.id, qty - 1);
                          }}
                          style={{ width: 40 }}
                          disabled={merchant.acceptingOrders === false}
                        />
                        <Text variant="body" style={{ fontWeight: '600', minWidth: 30, textAlign: 'center' }}>
                          {getItemQuantity(item.id)}
                        </Text>
                        <Button
                          label="+"
                          size="sm"
                          onPress={() => {
                            const qty = getItemQuantity(item.id);
                            useCartStore.getState().updateQuantity(item.id, qty + 1);
                          }}
                          style={{ width: 40 }}
                          disabled={merchant.acceptingOrders === false}
                        />
                      </HStack>
                    ) : (
                      <Button
                        label={merchant.acceptingOrders === false ? "Currently Closed" : "Add to Cart"}
                        size="sm"
                        leftIcon={merchant.acceptingOrders !== false ? <ShoppingCart size={14} color="white" /> : undefined}
                        onPress={() => {
                          addToCart({
                            id: item.id,
                            merchantId: merchant.id,
                            merchantName: merchant.name,
                            name: item.name,
                            pricePaise: item.pricePaise,
                            unit: item.unit,
                            imageUrl: item.imageUrl,
                            kind: item.kind,
                          });
                        }}
                        style={{ marginTop: spacing[2], alignSelf: 'flex-start' }}
                        disabled={!item.isAvailable || merchant.acceptingOrders === false}
                      />
                    )}
                  </VStack>
                </HStack>
              </Card>
            ))}
          </VStack>
        )}

        {/* CTA */}
        <View style={styles.section}>
          <VStack gap={3}>
            <Button
              label="Book Now"
              onPress={() => router.push(`/(marketplace)/book/${merchant.id}` as never)}
              fullWidth
            />
            <Button
              label="Message Provider"
              variant="secondary"
              onPress={async () => {
                if (!userId) return;
                const recipientId = merchant.owner?.id ?? merchant.ownerId;
                if (!recipientId) return;
                try {
                  const res = await fetch(`${BASE}/api/mobile/chat/threads`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, recipientId }),
                  });
                  const data = await res.json();
                  if (data.id) {
                    router.push(`/(chat)/thread/${data.id}` as never);
                  } else {
                    Alert.alert('Error', 'Could not start conversation — please try again.');
                  }
                } catch {
                  Alert.alert('Error', 'Could not start conversation — please try again.');
                }
              }}
              fullWidth
            />
          </VStack>
        </View>
      </ScrollView>
      
      {/* Floating Cart Button */}
      {getTotalItems() > 0 && (
        <Pressable
          onPress={() => router.push('/(marketplace)/cart' as never)}
          style={styles.floatingCart}
          accessibilityRole="button"
        >
          <ShoppingCart size={24} color="white" />
          <View style={styles.cartBadge}>
            <Text variant="caption" style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
              {getTotalItems()}
            </Text>
          </View>
        </Pressable>
      )}
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
  hero: {
    paddingVertical: spacing[6], paddingHorizontal: spacing[5],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  statsCard: { marginHorizontal: spacing[4], marginTop: spacing[4] },
  statDivider: { width: 0.5, height: '60%', backgroundColor: colors.surface.border, alignSelf: 'center' },
  section: { paddingHorizontal: spacing[5], paddingTop: spacing[4] },
  itemImage: { width: 80, height: 80, borderRadius: 8, overflow: 'hidden' },
  itemImagePlaceholder: {
    width: '100%', height: '100%', backgroundColor: colors.gray[100],
    alignItems: 'center', justifyContent: 'center',
  },
  floatingCart: {
    position: 'absolute', bottom: spacing[6], right: spacing[4],
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[600],
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.semantic.error,
    alignItems: 'center', justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.border,
    paddingHorizontal: spacing[3],
  },
  searchIcon: {
    marginRight: spacing[2],
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing[2],
    fontSize: 14,
    color: colors.surface.heading,
  },
  sortChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
});
