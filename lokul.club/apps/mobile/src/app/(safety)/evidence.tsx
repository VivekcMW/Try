/**
 * Silent Evidence / Fake Call Screen
 * Route: /(safety)/evidence
 *
 * When active: shows a fake incoming call UI while
 * recording silently in the background and auto-uploading chunks.
 *
 * NOTE: Actual camera/microphone access requires expo-camera + expo-av.
 * This implements the full UX flow with upload stub — swap the
 * startRecording / stopRecording stubs for real Camera API calls.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Video,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore } from '@/store/safetyStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type EvidenceMode = 'idle' | 'fake-call' | 'active' | 'done';

function CallTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return (
    <Text style={{ fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </Text>
  );
}

function RingAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);
  return (
    <Animated.View style={[styles.ring, { transform: [{ scale }] }]} />
  );
}

export default function EvidenceScreen() {
  const router = useRouter();
  const setEvidenceActive = useSafetyStore((s) => s.setEvidenceActive);

  const [mode,        setMode]        = useState<EvidenceMode>('idle');
  const [sessionId,   setSessionId]   = useState<string | null>(null);
  const [chunkIndex,  setChunkIndex]  = useState(0);
  const [micMuted,    setMicMuted]    = useState(false);
  const [uploading,   setUploading]   = useState(false);

  const uploadInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAnswerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef      = useRef<string | null>(null);

  // Component-level upload tick — avoids deep function nesting
  const tickUpload = useCallback(() => {
    const sid = sessionRef.current;
    if (!sid) return;
    setChunkIndex((prev) => {
      void uploadChunk(sid, prev);
      return prev;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadChunk = async (sid: string, idx: number) => {
    setUploading(true);
    try {
      await fetch(`${BASE}/api/mobile/safety/evidence/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          chunkIndex: idx,
          // In production: base64 video chunk from Camera.recordAsync()
          data: 'stub-chunk-data',
          lat: null, lng: null,
        }),
      });
    } catch { /* offline — queue for retry */ }
    setUploading(false);
    setChunkIndex((i) => i + 1);
  };

  const startEvidence = (callerName = 'Mom') => {
    const sid = 'ev-' + Date.now();
    sessionRef.current = sid;
    setSessionId(sid);
    setMode('fake-call');
    setEvidenceActive(true, sid);
    Vibration.vibrate([500, 500, 500]);
    // Auto-answer after 2 seconds to start recording
    autoAnswerTimeout.current = setTimeout(() => {
      setMode('active');
      uploadInterval.current = setInterval(tickUpload, 60_000);
    }, 2000);
  };

  const stopEvidence = () => {
    if (uploadInterval.current) clearInterval(uploadInterval.current);
    if (sessionId) uploadChunk(sessionId, chunkIndex); // final chunk
    setEvidenceActive(false);
    setMode('done');
  };

  // Decline the fake call — aborts before/at the point recording would start,
  // stops any pending auto-answer + upload ticking, and leaves the screen.
  const declineEvidence = () => {
    if (autoAnswerTimeout.current) { clearTimeout(autoAnswerTimeout.current); autoAnswerTimeout.current = null; }
    if (uploadInterval.current) { clearInterval(uploadInterval.current); uploadInterval.current = null; }
    sessionRef.current = null;
    setSessionId(null);
    setEvidenceActive(false);
    setMode('idle');
    router.back();
  };

  // Cleanup on unmount
  useEffect(() => () => {
    if (uploadInterval.current) clearInterval(uploadInterval.current);
    if (autoAnswerTimeout.current) clearTimeout(autoAnswerTimeout.current);
    setEvidenceActive(false);
  }, []);

  // Idle: pick mode
  if (mode === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <HStack gap={3} align="center" style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
            <ArrowLeft size={22} color={colors.surface.heading} />
          </Pressable>
          <Text variant="body" style={{ fontWeight: '800', flex: 1, color: colors.surface.heading }}>
            Silent Evidence
          </Text>
        </HStack>

        <VStack gap={4} style={styles.body}>
          <View style={styles.warningBox}>
            <Text variant="caption" style={{ color: '#7C3AED', lineHeight: 18 }}>
              When active, your screen shows a fake call while the camera and mic record silently.
              All footage is automatically uploaded to secure storage.
            </Text>
          </View>

          <Pressable
            onPress={() => startEvidence('Mom')}
            style={styles.bigBtn}
            accessibilityRole="button"
            accessibilityLabel="Start silent recording with fake call screen"
          >
            <PhoneCall size={28} color="#fff" />
            <VStack gap={0} align="center">
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Start Silent Recording</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Screen shows fake call · Mic + camera active</Text>
            </VStack>
          </Pressable>

          <VStack gap={2} style={styles.card}>
            <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>How it works</Text>
            {[
              'Screen shows a realistic incoming call',
              'Camera and mic record silently in background',
              'Video uploads to secure cloud every 60 seconds',
              'Files cannot be deleted from your device',
              'Tap "End call" to stop and access your vault',
            ].map((t) => (
              <HStack key={t} gap={2} align="center">
                <CheckCircle size={14} color="#059669" />
                <Text variant="caption" style={{ color: colors.surface.heading, flex: 1 }}>{t}</Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </SafeAreaView>
    );
  }

  // Fake call UI (decoy)
  if (mode === 'fake-call') {
    return (
      <SafeAreaView style={styles.fakeCallSafe} edges={['top', 'bottom']}>
        <RingAnimation />
        <VStack gap={3} align="center" style={styles.fakeCallBody}>
          <View style={styles.fakeAvatar}>
            <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff' }}>M</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff' }}>Mom</Text>
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>Incoming call…</Text>
        </VStack>
        <HStack gap={8} align="center" justify="center" style={{ paddingBottom: spacing[12] }}>
          <Pressable onPress={declineEvidence} style={[styles.callBtn, { backgroundColor: '#DC2626' }]} accessibilityRole="button" accessibilityLabel="Decline (stops recording)">
            <PhoneOff size={28} color="#fff" />
          </Pressable>
          <Pressable
            onPress={() => setMode('active')}
            style={[styles.callBtn, { backgroundColor: '#059669' }]}
            accessibilityRole="button"
            accessibilityLabel="Answer"
          >
            <PhoneCall size={28} color="#fff" />
          </Pressable>
        </HStack>
      </SafeAreaView>
    );
  }

  // Active recording with decoy call screen
  if (mode === 'active') {
    return (
      <SafeAreaView style={styles.fakeCallSafe} edges={['top', 'bottom']}>
        <VStack gap={2} align="center" style={styles.fakeCallBody}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>Mom</Text>
          <CallTimer />
          <HStack gap={2} align="center">
            <View style={[styles.dot, uploading && { backgroundColor: '#22c55e' }]} />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {uploading ? 'Uploading…' : 'Recording & uploading'}
            </Text>
          </HStack>
        </VStack>

        <HStack gap={6} align="center" justify="center" style={{ paddingBottom: spacing[8] }}>
          <Pressable
            onPress={() => setMicMuted((m) => !m)}
            style={styles.muteBtn}
            accessibilityRole="button"
            accessibilityLabel={micMuted ? 'Unmute' : 'Mute'}
          >
            {micMuted ? <MicOff size={22} color="#fff" /> : <Mic size={22} color="#fff" />}
          </Pressable>
          <Pressable
            onPress={stopEvidence}
            style={[styles.callBtn, { backgroundColor: '#DC2626' }]}
            accessibilityRole="button"
            accessibilityLabel="End call and stop recording"
          >
            <PhoneOff size={28} color="#fff" />
          </Pressable>
          <View style={styles.muteBtn}>
            <Video size={22} color="#fff" />
          </View>
        </HStack>
      </SafeAreaView>
    );
  }

  // Done
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <VStack gap={5} align="center" style={styles.doneBody}>
        <CheckCircle size={64} color="#059669" />
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.surface.heading, textAlign: 'center' }}>
          Recording saved
        </Text>
        <Text variant="body" tone="secondary" style={{ textAlign: 'center', lineHeight: 22 }}>
          {chunkIndex} segment{chunkIndex === 1 ? '' : 's'} uploaded to secure storage.
          {'\n'}Access your evidence vault from Settings.
        </Text>
        <Pressable onPress={() => router.back()} style={styles.doneBtn} accessibilityRole="button">
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Back to Safety Hub</Text>
        </Pressable>
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header:     { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:    { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  body:       { padding: spacing[5] },
  warningBox: { backgroundColor: '#F5F3FF', borderRadius: radius.lg, padding: spacing[4], borderWidth: 1, borderColor: '#DDD6FE' },
  card:       { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[2] },
  bigBtn:     { backgroundColor: '#7C3AED', borderRadius: radius.xl, paddingVertical: spacing[5], alignItems: 'center', gap: spacing[3] },

  // Fake call
  fakeCallSafe:{ flex: 1, backgroundColor: '#1C1C1E' },
  fakeCallBody:{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  fakeAvatar:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#3A3A3C', alignItems: 'center', justifyContent: 'center' },
  ring:        { position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', top: '25%' },
  callBtn:     { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  muteBtn:     { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },

  // Done
  doneBody:  { flex: 1, padding: spacing[8], alignItems: 'center', justifyContent: 'center' },
  doneBtn:   { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], paddingHorizontal: spacing[10] },
});
