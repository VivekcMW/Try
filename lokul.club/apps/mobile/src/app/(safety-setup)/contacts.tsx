/**
 * Safety Setup — Step 1: Add Trusted Contacts
 * Route: /(safety-setup)/contacts
 */
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Trash2, UserCheck } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore, type TrustedContact } from '@/store/safetyStore';

const RELATIONS = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Neighbour', 'Other'];

function ContactForm({
  onAdd,
}: {
  readonly onAdd: (c: TrustedContact) => void;
}) {
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [relation, setRelation] = useState('Friend');

  const submit = () => {
    if (!name.trim() || !phone.trim()) return;
    onAdd({
      id:          Date.now().toString(),
      name:        name.trim(),
      phone:       phone.trim(),
      relation,
      notifyBySms: true,
    });
    setName('');
    setPhone('');
  };

  return (
    <VStack gap={2} style={styles.formCard}>
      <Text variant="label" style={{ fontWeight: '700', color: colors.surface.heading }}>
        Add Contact
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={colors.surface.textSecondary}
        value={name}
        onChangeText={setName}
        accessibilityLabel="Contact name"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone number (with country code)"
        placeholderTextColor={colors.surface.textSecondary}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        accessibilityLabel="Phone number"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <HStack gap={2}>
          {RELATIONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => setRelation(r)}
              style={[styles.chip, relation === r && styles.chipActive]}
            >
              <Text style={[styles.chipText, relation === r && styles.chipTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </HStack>
      </ScrollView>
      <Pressable
        onPress={submit}
        style={[styles.addBtn, (!name || !phone) && { opacity: 0.4 }]}
        disabled={!name || !phone}
        accessibilityRole="button"
        accessibilityLabel="Add this contact"
      >
        <HStack gap={2} align="center" justify="center">
          <Plus size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Add Contact</Text>
        </HStack>
      </Pressable>
    </VStack>
  );
}

export default function SetupContactsScreen() {
  const router      = useRouter();
  const contacts    = useSafetyStore((s) => s.contacts);
  const addContact  = useSafetyStore((s) => s.addContact);
  const removeContact = useSafetyStore((s) => s.removeContact);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <VStack gap={1} style={styles.header}>
          <Text style={styles.stepLabel}>Step 1 of 4</Text>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.sub}>
            These people will receive your location and a call when you press SOS. Add at least 1.
          </Text>
        </VStack>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Existing contacts */}
          {contacts.map((c) => (
            <HStack key={c.id} gap={3} align="center" style={styles.contactRow}>
              <View style={styles.avatar}>
                <UserCheck size={18} color={colors.brand[600]} />
              </View>
              <VStack gap={0} style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>
                  {c.name}
                </Text>
                <Text variant="caption" tone="secondary">{c.phone} · {c.relation}</Text>
              </VStack>
              <Pressable
                onPress={() => removeContact(c.id)}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${c.name}`}
              >
                <Trash2 size={18} color={colors.semantic.danger} />
              </Pressable>
            </HStack>
          ))}

          {/* Add form (only if under limit) */}
          {contacts.length < 5 && <ContactForm onAdd={addContact} />}
          {contacts.length >= 5 && (
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginTop: spacing[2] }}>
              Maximum 5 contacts reached
            </Text>
          )}
        </ScrollView>

        {/* Footer */}
        <VStack gap={2} style={styles.footer}>
          <Pressable
            onPress={() => router.push('/(safety-setup)/medical-id')}
            style={[styles.btn, contacts.length === 0 && { opacity: 0.4 }]}
            disabled={contacts.length === 0}
            accessibilityRole="button"
          >
            <Text style={styles.btnText}>
              {contacts.length === 0 ? 'Add at least 1 contact' : 'Next →'}
            </Text>
          </Pressable>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { padding: spacing[5], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  stepLabel: { fontSize: 12, fontWeight: '700', color: colors.brand[600], textTransform: 'uppercase', letterSpacing: 1 },
  title:     { fontSize: 22, fontWeight: '900', color: colors.surface.heading },
  sub:       { fontSize: 14, color: colors.surface.textSecondary, lineHeight: 20 },
  scroll:    { padding: spacing[4], gap: spacing[3] },

  contactRow: { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], marginBottom: spacing[2] },
  avatar:     { width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.brand[600]}15`, alignItems: 'center', justifyContent: 'center' },

  formCard:  { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4], gap: spacing[2], marginTop: spacing[2] },
  input:     { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, padding: spacing[3], fontSize: 15, color: colors.surface.heading },
  chip:      { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, backgroundColor: colors.gray[100], borderWidth: 1, borderColor: 'transparent' },
  chipActive:     { backgroundColor: `${colors.brand[600]}15`, borderColor: colors.brand[600] },
  chipText:       { fontSize: 12, fontWeight: '600', color: colors.surface.textSecondary },
  chipTextActive: { color: colors.brand[600] },
  addBtn:    { backgroundColor: colors.brand[600], borderRadius: radius.lg, paddingVertical: spacing[3], alignItems: 'center' },

  footer:  { padding: spacing[4], backgroundColor: colors.surface.background, borderTopWidth: 1, borderTopColor: colors.surface.border },
  btn:     { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[4], alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
