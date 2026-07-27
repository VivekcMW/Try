import { Stack } from 'expo-router';

export default function SafetyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {/* Hub */}
      <Stack.Screen name="hub" />
      {/* Existing screens */}
      <Stack.Screen name="alert-compose" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="sos-active" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      <Stack.Screen name="incident/[id]" />
      <Stack.Screen name="guardian" options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
      {/* New screens */}
      <Stack.Screen name="journey" />
      <Stack.Screen name="evidence" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="incident-report" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="call-help" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="medical-id" />
      <Stack.Screen name="volunteer" />
    </Stack>
  );
}
