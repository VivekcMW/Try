import { Stack } from 'expo-router';
export default function DiscoverLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="search" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
