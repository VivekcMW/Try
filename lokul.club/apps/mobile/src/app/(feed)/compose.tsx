import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Camera, Image, MapPin, X } from 'lucide-react-native';
import { Badge, Button, HStack, Text, VStack } from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type PostTypeOption = {
  id: string;
  label: string;
  tone: 'neutral' | 'brand' | 'warning' | 'danger' | 'info' | 'success';
};

const POST_TYPES: PostTypeOption[] = [
  { id: 'update', label: 'Update', tone: 'neutral' },
  { id: 'safety', label: 'Safety', tone: 'warning' },
  { id: 'lost', label: 'Lost / Found', tone: 'info' },
  { id: 'event', label: 'Event', tone: 'success' },
  { id: 'sell', label: 'Sell', tone: 'neutral' },
  { id: 'rwa_notice', label: 'RWA Notice', tone: 'brand' },
];

const VISIBILITY: { key: string; label: string }[] = [
  { key: 'society', label: 'Society' },
  { key: 'tower', label: 'Tower' },
  { key: 'neighborhood', label: 'Neighborhood' },
];

export default function ComposeScreen() {
  const router = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [postType, setPostType] = useState('update');
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState('society');
  const [submitting, setSubmitting] = useState(false);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const MAX = 2000;

  async function handleCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) setMediaUri(result.assets[0].uri);
  }

  async function handleGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ['images'] });
    if (!result.canceled && result.assets[0]) setMediaUri(result.assets[0].uri);
  }

  async function handleLocation() {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Location access needed', 'Please allow location access in Settings.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const label = place ? [place.district ?? place.subregion, place.city].filter(Boolean).join(', ') : null;
      setLocationTag(label || 'Current location');
    } catch {
      Alert.alert('Error', 'Could not fetch your location. Please try again.');
    } finally {
      setLocating(false);
    }
  }

  async function handlePost() {
    if (!body.trim() || !userId || !pinCode) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          postBody: body.trim(),
          type: postType,
          visibility,
          pinCode,
          media: mediaUri ? [mediaUri] : undefined,
          tags: locationTag ? [locationTag] : undefined,
          lat: coords?.lat,
          lng: coords?.lng,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      router.back();
    } catch {
      Alert.alert('Error', 'Could not post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar */}
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityRole="button">
          <X size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>
          New post
        </Text>
        <Button
          label={submitting ? 'Posting…' : 'Post'}
          size="sm"
          onPress={handlePost}
          disabled={body.trim().length === 0 || submitting}
        />
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Type picker */}
        <VStack gap={2}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600' }}>
            TYPE
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack gap={2}>
              {POST_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => setPostType(t.id)}
                  style={[
                    styles.typeChip,
                    postType === t.id && styles.typeChipActive,
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{
                      fontWeight: '700',
                      color: postType === t.id ? '#fff' : colors.surface.foreground,
                    }}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </HStack>
          </ScrollView>
        </VStack>

        {/* Body text */}
        <VStack gap={2} style={{ marginTop: spacing[4] }}>
          <TextInput
            style={styles.textArea}
            placeholder="What's happening in your neighborhood?"
            placeholderTextColor={colors.surface.textSecondary}
            multiline
            maxLength={MAX}
            value={body}
            onChangeText={setBody}
            autoFocus
          />
          <Text
            variant="caption"
            style={{
              textAlign: 'right',
              color: body.length > 1800 ? colors.semantic.warning : colors.gray[400],
            }}
          >
            {body.length}/{MAX}
          </Text>
        </VStack>

        {/* Media row */}
        <HStack gap={3} style={styles.mediaRow}>
          <Pressable onPress={handleCamera} style={styles.mediaBtn} accessibilityRole="button">
            <Camera size={20} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              Camera
            </Text>
          </Pressable>
          <Pressable onPress={handleGallery} style={styles.mediaBtn} accessibilityRole="button">
            <Image size={20} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              Gallery
            </Text>
          </Pressable>
          <Pressable onPress={handleLocation} style={styles.mediaBtn} accessibilityRole="button">
            {locating ? (
              <ActivityIndicator size="small" color={colors.brand[600]} />
            ) : (
              <MapPin size={20} color={colors.brand[600]} />
            )}
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              {locationTag ?? 'Location'}
            </Text>
          </Pressable>
        </HStack>

        {mediaUri && (
          <View style={styles.previewWrap}>
            <RNImage source={{ uri: mediaUri }} style={styles.previewImg} resizeMode="cover" />
            <Pressable onPress={() => setMediaUri(null)} style={styles.removeMediaBtn} accessibilityRole="button">
              <X size={14} color="#fff" />
            </Pressable>
          </View>
        )}

        {/* Visibility */}
        <VStack gap={2} style={{ marginTop: spacing[4] }}>
          <Text variant="caption" style={{ color: colors.gray[500], fontWeight: '600' }}>
            VISIBLE TO
          </Text>
          <HStack gap={2}>
            {VISIBILITY.map((v) => (
              <Pressable
                key={v.key}
                onPress={() => setVisibility(v.key)}
                style={[
                  styles.visChip,
                  visibility === v.key && styles.visChipActive,
                ]}
              >
                <Text
                  variant="caption"
                  style={{
                    fontWeight: '600',
                    color: visibility === v.key ? colors.brand[700] : colors.surface.foreground,
                  }}
                >
                  {v.label}
                </Text>
              </Pressable>
            ))}
          </HStack>
        </VStack>

        {/* Silver gate notice */}
        <View style={styles.silverNote}>
          <Text variant="caption" style={{ color: colors.brand[700] }}>
            Only Silver+ verified residents can post. Upgrade in "You" tab.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing[5], gap: spacing[3], paddingBottom: spacing[16] },
  typeChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeChipActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  textArea: {
    minHeight: 160,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing[4],
    fontSize: 15,
    color: colors.surface.heading,
    textAlignVertical: 'top',
    fontFamily: undefined,
  },
  mediaRow: {
    marginTop: spacing[2],
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: colors.surface.border,
    paddingVertical: spacing[3],
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.brand[50],
  },
  previewWrap: {
    marginTop: spacing[3],
    borderRadius: radius.md,
    overflow: 'hidden',
    height: 180,
  },
  previewImg: { width: '100%', height: '100%' },
  removeMediaBtn: {
    position: 'absolute', top: spacing[2], right: spacing[2],
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  visChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  visChipActive: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[300],
  },
  silverNote: {
    marginTop: spacing[4],
    backgroundColor: colors.brand[50],
    borderRadius: 10,
    padding: spacing[3],
  },
});
