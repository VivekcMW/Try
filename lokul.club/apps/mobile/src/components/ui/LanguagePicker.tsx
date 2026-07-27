import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Check, Search, X } from 'lucide-react-native';
import { Text } from './Text';
import { VStack } from './Stack';
import { DEFAULT_LANGUAGE, RTL_LANGUAGES, SUPPORTED_LANGUAGES } from '@/i18n/languageConfig';
import { useLanguageStore } from '@/store/languageStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

type LanguagePickerProps = {
  visible: boolean;
  onClose: () => void;
};

export function LanguagePicker({ visible, onClose }: Readonly<LanguagePickerProps>) {
  const [query, setQuery] = useState('');
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter((item) =>
      `${item.name} ${item.nativeName}`.toLowerCase().includes(q)
    );
  }, [query]);

  const onPick = async (code: string) => {
    await setLanguage(code || DEFAULT_LANGUAGE);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text variant="h3">Language</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={20} color={colors.surface.foreground} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Search size={16} color={colors.surface.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search language"
              placeholderTextColor={colors.surface.textSecondary}
              style={styles.searchInput}
            />
          </View>

          <ScrollView contentContainerStyle={styles.listContent} keyboardShouldPersistTaps="handled">
            <VStack gap={2}>
              {filtered.map((item) => {
                const active = item.code === language;
                return (
                  <Pressable key={item.code} style={styles.row} onPress={() => onPick(item.code)}>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                        {item.nativeName}
                      </Text>
                      <Text variant="caption" tone="secondary">
                        {item.name}
                        {RTL_LANGUAGES.has(item.code) ? ' · RTL' : ''}
                      </Text>
                    </View>
                    {active ? <Check size={18} color={colors.brand[600]} /> : null}
                  </Pressable>
                );
              })}
            </VStack>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    marginBottom: spacing[3],
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.surface.foreground,
  },
  listContent: {
    paddingBottom: spacing[6],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
});
