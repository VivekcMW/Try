import { Stack } from 'expo-router';

// 3-step onboarding: splash → phone → otp → profile → locality → welcome
// Community mapping (residence-type, society, tower-flat) moved to /(community-setup)/
// Interests and roles moved to profile enrichment (post-onboarding)
// Permissions moved to just-in-time (location: map screen, push: notifications screen)
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="splash" options={{ animation: 'fade' }} />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="email-login" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="locality" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="edit-interests" />
      <Stack.Screen name="roles" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="residence-type" />
      <Stack.Screen name="society" />
      <Stack.Screen name="tower-flat" />
      <Stack.Screen name="welcome" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}
