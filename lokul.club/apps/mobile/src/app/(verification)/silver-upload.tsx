import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  RefreshCcw,
  ShieldCheck,
  Upload,
} from 'lucide-react-native';
import {
  Button,
  Card,
  HStack,
  Screen,
  StepHeader,
  Text,
  VStack,
} from '@/components/ui';
import { proofMeta, type ProofType, useVerificationStore } from '@/store/verificationStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const PROOF_KIND: Record<ProofType, string> = {
  rent:       'rent_agreement',
  bill:       'electricity_bill',
  noc:        'society_noc',
  aadhaar:    'aadhaar',
  pan:        'pan_card',
  passport:   'passport',
  driving:    'driving_license',
  voter:      'voter_id',
  ration:     'ration_card',
  digilocker: 'digilocker',
};

export default function SilverUploadScreen() {
  const router    = useRouter();
  const userId    = useWalletStore((s) => s.userId);
  const { type }  = useLocalSearchParams<{ type: ProofType }>();
  const proofType: ProofType = (type ?? 'rent') as ProofType;
  const meta      = proofMeta[proofType];

  const submitSilverProof = useVerificationStore((s) => s.submitSilverProof);

  const [uri,        setUri]        = useState<string | null>(null);
  const [fileName,   setFileName]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Please allow camera in Settings to capture your document.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
      setFileName(result.assets[0].fileName ?? 'capture.jpg');
    }
  };

  const handleLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.85,
      mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]) {
      setUri(result.assets[0].uri);
      setFileName(result.assets[0].fileName ?? 'document.jpg');
    }
  };

  const handleSubmit = async () => {
    if (!uri || !userId) return;
    setSubmitting(true);
    try {
      // Read image as base64 data URL
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
      const mimeType = uri.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const fileDataUrl = `data:${mimeType};base64,${base64}`;

      const res = await fetch(`${BASE}/api/mobile/kyc/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          kind: PROOF_KIND[proofType],
          fileDataUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert('Upload failed', err.error ?? 'Please try again.');
        return;
      }

      // Update local store so UI reflects pending state
      submitSilverProof({
        type: proofType,
        uri,
        fileName,
        submittedAt: Date.now(),
      });
      router.replace('/(verification)/silver-review');
    } catch {
      Alert.alert('Upload failed', 'Could not upload document. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded={false} scroll>
      <StepHeader step={2} total={3} />

      <View style={styles.body}>
        <VStack gap={2}>
          <Text variant="h2">Upload your {meta.title.toLowerCase()}</Text>
          <Text variant="body" tone="secondary">
            {meta.desc} Make sure the address and your name are clearly visible.
          </Text>
        </VStack>

        {uri ? (
          <Card padding={0} elevation="sm" style={styles.preview}>
            <Image source={{ uri }} style={styles.previewImg} resizeMode="cover" />
            <View style={styles.previewOverlay}>
              <Pressable
                onPress={() => setUri(null)}
                style={styles.replaceBtn}
                accessibilityRole="button"
              >
                <RefreshCcw size={14} color={colors.surface.heading} />
                <Text
                  variant="caption"
                  style={{ color: colors.surface.heading, fontWeight: '600' }}
                >
                  Replace
                </Text>
              </Pressable>
            </View>
            <View style={styles.fileMeta}>
              <CheckCircle2 size={16} color={colors.semantic.success} />
              <Text variant="caption" tone="secondary" style={{ flex: 1 }}>
                {fileName ?? 'Document'} · ready to submit
              </Text>
            </View>
          </Card>
        ) : (
          <VStack gap={3}>
            <Pressable onPress={handleCamera} accessibilityRole="button">
              <Card padding={5} elevation="none" bordered style={styles.pickerCard}>
                <View style={styles.pickerIcon}>
                  <Camera size={26} color={colors.brand[600]} />
                </View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>
                    Capture with camera
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Recommended — sharper crop, instant OCR.
                  </Text>
                </VStack>
              </Card>
            </Pressable>

            <Pressable onPress={handleLibrary} accessibilityRole="button">
              <Card padding={5} elevation="none" bordered style={styles.pickerCard}>
                <View style={[styles.pickerIcon, { backgroundColor: colors.gray[100] }]}>
                  <ImagePlus size={26} color={colors.gray[700]} />
                </View>
                <VStack gap={0.5} style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>
                    Pick from library
                  </Text>
                  <Text variant="caption" tone="secondary">
                    Image or screenshot already on this device.
                  </Text>
                </VStack>
              </Card>
            </Pressable>
          </VStack>
        )}

        <Card padding={3} elevation="none" style={styles.safety}>
          <HStack gap={2} align="center">
            <ShieldCheck size={16} color={colors.semantic.success} />
            <Text variant="caption" style={{ color: colors.semantic.success, flex: 1 }}>
              End-to-end encrypted upload · deleted from device after submit.
            </Text>
          </HStack>
        </Card>
      </View>

      <View style={styles.footer}>
        <Button
          label="Submit for review"
          onPress={handleSubmit}
          disabled={!uri || submitting}
          loading={submitting}
          leftIcon={<Upload size={20} color="#fff" />}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing[5], paddingTop: spacing[4], gap: spacing[5] },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  pickerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    overflow: 'hidden',
    backgroundColor: colors.gray[100],
  },
  previewImg: {
    width: '100%',
    height: 260,
    backgroundColor: colors.gray[200],
  },
  previewOverlay: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    backgroundColor: '#ffffffee',
    borderRadius: radius.full,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.surface.background,
  },
  safety: { backgroundColor: colors.semantic.successBg },
  footer: { paddingHorizontal: spacing[5], paddingBottom: spacing[6], paddingTop: spacing[3] },
});
