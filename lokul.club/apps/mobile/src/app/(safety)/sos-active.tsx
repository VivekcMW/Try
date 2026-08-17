import { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AlertTriangle, Phone, ShieldCheck, Users, X } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { reportCurrentLocation } from '@/lib/locationTracker';
import { colors, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function SosActiveScreen() {
  return (
    <FeatureGate featureKey="sos_alerts">
      <SosActiveScreenInner />
    </FeatureGate>
  );
}

function SosActiveScreenInner() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const pinCode  = useOnboardingStore((s) => s.pin);
  const [countdown,   setCountdown]   = useState(3);
  const [sosActive,   setSosActive]   = useState(false);
  const [incidentId,  setIncidentId]  = useState<string | null>(null);
  const [responders,  setResponders]  = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  // Countdown then fire SOS via real API
  useEffect(() => {
    if (countdown <= 0) {
      setSosActive(true);
      if (userId && pinCode) {
        // Get fresh GPS fix first, then fire SOS with coordinates
        reportCurrentLocation(userId)
          .then((coords) =>
            fetch(`${BASE}/api/mobile/sos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                authorId: userId, pinCode,
                category: 'other', severity: 'high',
                body: 'SOS activated — emergency assistance needed',
                lat: coords?.lat ?? null,
                lng: coords?.lon ?? null,
              }),
            }),
          )
          .then((r) => r.json())
          .then((d) => { if (d.id) setIncidentId(d.id); })
          .catch(() => {});
      }
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Poll real responder count every 10s
  useEffect(() => {
    if (!sosActive || !incidentId) return;
    const poll = () => {
      fetch(`${BASE}/api/mobile/sos/${incidentId}`)
        .then((r) => r.json())
        .then((d) => setResponders(d.responders?.length ?? 0))
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, [sosActive, incidentId]);

  // Pulse animation
  useEffect(() => {
    if (!sosActive) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [sosActive, pulse]);

  if (!sosActive) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.semantic.danger }]} edges={['top', 'bottom']}>
        <VStack gap={6} align="center" style={styles.center}>
          <Text style={{ color: '#fff', fontSize: 80, fontWeight: '900' }}>{countdown}</Text>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center' }}>
            SOS will broadcast in…
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' }}>
            Tap cancel to abort
          </Text>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <X size={20} color={colors.semantic.danger} />
            <Text style={{ color: colors.semantic.danger, fontWeight: '700', fontSize: 16 }}>
              Cancel
            </Text>
          </Pressable>
        </VStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#7F1D1D' }]} edges={['top', 'bottom']}>
      <VStack gap={0} style={styles.center}>
        {/* Pulsing circle */}
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]}>
          <View style={styles.sosCircle}>
            <AlertTriangle size={40} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18, marginTop: 4 }}>
              SOS ACTIVE
            </Text>
          </View>
        </Animated.View>

        <Text style={styles.statusText}>Broadcasting your location…</Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: spacing[6] }}>
          Kumar Sienna · 500m radius
        </Text>

        {/* Responders */}
        {responders > 0 && (
          <View style={styles.respondersCard}>
            <HStack gap={2} align="center">
              <Users size={18} color={colors.semantic.success} />
              <Text style={{ color: colors.surface.heading, fontWeight: '700', fontSize: 15 }}>
                {responders} neighbor{responders > 1 ? 's' : ''} on the way
              </Text>
            </HStack>
            {responders >= 1 && (
              <Text style={{ color: colors.surface.textSecondary, fontSize: 13, marginTop: 4 }}>
                Priya Sharma — arriving in ~3 min
              </Text>
            )}
            {responders >= 2 && (
              <Text style={{ color: colors.surface.textSecondary, fontSize: 13 }}>
                Rohan Mehta — arriving in ~5 min
              </Text>
            )}
            {responders >= 3 && (
              <Text style={{ color: colors.surface.textSecondary, fontSize: 13 }}>
                Vikram Joshi — arriving in ~8 min
              </Text>
            )}
          </View>
        )}

        {/* Emergency call */}
        <Pressable
          onPress={() => Linking.openURL('tel:112')}
          style={styles.callBtn}
          accessibilityRole="button"
          accessibilityLabel="Call emergency number 112"
        >
          <Phone size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
            Call 112
          </Text>
        </Pressable>

        {/* I'm safe */}
        <Pressable onPress={() => router.back()} style={styles.safeBtn} accessibilityRole="button">
          <ShieldCheck size={20} color={colors.semantic.success} />
          <Text style={{ color: colors.semantic.success, fontWeight: '700', fontSize: 16 }}>
            I'm safe — Cancel SOS
          </Text>
        </Pressable>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing[6] },
  pulseRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  sosCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.semantic.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  respondersCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: spacing[4],
    width: '100%',
    marginBottom: spacing[5],
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.semantic.danger,
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: 50,
    marginBottom: spacing[3],
    width: '100%',
    justifyContent: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: '#fff',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    borderRadius: 50,
  },
  safeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 50,
    width: '100%',
    justifyContent: 'center',
  },
});
