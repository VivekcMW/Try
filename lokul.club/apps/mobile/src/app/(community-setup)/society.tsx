import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Check, Plus, Search } from 'lucide-react-native';
import {
  Button,
  HStack,
  Input,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { SOCIETIES, type Society } from '@/data/onboarding-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

export default function CommunitySocietyPickerScreen() {
  const router = useRouter();
  const { pin, societyId, setSociety } = useOnboardingStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(societyId);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...SOCIETIES].sort((a, b) => {
      const aSame = a.pin === pin ? 0 : 1;
      const bSame = b.pin === pin ? 0 : 1;
      return aSame - bSame;
    });
    if (!q) return sorted;
    return sorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.pin.includes(q)
    );
  }, [query, pin]);

  const submit = () => {
    const society = SOCIETIES.find((s) => s.id === selected);
    if (!society) return;
    setSociety({ id: society.id, name: society.name });
    router.push('/(community-setup)/tower-flat');
  };

  const requestNewSociety = () => {
    // Stub — real flow: open a form drawer to submit name + RWA email for review (FR-1.11).
    router.push('/(community-setup)/tower-flat');
  };

  return (
    <Screen padded={false} keyboardAvoiding={false}>
      <VStack gap={4} style={styles.body}>
        <VStack gap={2}>
          <Text variant="h2">Pick your society</Text>
          <Text variant="body" tone="secondary">
            Showing societies near{' '}
            <Text variant="body" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
              {pin || 'your area'}
            </Text>
            . Can&apos;t find yours? Add it or skip below.
          </Text>
        </VStack>

        <Input
          placeholder="Search by name, city or PIN"
          value={query}
          onChangeText={setQuery}
          leftIcon={<Search size={18} color={colors.surface.textSecondary} />}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        <FlatList
          data={results}
          keyExtractor={(s) => s.id}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
          contentContainerStyle={{ paddingBottom: spacing[4] }}
          renderItem={({ item }) => (
            <SocietyRow
              society={item}
              selected={selected === item.id}
              onPress={() => setSelected(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
                No societies match &quot;{query}&quot;.
              </Text>
            </View>
          }
          ListFooterComponent={
            <Pressable onPress={requestNewSociety} style={styles.notListed}>
              <View style={styles.notListedIcon}>
                <Plus size={18} color={colors.brand[600]} />
              </View>
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="body" style={{ color: colors.surface.foreground, fontWeight: '600' }}>
                  Add my society — it&apos;s not listed yet
                </Text>
                <Text variant="caption" tone="secondary">
                  Add it — we review new societies within 48 hours.
                </Text>
              </VStack>
            </Pressable>
          }
        />
      </VStack>

      <View style={styles.footer}>
        <Button label="Continue" onPress={submit} disabled={!selected} fullWidth size="lg" />
        <Pressable onPress={() => router.push('/(community-setup)/done')} style={styles.skipLink}>
          <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
            Skip — I&apos;ll use just my PIN code
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function SocietyRow({
  society,
  selected,
  onPress,
}: Readonly<{
  society: Society;
  selected: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.row,
        selected && { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
      ]}
    >
      <View style={styles.rowIcon}>
        <Building2 size={20} color={colors.brand[600]} />
      </View>
      <VStack gap={0} style={{ flex: 1 }}>
        <Text variant="body" style={{ color: colors.surface.heading, fontWeight: '600' }}>
          {society.name}
        </Text>
        <Text variant="caption" tone="secondary">
          {society.city} · {society.pin}
        </Text>
      </VStack>
      {selected ? (
        <View style={styles.check}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    paddingVertical: spacing[6],
  },
  notListed: {
    marginTop: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brand[200],
    backgroundColor: colors.brand[50],
  },
  notListedIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
  },
  skipLink: {
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
});
