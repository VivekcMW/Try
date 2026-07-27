import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="thread/[id]" />
      <Stack.Screen name="new-dm" />
      <Stack.Screen name="call" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
