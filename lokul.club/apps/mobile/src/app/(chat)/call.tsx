// PRD §04 — Voice & Video Call screen
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Phone,
  Volume2,
  Video,
} from 'lucide-react-native';
import { Avatar, HStack, Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

type CallState = 'ringing' | 'connected' | 'no-answer' | 'ended';

// No real signaling backend (Agora/Jitsi) is integrated yet. Rather than pretending
// every outgoing call magically connects, we ring for a while and then honestly
// report "no answer" — same as a real call would look before that integration exists.
const RING_TIMEOUT_MS = 25_000;

export default function CallScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams<{
    threadId: string;
    callType: string;
    name: string;
    avatarUrl?: string;
  }>();

  const callType  = (params.callType as 'audio' | 'video') ?? 'audio';
  const name      = params.name ?? 'Unknown';

  const [callState,  setCallState]  = useState<CallState>('ringing');
  const [elapsed,    setElapsed]    = useState(0);
  const [muted,      setMuted]      = useState(false);
  const [videoOff,   setVideoOff]   = useState(false);
  const [speaker,    setSpeaker]    = useState(callType === 'video');

  // Pulse animation for ringing avatar
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.14, duration: 700, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, easing: Easing.ease, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // No real call backend is wired up (no Agora/Jitsi), so we can't actually connect
  // the call. Ring for a realistic duration, then honestly report "no answer" instead
  // of faking a successful connection.
  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setTimeout(() => setCallState('no-answer'), RING_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [callState]);

  // If the call ever does connect (future real integration), keep a timer running.
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1_000);
    return () => clearInterval(interval);
  }, [callState]);

  // Auto-dismiss shortly after a no-answer / ended state so the screen doesn't hang.
  useEffect(() => {
    if (callState !== 'no-answer') return;
    const t = setTimeout(() => router.back(), 1_800);
    return () => clearTimeout(t);
  }, [callState, router]);

  const handleHangUp = () => {
    setCallState('ended');
    setTimeout(() => router.back(), 600);
  };

  // ── Labels ────────────────────────────────────────────────────────────────
  const statusLabel =
    callState === 'ringing'    ? (callType === 'video' ? 'Video calling…' : 'Calling…') :
    callState === 'connected'  ? formatDuration(elapsed) :
    callState === 'no-answer'  ? 'No answer' :
                                 'Call ended';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Background gradient effect (solid fallback) */}
      <View style={s.bg} />

      {/* Remote video placeholder (video call only) */}
      {callType === 'video' && callState === 'connected' && !videoOff && (
        <View style={s.remoteVideo} accessibilityLabel="Remote video feed">
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Live video (Agora/Jitsi in production)
          </Text>
        </View>
      )}

      {/* Top info */}
      <VStack gap={4} style={s.topSection} align="center">
        <Animated.View style={{ transform: [{ scale: callState === 'ringing' ? pulse : 1 }] }}>
          <Avatar name={name} size="xl" />
        </Animated.View>

        <VStack gap={1} align="center">
          <Text variant="h2" style={s.nameText}>{name}</Text>
          <Text variant="body" style={s.statusText}>{statusLabel}</Text>
        </VStack>

        {/* Call-type badge */}
        <HStack gap={2} align="center" style={s.typeBadge}>
          {callType === 'video'
            ? <Video size={14} color={colors.brand[400]} />
            : <Phone size={14} color={colors.brand[400]} />}
          <Text variant="caption" style={{ color: colors.brand[300] }}>
            {callType === 'video' ? 'Video call' : 'Voice call'}
          </Text>
        </HStack>
      </VStack>

      {/* Self-view (video call) */}
      {callType === 'video' && callState === 'connected' && (
        <View style={s.selfView} accessibilityLabel="Your camera view">
          <Text variant="caption" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>You</Text>
        </View>
      )}

      {/* Controls */}
      <View style={s.controls}>
        {/* Row 1 — toggle controls */}
        <HStack gap={6} style={s.toggleRow} align="center">
          <ControlButton
            icon={muted ? MicOff : Mic}
            label={muted ? 'Unmute' : 'Mute'}
            active={muted}
            onPress={() => setMuted((v) => !v)}
          />
          <ControlButton
            icon={speaker ? Volume2 : Phone}
            label="Speaker"
            active={speaker}
            onPress={() => setSpeaker((v) => !v)}
          />
          {callType === 'video' && (
            <ControlButton
              icon={videoOff ? CameraOff : Camera}
              label={videoOff ? 'Start video' : 'Stop video'}
              active={videoOff}
              onPress={() => setVideoOff((v) => !v)}
            />
          )}
        </HStack>

        {/* Row 2 — hang-up */}
        <View style={s.hangUpRow}>
          <Pressable
            onPress={handleHangUp}
            style={s.hangUpBtn}
            accessibilityRole="button"
            accessibilityLabel="End call"
          >
            <Phone size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────
function ControlButton({
  icon: Icon,
  label,
  active,
  onPress,
}: {
  readonly icon: typeof Mic;
  readonly label: string;
  readonly active: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.ctrlBtn, active && s.ctrlBtnActive, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Icon size={22} color={active ? colors.brand[600] : '#fff'} />
      <Text variant="caption" style={[s.ctrlLabel, active && s.ctrlLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  bg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D1B2A',
  },
  remoteVideo: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1a2a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topSection: {
    flex: 1,
    paddingTop: spacing[12],
    alignItems: 'center',
  },
  nameText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  statusText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 20,
  },
  selfView: {
    position: 'absolute',
    top: 100,
    right: spacing[4],
    width: 90,
    height: 130,
    backgroundColor: '#1e3040',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    paddingBottom: spacing[10],
    paddingHorizontal: spacing[6],
    gap: spacing[6],
  },
  toggleRow: {
    justifyContent: 'center',
  },
  ctrlBtn: {
    alignItems: 'center',
    gap: spacing[1],
    width: 72,
  },
  ctrlBtnActive: {},
  ctrlLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
  ctrlLabelActive: {
    color: colors.brand[400],
  },
  hangUpRow: {
    alignItems: 'center',
    marginTop: spacing[2],
  },
  hangUpBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
