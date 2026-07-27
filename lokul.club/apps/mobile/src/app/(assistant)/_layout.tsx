import { Stack } from 'expo-router';

export default function AssistantLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat" options={{ animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
