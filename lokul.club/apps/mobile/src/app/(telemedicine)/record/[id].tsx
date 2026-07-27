/**
 * Health record detail
 * Route: /(telemedicine)/record/[id]
 */
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, FileText, Trash2, User } from 'lucide-react-native';
import { Card, HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

const TYPE_LABEL: Record<string, string> = {
  prescription: 'Prescription',
  report: 'Lab Report',
  record: 'Health Record',
  upload: 'Uploaded Record',
};

type ApiHealthRecord = {
  id: string;
  type: string;
  title: string;
  doctorName: string | null;
  fileUrl: string | null;
  note: string | null;
  createdAt: string;
};

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<ApiHealthRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/telemedicine/records/${id}`);
      const data = await res.json();
      setRecord(res.ok ? data.record : null);
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator style={{ marginTop: spacing[12] }} color={colors.brand[600]} />
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HStack gap={spacing.md} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ArrowLeft size={22} color={colors.foreground} />
          </Pressable>
          <Text variant="h3" style={{ fontWeight: '700' }}>Record not found</Text>
        </HStack>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete record?', 'This will permanently remove this health record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(`${BASE}/api/mobile/telemedicine/records/${record.id}`, { method: 'DELETE' });
          } finally {
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HStack gap={spacing.md} style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={22} color={colors.foreground} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700', flex: 1 }} numberOfLines={1}>{record.title}</Text>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Trash2 size={20} color={colors.danger} />
        </Pressable>
      </HStack>

      <ScrollView contentContainerStyle={styles.content}>
        {record.fileUrl ? (
          <Card padding={0} style={styles.imageCard}>
            <Image source={{ uri: record.fileUrl }} style={styles.image} resizeMode="cover" />
          </Card>
        ) : (
          <Card style={styles.placeholder}>
            <FileText size={40} color={colors.textSecondary} />
          </Card>
        )}

        <Card style={styles.metaCard}>
          <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
            <FileText size={14} color={colors.brand[600]} />
            <Text variant="caption" style={{ color: colors.brand[600], fontWeight: '600' }}>
              {TYPE_LABEL[record.type] ?? 'Record'}
            </Text>
          </HStack>
          <Text variant="h3" style={{ fontWeight: '700', marginTop: spacing.sm }}>{record.title}</Text>

          <HStack gap={spacing.md} style={{ marginTop: spacing.md }}>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <User size={13} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{record.doctorName ?? 'Self-uploaded'}</Text>
            </HStack>
            <HStack gap={spacing.xs} style={{ alignItems: 'center' }}>
              <Calendar size={13} color={colors.textSecondary} />
              <Text variant="caption" tone="secondary">{new Date(record.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</Text>
            </HStack>
          </HStack>

          {record.note && (
            <VStack style={{ marginTop: spacing.md }}>
              <Text variant="label" style={{ fontWeight: '600' }}>NOTE</Text>
              <Text variant="body" style={{ marginTop: spacing.xs }}>{record.note}</Text>
            </VStack>
          )}
        </Card>
      </ScrollView>
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
  imageCard: { overflow: 'hidden' },
  image: { width: '100%', height: 280, backgroundColor: colors.surfaceMuted },
  placeholder: { height: 200, alignItems: 'center', justifyContent: 'center' },
  metaCard: { padding: spacing.md, marginTop: spacing.md },
});
