import { useEffect, useRef } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';
import {
  AlertTriangle,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  Hourglass,
  MapPin,
  Navigation,
  Phone,
  ShoppingBag,
  ThumbsUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors, fontSize, radius, spacing } from '@lokul/ui-tokens';

export type TrackerStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'disputed';

interface OrderTrackerProps {
  status: TrackerStatus;
  deliveryMode: string;
  estimatedReadyAt?: string | null;
  deliveryAddress?: string | null;
  merchantName: string;
  shopAddress?: string;
  pickupCode?: string;
  onCallShop?: () => void;
}

const HERO: Record<TrackerStatus, { Icon: LucideIcon; iconColor: string; title: string; sub: (p: OrderTrackerProps) => string }> = {
  pending: {
    Icon: Hourglass,
    iconColor: colors.accent[600],
    title: 'Waiting for shop to accept',
    sub: () => 'Shops usually accept within 5 minutes',
  },
  confirmed: {
    Icon: ThumbsUp,
    iconColor: colors.brand[600],
    title: 'Shop accepted your order!',
    sub: (p) => (p.estimatedReadyAt ? `Estimated ready by ${formatTime(p.estimatedReadyAt)}` : 'Getting started on it now'),
  },
  in_progress: {
    Icon: ChefHat,
    iconColor: colors.brand[600],
    title: 'Your order is being prepared',
    sub: (p) => (p.estimatedReadyAt ? `Estimated ready by ${formatTime(p.estimatedReadyAt)}` : 'Almost there'),
  },
  out_for_delivery: {
    Icon: Bike,
    iconColor: colors.brand[600],
    title: 'On the way!',
    sub: (p) => (p.deliveryAddress ? `Delivering to ${p.deliveryAddress}` : 'Your order will reach you soon'),
  },
  ready_for_pickup: {
    Icon: ShoppingBag,
    iconColor: colors.brand[600],
    title: 'Ready! Come and collect',
    sub: (p) => `Show your pickup code at ${p.merchantName}`,
  },
  completed: {
    Icon: CheckCircle2,
    iconColor: colors.semantic.success,
    title: 'Order completed',
    sub: (p) => (p.deliveryMode === 'delivery' ? 'Delivered. Enjoy!' : 'Collected. Enjoy!'),
  },
  cancelled: {
    Icon: XCircle,
    iconColor: colors.semantic.danger,
    title: 'Order cancelled',
    sub: () => 'Any payment made will be refunded',
  },
  disputed: {
    Icon: AlertTriangle,
    iconColor: colors.semantic.warning,
    title: 'Order under review',
    sub: () => 'Our team is looking into this order',
  },
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function OrderTracker(props: Readonly<OrderTrackerProps>) {
  const { status, deliveryMode, merchantName, shopAddress, pickupCode, onCallShop } = props;
  const isPickup = deliveryMode !== 'delivery';
  const hero = HERO[status];
  const pulse = useRef(new Animated.Value(1)).current;

  // Gentle pulse on the hero icon for active (non-terminal) states
  useEffect(() => {
    if (status === 'completed' || status === 'cancelled') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [status, pulse]);

  const fulfilStepLabel = isPickup ? 'Ready for pickup' : 'Out for delivery';
  const doneStepLabel = isPickup ? 'Collected' : 'Delivered';

  const steps = [
    { label: 'Order placed', state: 'done' as StepState },
    {
      label: status === 'pending' ? 'Shop accepting…' : 'Shop accepted',
      state: stepState(status, ['pending'], ['confirmed', 'in_progress', 'out_for_delivery', 'ready_for_pickup', 'completed']),
    },
    {
      label: 'Preparing your order',
      state: stepState(status, ['confirmed', 'in_progress'], ['out_for_delivery', 'ready_for_pickup', 'completed']),
    },
    {
      label: fulfilStepLabel,
      state: stepState(status, ['out_for_delivery', 'ready_for_pickup'], ['completed']),
    },
    {
      label: doneStepLabel,
      state: status === 'completed' ? ('done' as StepState) : ('todo' as StepState),
    },
  ];

  const openDirections = () => {
    const q = encodeURIComponent(shopAddress ?? merchantName);
    Linking.openURL(`https://maps.google.com/?q=${q}`);
  };

  return (
    <View style={styles.wrap}>
      {/* Hero */}
      <View style={styles.hero}>
        <Animated.View style={[styles.heroIconWrap, { transform: [{ scale: pulse }] }]}>
          <hero.Icon size={32} color={hero.iconColor} strokeWidth={2.2} />
        </Animated.View>
        <Text style={styles.heroTitle}>{hero.title}</Text>
        <Text style={styles.heroSub}>{hero.sub(props)}</Text>
      </View>

      {/* Timeline */}
      {status !== 'cancelled' && status !== 'disputed' && (
        <View style={styles.timeline}>
          {steps.map((step, i) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={styles.stepRail}>
                <View
                  style={[
                    styles.dot,
                    step.state === 'done' && styles.dotDone,
                    step.state === 'active' && styles.dotActive,
                  ]}
                />
                {i < steps.length - 1 && (
                  <View style={[styles.rail, step.state === 'done' && styles.railDone]} />
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  step.state === 'done' && styles.stepLabelDone,
                  step.state === 'active' && styles.stepLabelActive,
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Pickup card */}
      {isPickup && status === 'ready_for_pickup' && (
        <View style={styles.pickupCard}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.pickupLabel}>Pickup from</Text>
            <Text style={styles.pickupShop}>{merchantName}</Text>
            {!!shopAddress && <Text style={styles.pickupAddr}>{shopAddress}</Text>}
            {!!pickupCode && (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Show this code</Text>
                <Text style={styles.codeText}>{pickupCode}</Text>
              </View>
            )}
          </View>
          <View style={{ gap: spacing[2] }}>
            <Pressable style={styles.actionBtn} onPress={openDirections} accessibilityRole="button" accessibilityLabel="Get directions">
              <Navigation size={16} color={colors.brand[600]} />
            </Pressable>
            {!!onCallShop && (
              <Pressable style={styles.actionBtn} onPress={onCallShop} accessibilityRole="button" accessibilityLabel="Call shop">
                <Phone size={16} color={colors.brand[600]} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* ETA card for delivery */}
      {!isPickup && !!props.estimatedReadyAt && !['completed', 'cancelled', 'pending'].includes(status) && (
        <View style={styles.etaCard}>
          <Clock size={18} color={colors.brand[600]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.etaLabel}>Estimated delivery</Text>
            <Text style={styles.etaTime}>{formatTime(props.estimatedReadyAt)}</Text>
          </View>
          {!!props.deliveryAddress && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: '45%' }}>
              <MapPin size={14} color={colors.surface.textSecondary} />
              <Text style={styles.etaAddr} numberOfLines={2}>{props.deliveryAddress}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

type StepState = 'done' | 'active' | 'todo';

function stepState(status: TrackerStatus, activeIn: TrackerStatus[], doneIn: TrackerStatus[]): StepState {
  if (doneIn.includes(status)) return 'done';
  if (activeIn.includes(status)) return 'active';
  return 'todo';
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    backgroundColor: colors.surface.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surface.border,
    overflow: 'hidden',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    gap: spacing[1.5],
    backgroundColor: colors.brand[50],
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.surface.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  heroTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.surface.heading,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: colors.surface.textSecondary,
    textAlign: 'center',
  },
  timeline: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  stepRail: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.surface.background,
    marginTop: 2,
  },
  dotDone: {
    borderColor: colors.semantic.success,
    backgroundColor: colors.semantic.success,
  },
  dotActive: {
    borderColor: colors.brand[600],
    backgroundColor: colors.brand[100],
  },
  rail: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: colors.gray[200],
    marginVertical: 2,
  },
  railDone: {
    backgroundColor: colors.semantic.success,
  },
  stepLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.surface.textDisabled,
    paddingBottom: spacing[3],
  },
  stepLabelDone: {
    color: colors.surface.heading,
  },
  stepLabelActive: {
    color: colors.brand[600],
    fontWeight: '700',
  },
  pickupCard: {
    flexDirection: 'row',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[3.5],
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  pickupLabel: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  pickupShop: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.surface.heading,
  },
  pickupAddr: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  codeBox: {
    marginTop: spacing[2],
    padding: spacing[2.5],
    backgroundColor: colors.brand[50],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.brand[200],
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: colors.surface.textSecondary,
  },
  codeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.brand[700],
    letterSpacing: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.brand[50],
    borderWidth: 1,
    borderColor: colors.brand[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    padding: spacing[3.5],
    backgroundColor: colors.surface.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surface.border,
  },
  etaLabel: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
  },
  etaTime: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.brand[600],
  },
  etaAddr: {
    fontSize: fontSize.xs,
    color: colors.surface.textSecondary,
    flexShrink: 1,
  },
});
