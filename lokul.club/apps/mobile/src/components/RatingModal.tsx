// Reusable post-transaction rating modal
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { Button, HStack, Text, VStack } from '@/components/ui';
import { useWalletStore } from '@/store/walletStore';
import { colors, radius, spacing } from '@lokul/ui-tokens';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type Props = {
  visible:    boolean;
  orderId:    string;
  sellerName: string;
  onClose:    () => void;
  onDone:     () => void;
};

export function RatingModal({ visible, orderId, sellerName, onClose, onDone }: Props) {
  const userId  = useWalletStore((s) => s.userId);
  const [score,       setScore]       = useState(0);
  const [hovered,     setHovered]     = useState(0);
  const [review,      setReview]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);

  const displayScore = hovered || score;

  async function handleSubmit() {
    if (score === 0) { Alert.alert('Select a rating', 'Tap a star to rate.'); return; }
    if (!userId)     return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE}/api/mobile/ratings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId, raterId: userId, score, review: review.trim() || null }),
      });
      if (res.ok) { onDone(); }
      else {
        const data = await res.json();
        Alert.alert('Error', data.error ?? 'Failed to submit rating.');
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Close */}
          <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
            <X size={18} color={colors.surface.textSecondary} />
          </Pressable>

          <VStack gap={4} align="center">
            <Text variant="h3" style={{ textAlign: 'center', color: colors.surface.heading }}>
              Rate your experience
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              How was your service from {sellerName}?
            </Text>

            {/* Stars */}
            <HStack gap={2} align="center">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  onPressIn={() => setHovered(n)}
                  onPressOut={() => setHovered(0)}
                  onPress={() => setScore(n)}
                  accessibilityRole="button"
                  accessibilityLabel={`${n} star`}
                  style={{ padding: spacing[1] }}
                >
                  <Star
                    size={38}
                    color={n <= displayScore ? '#FBBF24' : colors.gray[200]}
                    fill={n <= displayScore ? '#FBBF24' : 'transparent'}
                  />
                </Pressable>
              ))}
            </HStack>

            {displayScore > 0 && (
              <Text variant="body" style={{ fontWeight: '700', color: colors.brand[600] }}>
                {LABELS[displayScore]}
              </Text>
            )}

            {/* Review */}
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="Write a short review (optional)"
              placeholderTextColor={colors.surface.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={300}
              style={styles.textArea}
            />

            <Button
              label="Submit Rating"
              loading={submitting}
              onPress={handleSubmit}
              disabled={submitting || score === 0}
              style={{ width: '100%' }}
            />
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  closeBtn: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    padding: spacing[1],
  },
  textArea: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: radius.md,
    padding: spacing[3],
    color: colors.surface.heading,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
