import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Heart } from 'lucide-react-native';
import { Button, HStack, Screen, Text, VStack } from '@/components/ui';
import { useProfileStore } from '@/store/profileStore';
import { INTERESTS } from '@/data/onboarding-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const MIN_INTERESTS = 3;

// Standalone "edit interests" screen for EXISTING users (reached from Settings ›
// Edit profile › Manage interests). Unlike the first-run interests.tsx step, this
// screen never routes through roles.tsx/welcome.tsx and never re-triggers account
// creation — it only updates the user's saved interests and returns to Settings.
export default function EditInterestsScreen() {
  const router = useRouter();
  const profileInterests = useProfileStore((s) => s.profile.interests);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [interests, setInterests] = useState<string[]>(profileInterests);

  const toggleInterest = (id: string) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const canContinue = interests.length >= MIN_INTERESTS;

  const save = () => {
    if (!canContinue) return;
    updateProfile({ interests });
    router.back();
  };

  return (
    <Screen padded={false} scroll={false}>
      <HStack gap={3} align="center" style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
          <ArrowLeft size={20} color={colors.surface.heading} />
        </Pressable>
        <Text variant="h3" style={{ flex: 1, color: colors.surface.heading }}>Manage interests</Text>
      </HStack>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <VStack gap={5}>
          <VStack gap={2}>
            <View style={styles.iconBubble}>
              <Heart size={22} color={colors.accent[500]} />
            </View>
            <Text variant="h2">What interests you?</Text>
            <Text variant="body" tone="secondary">
              Pick at least {MIN_INTERESTS} — we’ll tune your feed to show what matters most.
            </Text>
          </VStack>

          <View style={styles.tagsWrap}>
            {INTERESTS.map((tag) => {
              const selected = interests.includes(tag.id);
              const TagIcon = tag.Icon;
              return (
                <Pressable
                  key={tag.id}
                  onPress={() => toggleInterest(tag.id)}
                  style={[
                    styles.tag,
                    selected && {
                      backgroundColor: colors.brand[50],
                      borderColor: colors.brand[600],
                    },
                  ]}
                >
                  <TagIcon size={18} color={selected ? colors.brand[700] : colors.gray[600]} />
                  <Text
                    variant="body"
                    style={{
                      color: selected ? colors.brand[700] : colors.surface.foreground,
                      fontWeight: selected ? '700' : '500',
                    }}
                  >
                    {tag.label}
                  </Text>
                  {selected ? (
                    <View style={styles.tagCheck}>
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </VStack>
      </ScrollView>

      <View style={styles.footer}>
        {!canContinue ? (
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginBottom: spacing[2] }}>
            Pick {Math.max(0, MIN_INTERESTS - interests.length)} more to continue.
          </Text>
        ) : (
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginBottom: spacing[2] }}>
            {interests.length} selected.
          </Text>
        )}
        <Button label="Save" onPress={save} disabled={!canContinue} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.surface.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[6],
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2.5],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.background,
  },
  tagCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[6],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
  },
});
