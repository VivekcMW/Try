// PRD §03 — Create community
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Globe2, Lock, UserCheck } from 'lucide-react-native';
import { Button, Card, HStack, Text, VStack } from '@/components/ui';
import { COMMUNITY_CATEGORY_META, useCommunityStore, type CommunityCategory, type CommunityPrivacy } from '@/store/communityStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const CATEGORIES: CommunityCategory[] = ['sports', 'parenting', 'pets', 'fitness', 'hobby', 'civic', 'business', 'spiritual', 'youth', 'other'];

export default function CreateCommunity() {
  const router = useRouter();
  const create = useCommunityStore((s) => s.createCommunity);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [cat, setCat] = useState<CommunityCategory>('hobby');
  const [privacy, setPrivacy] = useState<CommunityPrivacy>('open');
  const [submitting, setSubmitting] = useState(false);

  const meta = COMMUNITY_CATEGORY_META[cat];

  const submit = async () => {
    setSubmitting(true);
    try {
      const c = await create({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: cat,
        privacy,
        bio,
        emoji: meta.emoji,
        bannerColor: meta.tint,
      });
      router.replace(`/(groups)/home/${c.id}` as never);
    } catch {
      Alert.alert('Error', 'Could not create the community — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ fontWeight: '700' }}>Create community</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <VStack gap={4}>
          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Name</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. Sunday Cyclists" placeholderTextColor={colors.surface.textSecondary} style={styles.input} />
          </VStack>
          <VStack gap={1.5}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Short bio</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="What is this group about?" placeholderTextColor={colors.surface.textSecondary} multiline style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]} />
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Category</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => {
                const m = COMMUNITY_CATEGORY_META[c];
                const active = cat === c;
                return (
                  <Pressable key={c} onPress={() => setCat(c)} style={[styles.catBtn, active && { borderColor: m.tint, backgroundColor: m.tint + '12' }]}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                    <Text variant="caption" style={{ fontWeight: '600', textAlign: 'center' }}>{m.label}</Text>
                    {active && (
                      <View style={[styles.catCheck, { backgroundColor: m.tint }]}>
                        <Check size={11} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </VStack>

          <VStack gap={2}>
            <Text variant="caption" style={{ fontWeight: '700' }}>Privacy</Text>
            <PrivacyOption Icon={Globe2} title="Open" desc="Anyone can join and post" value="open" current={privacy} onChange={setPrivacy} />
            <PrivacyOption Icon={UserCheck} title="Request to join" desc="Admin approves new members" value="request" current={privacy} onChange={setPrivacy} />
            <PrivacyOption Icon={Lock} title="Invite only" desc="Hidden from discover" value="invite" current={privacy} onChange={setPrivacy} />
          </VStack>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Button label={submitting ? 'Creating…' : 'Create community'} onPress={submit} disabled={!name || !bio || submitting} fullWidth />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PrivacyOption({
  Icon, title, desc, value, current, onChange,
}: {
  readonly Icon: any; readonly title: string; readonly desc: string;
  readonly value: CommunityPrivacy; readonly current: CommunityPrivacy;
  readonly onChange: (v: CommunityPrivacy) => void;
}) {
  const active = value === current;
  return (
    <Pressable onPress={() => onChange(value)}>
      <Card padding={3.5} elevation="none" bordered style={active ? { borderColor: colors.brand[600], borderWidth: 2, backgroundColor: colors.brand[50] } : undefined}>
        <HStack gap={3} align="center">
          <Icon size={20} color={active ? colors.brand[700] : colors.surface.textSecondary} />
          <VStack gap={0.5} style={{ flex: 1 }}>
            <Text variant="body" style={{ fontWeight: '700' }}>{title}</Text>
            <Text variant="caption" tone="secondary">{desc}</Text>
          </VStack>
          {active && (
            <View style={[styles.dot, { backgroundColor: colors.brand[600] }]}>
              <Check size={12} color="#fff" strokeWidth={3} />
            </View>
          )}
        </HStack>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    backgroundColor: colors.surface.background,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.surface.border,
  },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing[5], paddingBottom: spacing[10] },
  input: {
    borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.md,
    paddingHorizontal: spacing[3], paddingVertical: spacing[2.5],
    fontSize: 15, color: colors.surface.foreground, backgroundColor: colors.surface.background,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  catBtn: {
    width: '31%', aspectRatio: 1,
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.surface.border,
    alignItems: 'center', justifyContent: 'center', gap: spacing[1.5],
    padding: spacing[1.5], position: 'relative',
  },
  catCheck: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  footer: {
    padding: spacing[4], paddingBottom: spacing[6], flexDirection: 'row',
    backgroundColor: colors.surface.background,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.surface.border,
  },
});
