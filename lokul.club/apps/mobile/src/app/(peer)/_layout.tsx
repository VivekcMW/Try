import { Stack } from 'expo-router';
import { FeatureGate } from '@/components/FeatureGate';

export default function PeerLayout() {
  return (
    <FeatureGate featureKey="shop_directory">
      <Stack
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      />
    </FeatureGate>
  );
}
