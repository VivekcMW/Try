import { Stack } from 'expo-router';

export default function VerificationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="silver-proof" />
      <Stack.Screen name="silver-upload" />
      <Stack.Screen name="silver-review" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="silver-granted"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
      <Stack.Screen name="gold-consent" />
      <Stack.Screen name="gold-liveness" options={{ gestureEnabled: false }} />
      <Stack.Screen
        name="gold-granted"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
    </Stack>
  );
}
