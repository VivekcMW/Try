import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { EmptyState } from '@/components/ui';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { colors } from '@lokul/ui-tokens';

/**
 * Blocks a route group's navigator when its admin-controlled feature flag is
 * disabled. Fails open while flags are still loading to avoid a startup flash.
 */
export function FeatureGate({ featureKey, children }: { featureKey: string; children: ReactNode }) {
  const router = useRouter();
  const { isEnabled, loading } = useFeatureFlags();

  if (!loading && !isEnabled(featureKey)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.surface.background }}>
        <EmptyState
          icon={Lock}
          title="Not available yet"
          description="This feature has been temporarily turned off by the Lokul team."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return <>{children}</>;
}
