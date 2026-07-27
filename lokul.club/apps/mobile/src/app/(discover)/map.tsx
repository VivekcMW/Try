// PRD §09 — Lokul Discover Map — Google Maps integration
// Falls back to stylised canvas when EXPO_PUBLIC_GOOGLE_MAPS_KEY is not set.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Car, Filter, Locate, MapPin } from 'lucide-react-native';
import { Badge, Button, Card, HStack, RadiusSelector, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useRadiusStore, RADIUS_METERS } from '@/store/radiusStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

// Dynamic import to avoid crashing when react-native-maps is not installed
let MapViewComp: React.ComponentType<any> | null = null;
let MarkerComp: React.ComponentType<any> | null = null;
let CircleComp: React.ComponentType<any> | null = null;
try {
  const maps = require('react-native-maps');
  MapViewComp = maps.default;
  MarkerComp  = maps.Marker;
  CircleComp  = maps.Circle;
} catch { /* react-native-maps not installed — use canvas fallback */ }

type LayerKey = 'biz' | 'gb' | 'carpool' | 'sos';
interface MapPin {
  id: string; layer: LayerKey; label: string; emoji: string; tint: string;
  lat: number; lng: number; meta?: string;
}
const DEFAULT_COORDS = { latitude: 18.5204, longitude: 73.8567 };

