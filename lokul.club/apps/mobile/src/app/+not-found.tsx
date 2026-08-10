import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Text, Button, VStack } from '@/components/ui';
import { colors, spacing } from '@lokul/ui-tokens';

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Auto-redirect to splash for common deep link paths
    if (pathname === '/--/' || pathname === '/' || pathname === '') {
      router.replace('/(onboarding)/splash');
    }
  }, [pathname, router]);

  return (
    <View style={styles.container}>
      <VStack gap={4} style={styles.content}>
        <Text variant="h1" style={styles.title}>404</Text>
        <Text variant="h3">Page Not Found</Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          The page "{pathname}" doesn't exist.
        </Text>
        <Button 
          label="Go to Home" 
          onPress={() => router.replace('/(onboarding)/splash')}
          fullWidth
        />
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  content: {
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    color: colors.brand[600],
  },
  subtitle: {
    textAlign: 'center',
  },
});
