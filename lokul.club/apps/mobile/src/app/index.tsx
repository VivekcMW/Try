import { Redirect } from 'expo-router';

// Entry point — for v1 we always start at the splash carousel.
// Later: check auth store and redirect to /(tabs) if a session exists.
export default function Index() {
  return <Redirect href="/(onboarding)/splash" />;
}
