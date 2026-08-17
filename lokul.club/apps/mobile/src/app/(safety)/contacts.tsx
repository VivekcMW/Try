/**
 * Manage Trusted Contacts
 * Route: /(safety)/contacts
 *
 * Full CRUD for trusted contacts — list, add new, edit, delete.
 * Syncs to /api/mobile/safety/contacts on save/delete.
 */
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  Pencil,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';
import { useSafetyStore, type TrustedContact } from '@/store/safetyStore';
import { useWalletStore } from '@/store/walletStore';
import { FeatureGate } from '@/components/FeatureGate';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';
const MAX_CONTACTS = 5;

const RELATIONS = ['Family', 'Friend', 'Colleague', 'Neighbour', 'Other'] as const;
type Relation = typeof RELATIONS[number];

type DraftContact = {
  id: string | null;
  name: string;
  phone: string;
  relation: Relation;
  notifyBySms: boolean;
};

const empty = (): DraftContact => ({ id: null, name: '', phone: '', relation: 'Family', notifyBySms: true });

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  readonly contact: TrustedContact;
  readonly onEdit: (c: TrustedContact) => void;
  readonly onDelete: (id: string) => void;
}) {
  return (
    <View style={styles.contactCard}>
      <HStack gap={3} align="center">
        <View style={styles.avatar}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.brand[600] }}>
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <VStack gap={0} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700', color: colors.surface.heading }}>{contact.name}</Text>
          <HStack gap={2} align="center">
            <Phone size={11} color={colors.surface.textSecondary} />
            <Text variant="caption" tone="secondary">{contact.phone}</Text>
            <View style={styles.relationBadge}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.brand[600] }}>{contact.relation}</Text>
            </View>
          </HStack>
        </VStack>
        <HStack gap={1}>
          <Pressable onPress={() => onEdit(contact)} hitSlop={8} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={`Edit ${contact.name}`}>
            <Pencil size={14} color={colors.brand[600]} />
          </Pressable>
          <Pressable onPress={() => onDelete(contact.id)} hitSlop={8} style={[styles.iconBtn, { backgroundColor: '#FEF2F2' }]} accessibilityRole="button" accessibilityLabel={`Delete ${contact.name}`}>
            <Trash2 size={14} color="#DC2626" />
          </Pressable>
        </HStack>
      </HStack>
    </View>
  );
}

function ContactForm({
  draft,
  onChange,
  onSave,
  onCancel,
  saving,
}: {
  readonly draft: DraftContact;
  readonly onChange: (d: DraftContact) => void;
  readonly onSave: () => void;
  readonly onCancel: () => void;
  readonly saving: boolean;
}) {
  const isValid = draft.name.trim() && draft.phone.trim().length >= 10;
  return (
    <View style={styles.formCard}>
      <HStack gap={2} align="center" justify="between" style={{ marginBottom: spacing[3] }}>
        <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>
          {draft.id ? 'Edit Contact' : 'New Contact'}
        </Text>
        <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel">
          <X size={18} color={colors.surface.textSecondary} />
        </Pressable>
      </HStack>

      <VStack gap={2}>
        <HStack gap={2} align="center" style={styles.inputRow}>
          <User size={14} color={colors.surface.textSecondary} />
          <TextInput
            style={styles.inputFlat}
            placeholder="Full name"
            placeholderTextColor={colors.surface.textSecondary}
            value={draft.name}
            onChangeText={(v) => onChange({ ...draft, name: v })}
            accessibilityLabel="Contact name"
          />
        </HStack>
        <HStack gap={2} align="center" style={styles.inputRow}>
          <Phone size={14} color={colors.surface.textSecondary} />
          <TextInput
            style={styles.inputFlat}
            placeholder="Phone number"
            placeholderTextColor={colors.surface.textSecondary}
            keyboardType="phone-pad"
            value={draft.phone}
            onChangeText={(v) => onChange({ ...draft, phone: v })}
            accessibilityLabel="Contact phone"
          />
        </HStack>

        <HStack gap={2} style={{ flexWrap: 'wrap' }}>
          {RELATIONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => onChange({ ...draft, relation: r })}
              style={[styles.relChip, draft.relation === r && styles.relChipActive]}
              accessibilityRole="radio"
              accessibilityState={{ checked: draft.relation === r }}
            >
              <Text style={[styles.relText, draft.relation === r && styles.relTextActive]}>{r}</Text>
            </Pressable>
          ))}
        </HStack>

        <Pressable
          onPress={onSave}
          style={[styles.saveBtn, (!isValid || saving) && { opacity: 0.4 }]}
          disabled={!isValid || saving}
          accessibilityRole="button"
        >
          <Check size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800' }}>{saving ? 'Saving…' : 'Save Contact'}</Text>
        </Pressable>
      </VStack>
    </View>
  );
}

export default function ContactsScreen() {
  return (
    <FeatureGate featureKey="safety_contacts">
      <ContactsScreenInner />
    </FeatureGate>
  );
}

