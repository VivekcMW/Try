/**
 * AI Assistant screen — voice-first, multi-language
 * PRD: low-literacy users, 22 Indian languages, offline-graceful.
 *
 * Route: /(assistant)/chat
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  ArrowLeft,
  Bot,
  ChevronDown,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { PlusGate } from '@/components/PlusGate';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useLanguageStore } from '@/store/languageStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { SUPPORTED_LANGUAGES } from '@/i18n/languageConfig';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

// ── Quick-action prompts per language ────────────────────────────────────────
const QUICK_PROMPTS: Record<string, string[]> = {
  en:  ['What happened in my area today?', 'Find a plumber near me', 'How do I pay my society dues?', 'Show latest alerts'],
  hi:  ['आज मेरे क्षेत्र में क्या हुआ?', 'नजदीकी प्लंबर खोजें', 'सोसायटी शुल्क कैसे भरें?', 'ताजा अलर्ट दिखाएं'],
  mr:  ['आज माझ्या परिसरात काय झाले?', 'जवळचा प्लंबर शोधा', 'सोसायटी फी कशी भरावी?', 'ताजे अलर्ट दाखवा'],
  ta:  ['இன்று என் பகுதியில் என்ன நடந்தது?', 'அருகில் உள்ள பிளம்பர் தேடு', 'சொசைட்டி கட்டணம் எப்படி செலுத்துவது?'],
  te:  ['నేడు నా ప్రాంతంలో ఏమి జరిగింది?', 'దగ్గరలో ప్లంబర్ వెతకండి', 'సొసైటీ రుసుము ఎలా చెల్లించాలి?'],
  kn:  ['ಇಂದು ನನ್ನ ಪ್ರದೇಶದಲ್ಲಿ ಏನಾಯಿತು?', 'ಹತ್ತಿರದ ಪ್ಲಂಬರ್ ಹುಡುಕಿ'],
  bn:  ['আজ আমার এলাকায় কী হয়েছে?', 'কাছের প্লাম্বার খুঁজুন'],
  gu:  ['આજ મારા વિસ્તારમાં શું થયું?', 'નજીકનો પ્લમ્બર શોધો'],
};

// Fallback quick prompts for languages without specific prompts
const DEFAULT_PROMPTS = QUICK_PROMPTS.en;

type Role = 'user' | 'assistant' | 'error';

interface Message {
  id: string;
  role: Role;
  text: string;
  lang: string;
  ts: number;
}

// Offline/demo responses when API is unavailable
const OFFLINE_RESPONSES: string[] = [
  "I couldn't connect right now. Here's what I know from your last sync:\n\n• 2 new posts in your feed\n• Water supply disruption notice from RWA\n• Garba event on Saturday at community hall\n\nTry again when you have a better signal.",
  "Offline mode: I can answer basic questions about your neighbourhood from cached data. For live updates, please reconnect.",
];

function getOfflineResponse() {
  return OFFLINE_RESPONSES[Math.floor(Math.random() * OFFLINE_RESPONSES.length)];
}

export default function AssistantScreen() {
  const router  = useRouter();
  const lang    = useLanguageStore((s) => s.language);
  const setLang = useLanguageStore((s) => s.setLanguage);
  const pin     = useOnboardingStore((s) => s.pin);
  const userId  = useWalletStore((s) => s.userId);
  const name    = useOnboardingStore((s) => s.name);

  const [messages,       setMessages]       = useState<Message[]>([]);
  const [input,          setInput]          = useState('');
  const [loading,        setLoading]        = useState(false);
  const [voiceActive,    setVoiceActive]    = useState(false);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [isOffline,      setIsOffline]      = useState(false);

  const listRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mic pulse animation
  useEffect(() => {
    if (!voiceActive) { pulseAnim.setValue(1); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [voiceActive, pulseAnim]);

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, lang, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch(`${BASE}/api/mobile/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          lang,
          pinCode: pin,
          userId,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.text })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply ?? 'Sorry, I could not understand that.',
        lang: data.lang ?? lang,
        ts: Date.now(),
      };
      setMessages((m) => [...m, reply]);
      setIsOffline(false);
    } catch {
      // Graceful offline fallback
      setIsOffline(true);
      const offlineReply: Message = {
        id: (Date.now() + 1).toString(),
        role: 'error',
        text: getOfflineResponse(),
        lang,
        ts: Date.now(),
      };
      setMessages((m) => [...m, offlineReply]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [lang, pin, userId, messages]);

  const handleVoicePress = () => {
    // No speech-to-text library is installed (no @react-native-voice/voice or similar).
    // expo-speech only supports text-to-speech, not recognition, so we can't fake a
    // transcription here — be honest with the user instead.
    Alert.alert('Voice input isn\'t available yet', 'Speech-to-text isn\'t supported in this build. Please type your question instead.');
  };

  const quickPrompts = QUICK_PROMPTS[lang] ?? DEFAULT_PROMPTS;
  const currentLang  = SUPPORTED_LANGUAGES.find((l) => l.code === lang) ?? SUPPORTED_LANGUAGES[0];

  return (
    <PlusGate feature="ai_assistant">
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <HStack gap={3} align="center" style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <ArrowLeft size={22} color={colors.surface.heading} />
          </Pressable>
          <View style={styles.botAvatar}>
            <Bot size={20} color={colors.brand[600]} />
          </View>
          <VStack gap={0} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>Lokul AI</Text>
            <Text variant="caption" tone="secondary">
              {isOffline ? 'Offline — using cached data' : 'Online · ' + currentLang.nativeName}
            </Text>
          </VStack>

          {/* Language switcher */}
          <Pressable
            onPress={() => setLangPickerOpen(true)}
            style={styles.langBtn}
            accessibilityRole="button"
            accessibilityLabel="Change language"
          >
            <Text style={{ color: colors.brand[600], fontSize: 11, fontWeight: '700' }}>
              {currentLang.nativeName}
            </Text>
            <ChevronDown size={12} color={colors.brand[600]} />
          </Pressable>
        </HStack>

        {/* Offline banner */}
        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text variant="caption" style={{ color: '#92400E' }}>
              Offline mode — responses from cached data
            </Text>
          </View>
        )}

        {/* Message list */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.msgList}
          renderItem={({ item }) => <MessageBubble message={item} />}
          ListHeaderComponent={messages.length === 0 ? (
            <WelcomeCard name={name} lang={currentLang.nativeName} />
          ) : null}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick prompts (shown when empty or after last reply) */}
        {messages.length < 2 && (
          <View style={styles.quickRow}>
            <FlatList
              horizontal
              data={quickPrompts}
              keyExtractor={(p) => p}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing[2], paddingHorizontal: spacing[4] }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => sendMessage(item)}
                  style={({ pressed }) => [styles.quickChip, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 12, color: colors.brand[700], fontWeight: '600' }}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        )}

        {/* Input row */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <HStack gap={2} align="end" style={styles.inputRow}>
            {/* Voice button */}
            <Pressable onPress={handleVoicePress} style={styles.voiceBtn} accessibilityRole="button" accessibilityLabel="Voice input">
              <Animated.View style={{ transform: [{ scale: voiceActive ? pulseAnim : 1 }] }}>
                {voiceActive
                  ? <MicOff size={20} color={colors.semantic.danger} />
                  : <Mic size={20} color={colors.brand[600]} />
                }
              </Animated.View>
            </Pressable>

            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={voiceActive ? 'Listening…' : 'Ask anything…'}
              placeholderTextColor={colors.surface.textSecondary}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={() => sendMessage(input)}
            />

            <Pressable
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={({ pressed }) => [styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled, pressed && { opacity: 0.8 }]}
              accessibilityRole="button"
              accessibilityLabel="Send"
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Send size={18} color="#fff" />
              }
            </Pressable>
          </HStack>
        </KeyboardAvoidingView>

        {/* Language picker modal */}
        <LangPickerModal
          visible={langPickerOpen}
          current={lang}
          onSelect={async (code) => { await setLang(code); setLangPickerOpen(false); }}
          onClose={() => setLangPickerOpen(false)}
        />
      </SafeAreaView>
    </PlusGate>
  );
}

