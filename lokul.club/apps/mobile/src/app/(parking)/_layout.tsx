import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

export default function ParkingLayout() {
  return (
    <FeatureGate featureKey="parking_sharing">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface.background },
          animation: 'slide_from_right',
        }}
      />
    </FeatureGate>
  );
}
