import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Heart } from 'lucide-react-native';
import {
  Button,
  Screen,
  Text,
  VStack,
} from '@/components/ui';
import { useOnboardingStore } from '@/store/onboardingStore';
import { INTERESTS } from '@/data/onboarding-seed';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const MIN_INTERESTS = 3;

export default function CommunityInterestsScreen() {
  const router = useRouter();
  const { interests, toggleInterest } = useOnboardingStore();

  const remaining = Math.max(0, MIN_INTERESTS - interests.length);
  const canContinue = interests.length >= MIN_INTERESTS;

  const submit = () => {
    if (!canContinue) return;
    router.push('/(community-setup)/roles');
  };

  return (
    <Screen padded={false} scroll={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <VStack gap={5}>
          <VStack gap={2}>
            <View style={styles.iconBubble}>
              <Heart size={22} color={colors.accent[500]} />
            </View>
            <Text variant="h2">What interests you?</Text>
            <Text variant="body" tone="secondary">
              Pick at least {MIN_INTERESTS} — we&apos;ll tune your feed to show what matters most. You can
              always change this later.
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
            Pick {remaining} more to continue.
          </Text>
        ) : (
          <Text variant="caption" tone="secondary" style={{ textAlign: 'center', marginBottom: spacing[2] }}>
            Nice — {interests.length} selected.
          </Text>
        )}
        <Button label="Continue" onPress={submit} disabled={!canContinue} fullWidth size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
