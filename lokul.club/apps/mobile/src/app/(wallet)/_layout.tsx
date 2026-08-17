import { Stack } from 'expo-router';
import { FeatureGate } from '@/components/FeatureGate';
export default function WalletLayout() {
  return (
    <FeatureGate featureKey="wallet">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureGate>
  );
}
