import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';
import { FeatureGate } from '@/components/FeatureGate';

export default function TelemedicineLayout() {
  return (
    <FeatureGate featureKey="telemedicine">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="instant" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="symptoms" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="medicines" />
        <Stack.Screen name="labs" />
        <Stack.Screen name="doctor/[id]" />
        <Stack.Screen name="appointment/[id]" />
        <Stack.Screen name="upload" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="record/[id]" />
      </Stack>
    </FeatureGate>
  );
}
