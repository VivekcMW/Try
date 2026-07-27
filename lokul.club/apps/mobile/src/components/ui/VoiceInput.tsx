import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Mic, Square, Volume2 } from 'lucide-react-native';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
  type AudioRecorder,
} from 'expo-audio';
import { Text } from './Text';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type ExpoSpeechModule = typeof import('expo-speech');

let speechModule: ExpoSpeechModule | null = null;

function getSpeechModule() {
  if (speechModule) return speechModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    speechModule = require('expo-speech') as ExpoSpeechModule;
  } catch {
    speechModule = null;
  }
  return speechModule;
}

type VoiceInputProps = {
  language?: string;
  onTranscript: (text: string) => void;
  readbackText?: string;
};

export function VoiceInput({ language = 'en', onTranscript, readbackText }: Readonly<VoiceInputProps>) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderRef = useRef<AudioRecorder>(recorder);
  recorderRef.current = recorder;

  const startRecording = async () => {
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow microphone access to use voice input.');
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await recorder.prepareToRecordAsync();
    recorder.record();
    setRecording(true);
  };

  const stopRecording = async () => {
    const rec = recorderRef.current;
    setLoading(true);
    setRecording(false);

    try {
      await rec.stop();
      const uri = rec.uri;
      if (!uri) {
        setLoading(false);
        return;
      }

      const endpoint = process.env.EXPO_PUBLIC_WHISPER_API_URL;
      const apiKey = process.env.EXPO_PUBLIC_WHISPER_API_KEY;
      if (!endpoint) {
        setLoading(false);
        Alert.alert('Voice API missing', 'Please set EXPO_PUBLIC_WHISPER_API_URL in .env');
        return;
      }

      const form = new FormData();
      form.append('file', {
        uri,
        name: 'voice.m4a',
        type: 'audio/m4a',
      } as any);
      form.append('language', language);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const payload = (await response.json()) as { text?: string; transcript?: string };
      const transcript = payload.text ?? payload.transcript ?? '';
      if (transcript) {
        onTranscript(transcript);
      }
    } catch {
      Alert.alert('Voice input failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const readAloud = () => {
    if (!readbackText) return;
    const Speech = getSpeechModule();
    if (!Speech) {
      Alert.alert('Text-to-speech unavailable', 'Speech module is not available in this build.');
      return;
    }

    Speech.speak(readbackText, {
      language,
      rate: 0.95,
    });
  };

  let icon = <Mic size={18} color="#fff" />;
  if (loading) {
    icon = <ActivityIndicator color="#fff" />;
  } else if (recording) {
    icon = <Square size={18} color="#fff" />;
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={recording ? stopRecording : startRecording}
        style={[styles.button, recording ? styles.buttonActive : null]}
        disabled={loading}
      >
        {icon}
      </Pressable>

      <Text variant="caption" tone="secondary">
        {recording ? 'Tap to stop' : 'Voice input'}
      </Text>

      <Pressable onPress={readAloud} style={styles.readButton} disabled={!readbackText}>
        <Volume2 size={16} color={readbackText ? colors.brand[600] : colors.surface.textDisabled} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.semantic.danger,
  },
  readButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
