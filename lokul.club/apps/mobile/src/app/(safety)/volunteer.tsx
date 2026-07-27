/**
 * Volunteer Responder — Opt-in Screen
 * Route: /(safety)/volunteer
 *
 * Shows volunteer role description, skill tags, opt-in toggle.
 * Lists nearby verified volunteers in the locality.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Heart,
  MapPin,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore } from '@/store/safetyStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const SKILLS = [
  { key: 'cpr',         label: 'CPR' },
  { key: 'first_aid',   label: 'First Aid' },
  { key: 'doctor',      label: 'Doctor / Nurse' },
  { key: 'fire',        label: 'Firefighter' },
  { key: 'police',      label: 'Off-duty Police' },
  { key: 'counsellor',  label: 'Mental Health' },
  { key: 'driver',      label: 'Emergency Driver' },
  { key: 'translator',  label: 'Translator' },
];

type NearbyVolunteer = {
  id: string;
  name: string;
  skills: string[];
  distance: number;
  responseTime: number;
};

export default function VolunteerScreen() {
  const router      = useRouter();
  const userId      = useWalletStore((s) => s.userId);
  const pin         = useOnboardingStore((s) => s.pin ?? '411007');
  const isVolunteer = useSafetyStore((s) => s.isVolunteer);
  const setVolunteer = useSafetyStore((s) => s.setVolunteer);

  const [skills,    setSkills]    = useState<string[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [nearby,    setNearby]    = useState<NearbyVolunteer[]>([]);

  const toggleSkill = (key: string) => {
    setSkills((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const loadNearby = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE}/api/mobile/safety/volunteer?pinCode=${pin}`);
      const data = await res.json();
      setNearby(data.items ?? []);
    } catch { /* offline */ }
  }, [pin]);

  useEffect(() => { loadNearby(); }, [loadNearby]);

  const register = async () => {
    if (skills.length === 0) return;
    setLoading(true);
    try {
      await fetch(`${BASE}/api/mobile/safety/volunteer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pinCode: pin, skills }),
      });
    } catch { /* offline */ }
    setVolunteer(true);
    setLoading(false);
    setSaved(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <Text variant="body" style={{ fontWeight: '800', flex: 1, color: colors.surface.heading }}>Volunteer Responder</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.body}>
        {/* Hero */}
        <View style={styles.hero}>
          <ShieldCheck size={44} color={isVolunteer ? '#059669' : colors.brand[600]} />
          <Text style={styles.heroTitle}>
            {isVolunteer ? 'You are a Volunteer' : 'Become a First Responder'}
          </Text>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center', lineHeight: 22 }}>
            When a neighbour sends an SOS, verified first responders nearby are alerted first —
            before police arrive. Your identity is never shared without your consent.
          </Text>
        </View>

        {/* How it works */}
        <VStack gap={2} style={styles.card}>
          <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>How it works</Text>
          {[
            { Icon: Shield,     text: 'You get a discreet push notification when an SOS is nearby' },
            { Icon: MapPin,     text: 'You see the distance — you choose whether to respond' },
            { Icon: UserCheck,  text: 'Police + ambulance are notified simultaneously' },
            { Icon: Heart,      text: 'Your identity is hidden until you choose to reveal it' },
          ].map(({ Icon, text }) => (
            <HStack key={text} gap={3} align="start">
              <Icon size={16} color={colors.brand[600]} style={{ marginTop: 2 }} />
              <Text variant="caption" style={{ color: colors.surface.heading, flex: 1, lineHeight: 18 }}>{text}</Text>
            </HStack>
          ))}
        </VStack>

        {/* Opt-in form — only shown if not yet volunteer */}
        {!isVolunteer && !saved && (
          <VStack gap={3} style={styles.card}>
            <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>
              Your skills (select all that apply)
            </Text>
            <View style={styles.skillGrid}>
              {SKILLS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => toggleSkill(key)}
                  style={[styles.skillChip, skills.includes(key) && styles.skillChipActive]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: skills.includes(key) }}
                >
                  {skills.includes(key) && <Check size={12} color={colors.brand[600]} />}
                  <Text style={[styles.skillText, skills.includes(key) && styles.skillTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={register}
              style={[styles.joinBtn, (skills.length === 0 || loading) && { opacity: 0.4 }]}
              disabled={skills.length === 0 || loading}
              accessibilityRole="button"
            >
              <ShieldCheck size={18} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                {loading ? 'Registering…' : 'Register as Volunteer'}
              </Text>
            </Pressable>
          </VStack>
        )}

        {/* Registered banner */}
        {(isVolunteer || saved) && (
          <View style={styles.registeredBanner}>
            <ShieldCheck size={20} color="#059669" />
            <Text style={{ color: '#059669', fontWeight: '800', flex: 1 }}>
              You are registered as a first responder in {pin}
            </Text>
          </View>
        )}

        {/* Nearby volunteers */}
        {nearby.length > 0 && (
          <VStack gap={2}>
            <HStack gap={2} align="center">
              <Users size={14} color={colors.surface.textSecondary} />
              <Text variant="label" tone="secondary" style={styles.sectionLabel}>
                {nearby.length} volunteer{nearby.length === 1 ? '' : 's'} near {pin}
              </Text>
            </HStack>
            {nearby.map((v) => (
              <View key={v.id} style={styles.volunteerRow}>
                <HStack gap={3} align="center">
                  <View style={styles.volunteerAvatar}>
                    <ShieldCheck size={16} color="#059669" />
                  </View>
                  <VStack gap={0} style={{ flex: 1 }}>
                    <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{v.name}</Text>
                    <Text variant="caption" tone="secondary">{v.skills.join(', ')}</Text>
                  </VStack>
                  <VStack gap={0} align="end">
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669' }}>{v.distance} km</Text>
                    <Text variant="caption" tone="secondary">~{v.responseTime} min</Text>
                  </VStack>
                </HStack>
              </View>
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  body:   { padding: spacing[4], gap: spacing[4], paddingBottom: spacing[16] },

  hero:      { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[4] },
  heroTitle: { fontSize: 22, fontWeight: '900', color: colors.surface.heading, textAlign: 'center' },

  card:       { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[3] },
  sectionLabel:{ textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, fontWeight: '700', color: colors.surface.textSecondary },

  skillGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  skillChip:     { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, backgroundColor: colors.gray[100], borderWidth: 1.5, borderColor: 'transparent' },
  skillChipActive:{ backgroundColor: `${colors.brand[600]}10`, borderColor: colors.brand[600] },
  skillText:     { fontSize: 13, fontWeight: '600', color: colors.surface.textSecondary },
  skillTextActive:{ color: colors.brand[600] },

  joinBtn: { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center' },

  registeredBanner: { flexDirection: 'row', gap: spacing[3], alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: radius.xl, padding: spacing[4], borderWidth: 1, borderColor: '#A7F3D0' },

  volunteerRow:   { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },
  volunteerAvatar:{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center' },
});