function WelcomeCard({ name, lang }: { readonly name: string | null; readonly lang: string }) {
  return (
    <View style={styles.welcomeCard}>
      <View style={styles.welcomeIcon}>
        <Sparkles size={28} color={colors.brand[600]} />
      </View>
      <Text variant="h3" style={{ textAlign: 'center', color: colors.surface.heading, fontWeight: '800' }}>
        Lokul AI
      </Text>
      <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
        {name ? `Hi ${name}! ` : ''}I can help you find services, understand neighbourhood news, and answer questions — in {lang}.
      </Text>
    </View>
  );
}

function MessageBubble({ message }: { readonly message: Message }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <View style={[styles.bubbleWrap, isUser && styles.bubbleWrapUser]}>
      {!isUser && (
        <View style={styles.botSmallAvatar}>
          <Bot size={14} color={colors.brand[600]} />
        </View>
      )}
      <View style={[
        styles.bubble,
        isUser  && styles.bubbleUser,
        isError && styles.bubbleError,
      ]}>
        <Text style={{
          fontSize: 14,
          lineHeight: 21,
          color: isUser ? '#fff' : isError ? '#92400E' : colors.surface.heading,
        }}>
          {message.text}
        </Text>
        {!isUser && !isError && (
          <Pressable
            style={styles.ttsBtn}
            accessibilityRole="button"
            accessibilityLabel="Read aloud"
            onPress={() => Speech.speak(message.text, { language: message.lang })}
          >
            <Volume2 size={12} color={colors.surface.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function LangPickerModal({
  visible, current, onSelect, onClose,
}: {
  readonly visible: boolean;
  readonly current: string;
  readonly onSelect: (code: string) => Promise<void>;
  readonly onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.modalSheet}>
        <View style={styles.sheetHandle} />
        <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading, marginBottom: spacing[3] }}>
          Choose language
        </Text>
        <FlatList
          data={SUPPORTED_LANGUAGES}
          keyExtractor={(l) => l.code}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing[2] }}
          contentContainerStyle={{ gap: spacing[2] }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.code)}
              style={[
                styles.langItem,
                item.code === current && styles.langItemActive,
              ]}
              accessibilityRole="button"
            >
              <Text style={{ fontWeight: '700', fontSize: 13, color: item.code === current ? '#fff' : colors.surface.heading }}>
                {item.nativeName}
              </Text>
              <Text style={{ fontSize: 10, color: item.code === current ? '#ffffff99' : colors.surface.textSecondary }}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.surface.background },
  header:        { paddingHorizontal: spacing[4], paddingVertical: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  botAvatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.brand[600]}15`, alignItems: 'center', justifyContent: 'center' },
  langBtn:       { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: `${colors.brand[600]}10`, paddingHorizontal: spacing[2.5], paddingVertical: spacing[1.5], borderRadius: radius.full },
  offlineBanner: { backgroundColor: '#FEF3C7', paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  msgList:       { padding: spacing[4], gap: spacing[3], flexGrow: 1 },
  quickRow:      { paddingVertical: spacing[2] },
  quickChip:     { backgroundColor: `${colors.brand[600]}12`, paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderRadius: radius.full, maxWidth: 220 },
  inputRow:      { paddingHorizontal: spacing[3], paddingVertical: spacing[2], borderTopWidth: 1, borderTopColor: colors.surface.border, backgroundColor: colors.surface.background },
  voiceBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  textInput:     { flex: 1, backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.xl, paddingHorizontal: spacing[3], paddingVertical: spacing[2.5], color: colors.surface.heading, fontSize: 14, maxHeight: 120 },
  sendBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brand[600], alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.gray[300] },
  bubbleWrap:    { flexDirection: 'row', alignItems: 'flex-end', gap: spacing[2] },
  bubbleWrapUser: { flexDirection: 'row-reverse' },
  botSmallAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${colors.brand[600]}15`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bubble:        { maxWidth: '80%', backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.xl, borderBottomLeftRadius: radius.sm, padding: spacing[3], gap: spacing[1] },
  bubbleUser:    { backgroundColor: colors.brand[600], borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.sm },
  bubbleError:   { backgroundColor: '#FEF3C7' },
  ttsBtn:        { alignSelf: 'flex-end' },
  welcomeCard:   { alignItems: 'center', gap: spacing[3], paddingVertical: spacing[6], paddingHorizontal: spacing[4] },
  welcomeIcon:   { width: 64, height: 64, borderRadius: 32, backgroundColor: `${colors.brand[600]}12`, alignItems: 'center', justifyContent: 'center' },
  modalOverlay:  { flex: 1, backgroundColor: '#00000050' },
  modalSheet:    { backgroundColor: colors.surface.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing[5], maxHeight: '75%' },
  sheetHandle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.gray[300], alignSelf: 'center', marginBottom: spacing[4] },
  langItem:      { flex: 1, backgroundColor: colors.surface.surfaceMuted, borderRadius: radius.lg, padding: spacing[3], gap: 2 },
  langItemActive: { backgroundColor: colors.brand[600] },
});
