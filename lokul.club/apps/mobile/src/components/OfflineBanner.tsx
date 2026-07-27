/**
 * OfflineBanner — slim banner shown at the top of screens when offline/2G.
 * Import and render near the top of any screen that fetches live data.
 *
 * Usage:
 *   import { OfflineBanner } from '@/components/OfflineBanner';
 *   <OfflineBanner />
 */
import { StyleSheet, View } from 'react-native';
import { WifiOff, Zap } from 'lucide-react-native';
import { HStack, Text } from '@/components/ui';
import { spacing } from '@lokul/ui-tokens';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline, is2G } = useNetworkStatus();

  if (isOnline && !is2G) return null;

  return (
    <View style={[styles.banner, is2G ? styles.banner2G : styles.bannerOffline]}>
      <HStack gap={2} align="center">
        {is2G
          ? <Zap size={13} color="#92400E" />
          : <WifiOff size={13} color="#991B1B" />
        }
        <Text style={styles.text}>
          {is2G
            ? 'Slow connection — showing cached content'
            : 'You\'re offline — showing cached content'
          }
        </Text>
      </HStack>
    </View>
  );
}

const styles = StyleSheet.create({
  banner:        { paddingHorizontal: spacing[4], paddingVertical: spacing[2], alignItems: 'center' },
  bannerOffline: { backgroundColor: '#FEE2E2' },
  banner2G:      { backgroundColor: '#FEF3C7' },
  text:          { fontSize: 12, fontWeight: '600', color: '#92400E' },
});
