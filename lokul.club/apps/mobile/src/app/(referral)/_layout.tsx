import { Stack } from 'expo-router';

export default function ReferralLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="refer" />
    </Stack>
  );
}
