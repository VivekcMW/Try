/**
 * Upload Health Record
 * Route: /(telemedicine)/upload
 */
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, RefreshCcw, X } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type HealthRecordType = 'prescription' | 'report' | 'record' | 'upload';

const TYPES: { id: HealthRecordType; label: string }[] = [
  { id: 'upload', label: 'General' },
  { id: 'prescription', label: 'Prescription' },
  { id: 'report', label: 'Lab Report' },
  { id: 'record', label: 'Other Record' },
];

export default function UploadRecordScreen() {
  const router = useRouter();
  const userId = useWalletStore((s) => s.userId);

  const [uri, setUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<HealthRecordType>('upload');
  const [saving, setSaving] = useState(false);

  const handleCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access in Settings to capture a record.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri);
  };

  const handleLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, mediaTypes: ['images'] });
    if (!result.canceled && result.assets[0]) setUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!uri || !title.trim() || !userId) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title: title.trim(),
          doctorName: 'Self-uploaded',
          fileUrl: uri,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error('failed');
      router.back();
    } catch {
      Alert.alert('Failed to save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <X size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Upload Record</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {uri ? (
          <Card padding={0} style={styles.preview}>
            <Image source={{ uri }} style={styles.previewImg} resizeMode="cover" />
            <Pressable onPress={() => setUri(null)} style={styles.replaceBtn}>
              <RefreshCcw size={13} color={colors.foreground} />
              <Text variant="caption" style={{ fontWeight: '600' }}>Replace</Text>
            </Pressable>
          </Card>
        ) : (
          <VStack gap={spacing.sm}>
            <Pressable onPress={handleCamera}>
              <Card style={styles.pickerCard}>
                <View style={styles.pickerIcon}>
                  <Camera size={22} color={colors.brand[600]} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>Capture with camera</Text>
                  <Text variant="caption" tone="secondary">Photograph a prescription or report</Text>
                </VStack>
              </Card>
            </Pressable>
            <Pressable onPress={handleLibrary}>
              <Card style={styles.pickerCard}>
                <View style={[styles.pickerIcon, { backgroundColor: colors.surfaceMuted }]}>
                  <ImagePlus size={22} color={colors.foreground} />
                </View>
                <VStack style={{ flex: 1 }}>
                  <Text variant="body" style={{ fontWeight: '700' }}>Pick from library</Text>
                  <Text variant="caption" tone="secondary">Choose an existing photo or scan</Text>
                </VStack>
              </Card>
            </Pressable>
          </VStack>
        )}

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>RECORD TYPE</Text>
          <HStack gap={spacing.sm} style={{ flexWrap: 'wrap' }}>
            {TYPES.map((t) => {
              const isActive = t.id === type;
              return (
                <Pressable key={t.id} onPress={() => setType(t.id)} style={[styles.typeChip, isActive && styles.typeChipActive]}>
                  <Text variant="caption" style={{ fontWeight: '600', color: isActive ? colors.surface.background : colors.foreground }}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>TITLE</Text>
          <TextInput
            style={styles.inputFlat}
            placeholder="e.g. Blood Test Report — June"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </VStack>

        <VStack gap={spacing.sm} style={{ marginTop: spacing.lg }}>
          <Text variant="label" style={{ fontWeight: '600' }}>NOTE (OPTIONAL)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any additional context…"
            placeholderTextColor={colors.textSecondary}
            multiline
            value={note}
            onChangeText={setNote}
          />
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={saving ? 'Saving…' : 'Save Record'}
          fullWidth
          size="lg"
          loading={saving}
          disabled={!uri || !title.trim() || saving}
          onPress={handleSave}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: { padding: spacing.lg, paddingBottom: spacing[10] },
  preview: { overflow: 'hidden' },
  previewImg: { width: '100%', height: 220, backgroundColor: colors.surfaceMuted },
  replaceBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: '#ffffffee', paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  pickerCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  pickerIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.brand[50], alignItems: 'center', justifyContent: 'center',
  },
  typeChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.full, backgroundColor: colors.surfaceMuted,
    borderWidth: 1, borderColor: colors.border,
  },
  typeChipActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  inputFlat: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: 15, color: colors.foreground,
  },
  textArea: {
    minHeight: 80, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.md, fontSize: 15, color: colors.foreground, textAlignVertical: 'top',
  },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
});
