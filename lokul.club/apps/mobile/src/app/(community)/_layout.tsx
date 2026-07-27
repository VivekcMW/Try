import { Stack } from 'expo-router';

export default function CommunityLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="my-posts" />
      <Stack.Screen name="events" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="event-create" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="create-notice" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="create-poll" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="create-lost-found" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="lost-found" />
      <Stack.Screen name="notices" />
      <Stack.Screen name="polls" />
      <Stack.Screen name="visitors" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="user/[id]" />
    </Stack>
  );
}
