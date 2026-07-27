import { Stack } from 'expo-router';

export default function ClassifiedsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="listing/[id]" />
      <Stack.Screen name="create" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