export default function MapScreen() {
  const router  = useRouter();
  const pinCode = useOnboardingStore((s) => s.pin);
  const { active: r } = useRadiusStore();
  const radiusM = RADIUS_METERS[r];
  const mapRef  = useRef<any>(null);

  const [layers,     setLayers]     = useState<Record<LayerKey, boolean>>({ biz: true, gb: true, carpool: true, sos: true });
  const [selected,   setSelected]   = useState<MapPin | null>(null);
  const [userCoords, setUserCoords] = useState(DEFAULT_COORDS);
  const [apiData, setApiData] = useState<{ merchants: any[]; groupBuys: any[]; carpools: any[]; incidents: any[] }>({
    merchants: [], groupBuys: [], carpools: [], incidents: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const ExpoLocation = require('expo-location');
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await ExpoLocation.getCurrentPositionAsync({});
          setUserCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch { /* noop */ }
    })();
  }, []);

  const loadMap = useCallback(async () => {
    if (!pinCode) return;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const safeFetch = (url: string, fallback: any) =>
        fetch(url, { signal: ctrl.signal })
          .then((x) => (x.ok ? x.json() : fallback))
          .catch(() => fallback);
      const [mapRes, carpoolRes, sosRes] = await Promise.all([
        safeFetch(`${BASE}/api/mobile/map?pinCode=${pinCode}`, {}),
        safeFetch(`${BASE}/api/mobile/carpool?pinCode=${pinCode}&lat=${userCoords.latitude}&lng=${userCoords.longitude}&radiusKm=${radiusM / 1000}`, { items: [] }),
        safeFetch(`${BASE}/api/mobile/sos?pinCode=${pinCode}&status=open`, { items: [] }),
      ]);
      setApiData({
        merchants: Array.isArray(mapRes?.merchants) ? mapRes.merchants : [],
        groupBuys: Array.isArray(mapRes?.groupBuys) ? mapRes.groupBuys : [],
        carpools: Array.isArray(carpoolRes?.items) ? carpoolRes.items : [],
        incidents: Array.isArray(sosRes?.items) ? sosRes.items : [],
      });
    } catch {
      /* aborted or network error — leave existing data */
    } finally {
      clearTimeout(to);
    }
  }, [pinCode, userCoords, radiusM]);

  useEffect(() => { loadMap(); }, [loadMap]);

  const pins = useMemo<MapPin[]>(() => {
    const all: MapPin[] = [];
    if (layers.biz)     apiData.merchants.forEach((b: any) => { if (b.lat && b.lng) all.push({ id: `b_${b.id}`,   layer: 'biz',     label: b.name,        emoji: '🏪', tint: '#0891B2', lat: b.lat,       lng: b.lng,      meta: b.category }); });
    if (layers.gb)      apiData.groupBuys.forEach((g: any) => { if (g.lat && g.lng) all.push({ id: `g_${g.id}`,   layer: 'gb',      label: g.title,       emoji: '🛒', tint: '#16A34A', lat: g.lat,       lng: g.lng,      meta: `${g.commitCount ?? 0} joined` }); });
    if (layers.carpool) apiData.carpools.forEach((t: any)  => { if (t.fromLat && t.fromLng) all.push({ id: `c_${t.id}`, layer: 'carpool', label: t.fromLabel, emoji: '🚗', tint: '#9333EA', lat: t.fromLat, lng: t.fromLng, meta: `→ ${t.toLabel}` }); });
    if (layers.sos)     apiData.incidents.forEach((i: any) => { if (i.lat && i.lng) all.push({ id: `s_${i.id}`,   layer: 'sos',     label: i.category,    emoji: '🚨', tint: '#DC2626', lat: i.lat,       lng: i.lng,      meta: i.severity }); });
    return all;
  }, [layers, apiData]);

  const handleLocate = () => {
    mapRef.current?.animateToRegion({ ...userCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
  };

  const handleFilter = () => {
    Alert.alert('Filter map', 'Choose what to show on the map', [
      { text: 'All layers', onPress: () => setLayers({ biz: true, gb: true, carpool: true, sos: true }) },
      { text: 'Shops only', onPress: () => setLayers({ biz: true, gb: false, carpool: false, sos: false }) },
      { text: 'Group buys only', onPress: () => setLayers({ biz: false, gb: true, carpool: false, sos: false }) },
      { text: 'Carpools only', onPress: () => setLayers({ biz: false, gb: false, carpool: true, sos: false }) },
      { text: 'SOS only', onPress: () => setLayers({ biz: false, gb: false, carpool: false, sos: true }) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}><ArrowLeft size={20} color={colors.surface.heading} /></Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Discover Map</Text>
        <Pressable onPress={handleFilter} hitSlop={10} style={styles.iconBtn}><Filter size={20} color={colors.surface.heading} /></Pressable>
      </View>

      <View style={styles.mapContainer}>
        {MapViewComp ? (
          <MapViewComp ref={mapRef} style={StyleSheet.absoluteFill}
            initialRegion={{ ...userCoords, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
            showsUserLocation showsMyLocationButton={false}
            {...(Platform.OS === 'android' && MAPS_KEY ? { googleMapsApiKey: MAPS_KEY } : {})}
          >
            {CircleComp && (
              <CircleComp center={userCoords} radius={radiusM}
                strokeColor={colors.brand[400] + '88'} fillColor={colors.brand[50] + '44'} strokeWidth={1.5} />
            )}
            {pins.map((p) => MarkerComp ? (
              <MarkerComp key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.label} description={p.meta} onPress={() => setSelected(p)} pinColor={p.tint} />
            ) : null)}
          </MapViewComp>
        ) : (
          <CanvasFallback pins={pins} userCoords={userCoords} onPinPress={setSelected} />
        )}
        <View style={styles.legend}>
          <HStack gap={2} style={{ flexWrap: 'wrap' }}>
            <LegendChip label="Shops" tint="#0891B2" active={layers.biz} onPress={() => setLayers((s) => ({ ...s, biz: !s.biz }))} />
            <LegendChip label="Group buys" tint="#16A34A" active={layers.gb} onPress={() => setLayers((s) => ({ ...s, gb: !s.gb }))} />
            <LegendChip label="Carpools" tint="#9333EA" active={layers.carpool} onPress={() => setLayers((s) => ({ ...s, carpool: !s.carpool }))} />
            <LegendChip label="SOS" tint="#DC2626" active={layers.sos} onPress={() => setLayers((s) => ({ ...s, sos: !s.sos }))} />
          </HStack>
        </View>
        <Pressable onPress={handleLocate} style={styles.fab} accessibilityRole="button">
          <Locate size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.bottom} keyboardShouldPersistTaps="handled">
        <Card padding={3.5} elevation="none" bordered>
          <HStack gap={2} align="center" style={{ justifyContent: 'space-between', marginBottom: spacing[2] }}>
            <Text variant="caption" style={{ fontWeight: '700', letterSpacing: 0.6, color: colors.surface.textSecondary }}>RADIUS</Text>
            <Text variant="caption" tone="secondary">{pins.length} places visible</Text>
          </HStack>
          <RadiusSelector compact />
        </Card>
        {selected ? (
          <Card padding={4} elevation="sm" bordered style={{ marginTop: spacing[3], borderColor: selected.tint, borderWidth: 1 }}>
            <HStack gap={3} align="center">
              <View style={[styles.dotLg, { backgroundColor: selected.tint }]}><Text style={{ fontSize: 22 }}>{selected.emoji}</Text></View>
              <VStack gap={0.5} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '800' }} numberOfLines={1}>{selected.label}</Text>
                <Text variant="caption" tone="secondary">{selected.meta}</Text>
              </VStack>
              <Badge label={selected.layer} tone="neutral" />
            </HStack>
          </Card>
        ) : (
          <HStack gap={2} align="center" style={{ marginTop: spacing[3], justifyContent: 'center' }}>
            <MapPin size={14} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">Tap a pin to see details</Text>
          </HStack>
        )}
        <View style={{ marginTop: spacing[4] }}>
          <Button label="Open Carpool" leftIcon={<Car size={16} color="#fff" />} onPress={() => router.push('/(discover)/carpool' as never)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CanvasFallback({ pins, userCoords, onPinPress }: { pins: MapPin[]; userCoords: any; onPinPress: (p: MapPin) => void }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' }]}>
      <View style={styles.userPin}><View style={styles.userInner} /></View>
      <View style={styles.radiusRing} />
      {pins.slice(0, 8).map((p, i) => (
        <Pressable key={p.id} onPress={() => onPinPress(p)}
          style={[styles.canvasPin, { left: 40 + (i % 4) * 70, top: 30 + Math.floor(i / 4) * 80, backgroundColor: p.tint }]}>
          <Text style={{ fontSize: 16 }}>{p.emoji}</Text>
        </Pressable>
      ))}
      <Text style={{ position: 'absolute', bottom: 8, color: '#1E40AF66', fontSize: 11 }}>Set EXPO_PUBLIC_GOOGLE_MAPS_KEY to enable real map</Text>
    </View>
  );
}

function LegendChip({ label, tint, active, onPress }: { readonly label: string; readonly tint: string; readonly active: boolean; readonly onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.legendChip, active && { backgroundColor: tint + '22', borderColor: tint }]}>
      <View style={[styles.legendDot, { backgroundColor: active ? tint : colors.gray[300] }]} />
      <Text variant="caption" style={{ fontWeight: '700', color: active ? tint : colors.surface.textSecondary }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border },
  iconBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  mapContainer: { flex: 1, minHeight: 300 },
  legend:       { position: 'absolute', top: 10, left: 10, right: 10, padding: spacing[2], backgroundColor: '#FFFFFFEE', borderRadius: radius.md },
  legendChip:   { flexDirection: 'row', alignItems: 'center', gap: spacing[1.5], paddingHorizontal: spacing[2.5], paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.surface.border, backgroundColor: '#FFFFFF' },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  fab:          { position: 'absolute', bottom: 12, right: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand[700], alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 4 },
  bottom:       { padding: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[10] },
  dotLg:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userPin:      { position: 'absolute', top: 156, width: 20, height: 20, borderRadius: 10, backgroundColor: '#1D4ED8', borderWidth: 3, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  userInner:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  radiusRing:   { position: 'absolute', top: 56, width: 220, height: 220, borderRadius: 110, borderWidth: 2, borderColor: '#1D4ED855', backgroundColor: '#3B82F622' },
  canvasPin:    { position: 'absolute', width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, elevation: 3, zIndex: 4 },
});
