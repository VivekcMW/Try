import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Search, User, X } from 'lucide-react-native';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useWalletStore } from '@/store/walletStore';
import { colors, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

interface Resident { id: string; name: string; flat?: string; tower?: string; }

export default function NewDmScreen() {
  const router  = useRouter();
  const userId  = useWalletStore((s) => s.userId);
  const pinCode = useOnboardingStore((s) => s.pin);
  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState<Resident[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const search = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = `${BASE}/api/mobile/search?q=${encodeURIComponent(q)}&pinCode=${pinCode ?? ''}`;
      const res  = await fetch(url);
      const data = await res.json();
      setResults((data.users ?? []).filter((r: Resident) => r.id !== userId));
    } catch { setResults([]); } finally { setLoading(false); }
  }, [pinCode, userId]);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  const toggle = (id: string) => setSelected((prev) => (prev === id ? null : id));

  const handleStart = async () => {
    if (!selected || !userId) return;
    setStarting(true);
    try {
      const res  = await fetch(`${BASE}/api/mobile/chat/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, recipientId: selected }),
      });
      const data = await res.json();
      if (data.id) router.replace(`/(chat)/thread/${data.id}` as never);
    } catch { /* noop */ } finally { setStarting(false); }
  };

  const filtered = results;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityRole="button">
          <X size={20} color={colors.surface.heading} />
        </Pressable>
        <Text style={styles.titleText}>New Message</Text>
        <TouchableOpacity
          style={[styles.startBtn, (!selected || starting) && styles.startBtnDisabled]}
          disabled={!selected || starting}
          onPress={handleStart}
          activeOpacity={0.7}
        >
          {starting
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={[styles.startBtnText, !selected && styles.startBtnTextDisabled]}>Start</Text>}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Search size={16} color={colors.surface.textSecondary} style={{ position: 'absolute', left: spacing[4], zIndex: 1 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resident by name…"
          placeholderTextColor={colors.surface.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: spacing[8] }} color={colors.brand[600]} />
      ) : (
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingBottom: spacing[16] }}
        renderItem={({ item }) => {
          const isSelected = selected === item.id;
          return (
            <Pressable
              onPress={() => toggle(item.id)}
              accessibilityRole="button"
              style={({ pressed }) => pressed ? { backgroundColor: colors.gray[50] } : undefined}
            >
              <View style={styles.row}>
                <View style={styles.avatarSlot}>
                  <User size={18} color={colors.gray[500]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  {item.flat && <Text style={styles.subText}>{item.flat}{item.tower ? ` · ${item.tower}` : ''}</Text>}
                </View>
                <View style={[styles.checkCircle, isSelected && styles.checkCircleActive]}>
                  {isSelected && <Check size={14} color="#fff" />}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.subText, { textAlign: 'center', marginTop: spacing[8] }]}>
            {query ? 'No residents found' : 'Type a name to search'}
          </Text>
        }
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  titleText: {
    flex: 1, fontSize: 17, fontWeight: '700', color: colors.surface.heading,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  startBtn: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[2],
    backgroundColor: colors.brand[600], borderRadius: 20,
  },
  startBtnDisabled: { backgroundColor: colors.gray[200] },
  startBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  startBtnTextDisabled: { color: colors.gray[400] },
  searchRow: {
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  searchInput: {
    backgroundColor: colors.gray[100], borderRadius: 20,
    paddingHorizontal: spacing[10], paddingVertical: spacing[2.5],
    fontSize: 14, color: colors.surface.heading,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[5], paddingVertical: spacing[4],
    borderBottomWidth: 0.5, borderBottomColor: colors.surface.border,
  },
  avatarSlot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center',
  },
  nameText: { fontSize: 15, fontWeight: '700', color: colors.surface.heading, marginBottom: 2 },
  subText: { fontSize: 13, color: colors.surface.textSecondary },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.gray[300],
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: colors.brand[600], borderColor: colors.brand[600],
  },
});
