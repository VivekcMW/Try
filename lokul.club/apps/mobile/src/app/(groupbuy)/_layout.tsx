import { Stack } from 'expo-router';
import { FeatureGate } from '@/components/FeatureGate';

export default function GroupBuyLayout() {
  return (
    <FeatureGate featureKey="group_buying">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureGate>
  );
}
