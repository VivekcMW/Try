import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

export default function BillsLayout() {
  return (
    <FeatureGate featureKey="bill_splitting">
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
