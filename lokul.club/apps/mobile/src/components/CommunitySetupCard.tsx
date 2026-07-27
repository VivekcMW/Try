import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { HStack, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface CommunitySetupCardProps {
  onPress: () => void;
}

/**
 * Nudge banner shown on Profile tab when the user has no societyId set.
 * Routes to /(community-setup)/ to begin community mapping.
 */
export function CommunitySetupCard({ onPress }: CommunitySetupCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <HStack gap={3} align="center">
        <View style={styles.iconWrap}>
          <MapPin size={22} color={colors.brand[600]} />
        </View>
        <VStack gap={0.5} style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: '700', color: '#92400E' }}>
            Map your community
          </Text>
          <Text variant="caption" style={{ color: '#B45309' }}>
            Add your address to unlock notices, polls & society features
          </Text>
        </VStack>
        <ChevronRight size={18} color="#92400E" />
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#FEF9C3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
