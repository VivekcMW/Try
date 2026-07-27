import { Stack } from 'expo-router';

// Community mapping flow — entered post-onboarding from Profile tab
// Screens: index → residence-type → society (optional) → tower-flat → done
// interests and roles also live here for post-onboarding enrichment
export default function CommunitySetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="residence-type" />
      <Stack.Screen name="society" />
      <Stack.Screen name="tower-flat" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="roles" />
      <Stack.Screen name="done" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