function ContactsScreenInner() {
  const router   = useRouter();
  const userId   = useWalletStore((s) => s.userId);
  const contacts = useSafetyStore((s) => s.contacts);
  const addContact    = useSafetyStore((s) => s.addContact);
  const updateContact = useSafetyStore((s) => s.updateContact);
  const removeContact = useSafetyStore((s) => s.removeContact);

  const [draft,  setDraft]  = useState<DraftContact | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew  = () => setDraft(empty());
  const openEdit = (c: TrustedContact) =>
    setDraft({ id: c.id, name: c.name, phone: c.phone, relation: c.relation as Relation, notifyBySms: c.notifyBySms });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    if (draft.id) {
      // Update
      updateContact(draft.id, { name: draft.name, phone: draft.phone, relation: draft.relation, notifyBySms: draft.notifyBySms });
    } else {
      // Add
      const id = `c-${Date.now()}`;
      addContact({ id, name: draft.name, phone: draft.phone, relation: draft.relation, notifyBySms: draft.notifyBySms });
      try {
        await fetch(`${BASE}/api/mobile/safety/contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, contact: { id, name: draft.name, phone: draft.phone, relation: draft.relation, notifyBySms: draft.notifyBySms } }),
        });
      } catch { /* offline */ }
    }
    setSaving(false);
    setDraft(null);
  };

  const del = async (id: string) => {
    removeContact(id);
    try {
      await fetch(`${BASE}/api/mobile/safety/contacts?userId=${userId}&id=${id}`, { method: 'DELETE' });
    } catch { /* offline */ }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <HStack gap={3} align="center" style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={22} color={colors.surface.heading} />
        </Pressable>
        <HStack gap={2} align="center" style={{ flex: 1 }}>
          <Users size={18} color={colors.brand[600]} />
          <Text variant="body" style={{ fontWeight: '800', color: colors.surface.heading }}>Trusted Contacts</Text>
        </HStack>
        <Text variant="caption" tone="secondary">{contacts.length}/{MAX_CONTACTS}</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.body}>
        {contacts.length === 0 && !draft && (
          <VStack gap={3} align="center" style={styles.empty}>
            <Users size={40} color={colors.gray[300]} />
            <Text variant="body" style={{ fontWeight: '700', color: colors.surface.textSecondary }}>No contacts yet</Text>
            <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
              Add trusted people who will be alerted if you trigger SOS or miss a journey check-in.
            </Text>
          </VStack>
        )}

        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} onEdit={openEdit} onDelete={del} />
        ))}

        {draft && (
          <ContactForm
            draft={draft}
            onChange={setDraft}
            onSave={save}
            onCancel={() => setDraft(null)}
            saving={saving}
          />
        )}

        {!draft && contacts.length < MAX_CONTACTS && (
          <Pressable onPress={openNew} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add trusted contact">
            <Plus size={18} color={colors.brand[600]} />
            <Text style={{ color: colors.brand[600], fontWeight: '700', fontSize: 15 }}>Add Contact</Text>
          </Pressable>
        )}

        {contacts.length >= MAX_CONTACTS && !draft && (
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center' }}>
            Maximum of {MAX_CONTACTS} contacts reached.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.surface.surfaceMuted },
  header: { paddingHorizontal: spacing[4], paddingVertical: spacing[3], backgroundColor: colors.surface.background, borderBottomWidth: 1, borderBottomColor: colors.surface.border },
  backBtn:{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  body:   { padding: spacing[4], gap: spacing[3], paddingBottom: spacing[16] },

  contactCard:  { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },
  avatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: `${colors.brand[600]}10`, alignItems: 'center', justifyContent: 'center' },
  relationBadge:{ backgroundColor: `${colors.brand[600]}10`, paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: radius.sm },
  iconBtn:      { width: 32, height: 32, borderRadius: 16, backgroundColor: `${colors.brand[600]}10`, alignItems: 'center', justifyContent: 'center' },

  formCard:  { backgroundColor: colors.surface.background, borderRadius: radius.xl, padding: spacing[4] },
  inputRow:  { borderWidth: 1, borderColor: colors.surface.border, borderRadius: radius.lg, paddingHorizontal: spacing[3] },
  inputFlat: { flex: 1, padding: spacing[3], fontSize: 15, color: colors.surface.heading },

  relChip:     { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, backgroundColor: colors.gray[100], borderWidth: 1.5, borderColor: 'transparent' },
  relChipActive:{ backgroundColor: `${colors.brand[600]}10`, borderColor: colors.brand[600] },
  relText:     { fontSize: 12, fontWeight: '700', color: colors.surface.textSecondary },
  relTextActive:{ color: colors.brand[600] },

  saveBtn: { backgroundColor: colors.brand[600], borderRadius: radius.xl, paddingVertical: spacing[3], flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center', marginTop: spacing[2] },

  addBtn: { flexDirection: 'row', gap: spacing[2], alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: `${colors.brand[600]}40`, borderStyle: 'dashed', borderRadius: radius.xl, paddingVertical: spacing[4] },
  empty:  { paddingVertical: spacing[10] },
});
