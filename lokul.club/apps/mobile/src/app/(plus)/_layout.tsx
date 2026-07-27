import { Stack } from 'expo-router';

export default function PlusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="upgrade" options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
    </Stack>
  );
}
