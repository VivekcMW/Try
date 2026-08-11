import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="compose" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="create-story" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="story/[id]" options={{ animation: 'fade', presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
