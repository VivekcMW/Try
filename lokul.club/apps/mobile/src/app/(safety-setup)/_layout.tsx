import { Stack } from 'expo-router';

export default function SafetySetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="contacts" />
      <Stack.Screen name="medical-id" />
      <Stack.Screen name="triggers" />
      <Stack.Screen name="test" />
    </Stack>
  );
}
