import { Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Icon color (default: gray-400) */
  iconColor?: string;
  /** Background color for icon circle (default: gray-50) */
  iconBgColor?: string;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Primary action button label */
  actionLabel?: string;
  /** Primary action handler */
  onAction?: () => void;
  /** Secondary action button label */
  secondaryActionLabel?: string;
  /** Secondary action handler */
  onSecondaryAction?: () => void;
  /** Disable primary action button */
  disabled?: boolean;
}

/**
 * EmptyState component for mobile
 * Displays a consistent empty state UI with icon, title, description, and optional action buttons
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={ShoppingBag}
 *   iconColor={colors.brand[600]}
 *   iconBgColor={colors.brand[50]}
 *   title="No Orders Yet"
 *   description="Browse trusted local services and make your first order."
 *   actionLabel="Browse Services"
 *   onAction={() => router.push('/(marketplace)')}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  iconColor = colors.gray[400],
  iconBgColor = colors.gray[50],
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  disabled = false,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <VStack gap={4} align="center">
        {/* Icon Circle */}
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          <Icon size={48} color={iconColor} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}

        {/* Action Buttons */}
        {(actionLabel || secondaryActionLabel) && (
          <VStack gap={3} style={styles.actionsContainer}>
            {actionLabel && onAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                  disabled && styles.buttonDisabled,
                ]}
                onPress={onAction}
                disabled={disabled}
              >
                <Text style={styles.primaryButtonText}>{actionLabel}</Text>
              </Pressable>
            )}

            {secondaryActionLabel && onSecondaryAction && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onSecondaryAction}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryActionLabel}
                </Text>
              </Pressable>
            )}
          </VStack>
        )}
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
    minHeight: 300,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  description: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: spacing[2],
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 280,
    marginTop: spacing[4],
  },
  primaryButton: {
    backgroundColor: colors.brand[600],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: colors.brand[600],
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
