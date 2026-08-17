import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

export default function SportsLayout() {
  return (
    <FeatureGate featureKey="sports_groups">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="league/[id]" />
        <Stack.Screen name="create-team" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="team/[id]" />
        <Stack.Screen name="create-profile" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </FeatureGate>
  );
}
