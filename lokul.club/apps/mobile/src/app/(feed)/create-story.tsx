// PRD §08 — Create Story (24h)
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, ImagePlus, Send } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

export default function CreateStoryScreen() {
  return (
    <FeatureGate featureKey="stories">
      <CreateStoryScreenInner />
    </FeatureGate>
  );
}

function CreateStoryScreenInner() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [caption,    setCaption]    = useState('');
  const [mediaUri,   setMediaUri]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Please allow camera in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!caption.trim() && !mediaUri) {
      Alert.alert('Nothing to share', 'Add a caption or photo to create a story.');
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`${BASE}/api/mobile/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId,
          pinCode,
          caption: caption.trim() || null,
          mediaUrl: mediaUri, // in prod: upload to R2 first, use CDN URL
        }),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to post story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <HStack gap={3} align="center" style={s.topBar}>
        <Pressable onPress={() => router.back()} style={s.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1 }}>New Story</Text>
        <Button
          label="Share"
          size="sm"
          loading={submitting}
          onPress={handlePost}
          leftIcon={<Send size={14} color="#fff" />}
        />
      </HStack>

      <View style={s.body}>
        {/* Preview area */}
        {mediaUri ? (
          <Pressable onPress={pickFromLibrary} style={s.previewWrap}>
            <Image source={{ uri: mediaUri }} style={s.preview} resizeMode="cover" />
            <View style={s.changeOverlay}>
              <Text variant="caption" style={{ color: '#fff', fontWeight: '700' }}>Tap to change</Text>
            </View>
          </Pressable>
        ) : (
          <Card elevation="xs" bordered style={s.placeholderCard}>
            <VStack gap={3} style={{ alignItems: 'center' }}>
              <Text variant="caption" tone="secondary">Add a photo (optional)</Text>
              <HStack gap={3}>
                <Pressable onPress={takePhoto} style={s.mediaBtn} accessibilityRole="button">
                  <Camera size={22} color={colors.brand[700]} />
                  <Text variant="caption" style={{ color: colors.brand[700], marginTop: spacing[1] }}>Camera</Text>
                </Pressable>
                <Pressable onPress={pickFromLibrary} style={s.mediaBtn} accessibilityRole="button">
                  <ImagePlus size={22} color={colors.brand[700]} />
                  <Text variant="caption" style={{ color: colors.brand[700], marginTop: spacing[1] }}>Gallery</Text>
                </Pressable>
              </HStack>
            </VStack>
          </Card>
        )}

        {/* Caption */}
        <Card padding={3} elevation="xs" bordered style={s.captionCard}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="What's on your mind? (disappears in 24h)"
            placeholderTextColor={colors.surface.textSecondary}
            style={s.captionInput}
            multiline
            maxLength={200}
            returnKeyType="done"
          />
          <Text variant="caption" tone="secondary" style={{ textAlign: 'right', marginTop: spacing[1] }}>
            {caption.length}/200
          </Text>
        </Card>

        <Text variant="caption" tone="secondary" style={{ textAlign: 'center', paddingHorizontal: spacing[4] }}>
          Stories are visible to neighbours within your radius and expire after 24 hours.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.surface.background },
  topBar:       { paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
  backBtn:      { padding: spacing[1] },
  body:         { flex: 1, padding: spacing[4], gap: spacing[4] },
  previewWrap:  { borderRadius: radius.lg, overflow: 'hidden', height: 260 },
  preview:      { width: '100%', height: '100%' },
  changeOverlay:{
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: spacing[3],
  },
  placeholderCard: {
    height: 200, alignItems: 'center', justifyContent: 'center',
    borderStyle: 'dashed',
  },
  mediaBtn: {
    width: 80, height: 80, borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.brand[100],
  },
  captionCard: { paddingVertical: spacing[3] },
  captionInput: {
    fontSize: 15, color: colors.surface.foreground,
    minHeight: 60, textAlignVertical: 'top',
  },
});
