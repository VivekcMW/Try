import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { Text, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

interface NetworkErrorProps {
  /** Custom error message */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Show as inline component instead of full screen */
  inline?: boolean;
}

/**
 * NetworkError component for mobile
 * Shows when network is unavailable or API calls fail
 * Automatically detects online/offline status
 * 
 * @example
 * ```tsx
 * <NetworkError
 *   message="Failed to load posts. Check your connection."
 *   onRetry={() => refetchPosts()}
 * />
 * ```
 */
export function NetworkError({
  message = 'Check your internet connection and try again.',
  onRetry,
  inline = false,
}: NetworkErrorProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const containerStyle = inline
    ? styles.inlineContainer
    : styles.fullScreenContainer;

  return (
    <View style={containerStyle}>
      <VStack gap={4} align="center">
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <WifiOff size={56} color={colors.gray[400]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isConnected === false ? "You're Offline" : 'Connection Error'}
        </Text>

        {/* Description */}
        <Text style={styles.description}>{message}</Text>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  isConnected === false ? colors.red[500] : colors.green[500],
              },
            ]}
          />
          <Text style={styles.statusText}>
            {isConnected === false
              ? 'No Internet Connection'
              : 'Internet Connected'}
          </Text>
        </View>

        {/* Retry Button */}
        {onRetry && (
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
              isConnected === false && styles.buttonDisabled,
            ]}
            onPress={handleRetry}
            disabled={isConnected === false}
          >
            <RefreshCw size={18} color="#ffffff" />
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </Pressable>
        )}
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    backgroundColor: '#ffffff',
  },
  inlineContainer: {
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
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  title: {
    fontSize: 20,
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
    marginBottom: spacing[4],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: 8,
    marginTop: spacing[2],
  },
  retryButtonText: {
    color: '#ffffff',
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
