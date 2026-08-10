import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

// Entry point — for v1 we always start at the splash carousel.
// Later: check auth store and redirect to /(tabs) if a session exists.
export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Use setTimeout to ensure the navigation happens after the component is mounted
    const timeout = setTimeout(() => {
      router.replace('/(onboarding)/splash');
    }, 100);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator size="large" color="#208AEF" />
    </View>
  );
}
