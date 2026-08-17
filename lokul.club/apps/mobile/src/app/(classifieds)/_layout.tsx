import { Stack } from 'expo-router';
import { FeatureGate } from '@/components/FeatureGate';

export default function ClassifiedsLayout() {
  return (
    <FeatureGate featureKey="classifieds">
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </FeatureGate>
  );
}
