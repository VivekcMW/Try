import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

export default function InsuranceLayout() {
  return (
    <FeatureGate featureKey="insurance">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      />
    </FeatureGate>
  );
}
