/**
 * VerificationGate — reusable modal bottom sheet shown whenever a Bronze user
 * tries to perform a transaction (place order, accept booking, payout, publish
 * classified listing, etc.).
 *
 * Usage:
 *   const [gateVisible, setGateVisible] = useState(false);
 *
 *   <VerificationGate
 *     visible={gateVisible}
 *     onClose={() => setGateVisible(false)}
 *     action="place this order"   // optional — customises the body copy
 *   />
 *
 *   // In handler:
 *   if (tier === 'bronze') { setGateVisible(true); return; }
 */
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, X } from 'lucide-react-native';
import { Button, Text, VStack } from '@/components/ui';
import { colors, radius, spacing } from '@lokul/ui-tokens';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Short phrase describing the blocked action, e.g. "place this order". */
  action?: string;
}

export function VerificationGate({ visible, onClose, action = 'do this' }: Props) {
  const router = useRouter();

  const handleVerify = () => {
    onClose();
    router.push('/(verification)/silver-proof');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        {/* Close pill */}
        <View style={styles.pill} />

        {/* Close icon */}
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
          <X size={18} color={colors.surface.textSecondary} />
        </Pressable>

        <VStack gap={4} align="center" style={styles.body}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={36} color={colors.brand[600]} strokeWidth={1.5} />
          </View>

          <VStack gap={2} align="center">
            <Text variant="h3" style={{ textAlign: 'center', color: colors.surface.heading }}>
              Verify to continue
            </Text>
            <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
              To {action}, you need at least Silver verification. It only takes 2 minutes — upload
              one address proof and we'll review within 24 hours.
            </Text>
          </VStack>

          <Button
            label="Start verification"
            onPress={handleVerify}
            fullWidth
            size="lg"
          />
          <Button
            label="Maybe later"
            variant="ghost"
            onPress={onClose}
            fullWidth
          />
        </VStack>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing[8],
    paddingTop: spacing[3],
  },
  pill: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surface.border,
    alignSelf: 'center',
    marginBottom: spacing[2],
  },
  closeBtn: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[4],
    padding: spacing[1],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
});
