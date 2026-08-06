import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { LogBox, Platform, useColorScheme, View } from 'react-native';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import i18n from '@/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { startTracking, stopTracking } from '@/lib/locationTracker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { registerSessionExpiredHandler } from '@/services/apiClient';
import { useRouter } from 'expo-router';

import '../i18n';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Suppress specific warnings in production (keep in dev for debugging)
if (!__DEV__) {
  LogBox.ignoreAllLogs();
} else {
  // Suppress expected push notification errors in development (needs APNs entitlements)
  LogBox.ignoreLogs([
    '[PushToken]',
    'aps-environment',
    'expo-notifications',
  ]);
}

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

async function registerPushToken(userId: string) {
  try {
    // Dynamically import to avoid crashing when expo-notifications is not linked
    // @ts-expect-error: expo-notifications is optional and may not be installed
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
    const tokenObj = await Notifications.getExpoPushTokenAsync();
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';
    await fetch(`${BASE}/api/mobile/push/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token: tokenObj.data, platform }),
    });
  } catch (err) {
    if (__DEV__) console.error('[PushToken] Registration failed:', err);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const language = useLanguageStore((s) => s.language);
  const userId   = useOnboardingStore((s) => s.phone);
  const router   = useRouter();

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      router.replace('/(onboarding)/splash' as never);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load Inter fonts for consistent typography across iOS/Android
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Light': Inter_300Light,
    'Inter-Regular': Inter_400Regular,
    'Inter': Inter_400Regular, // Default "Inter" maps to Regular
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // Hide splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    if (userId) registerPushToken(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    startTracking(userId);
    return () => { stopTracking(); };
  }, [userId]);

  // Don't render until fonts are loaded
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(verification)" />
          <Stack.Screen name="(feed)" />
          <Stack.Screen name="(chat)" />
          <Stack.Screen name="(safety)" />
          <Stack.Screen name="(marketplace)" />
          <Stack.Screen name="(classifieds)" />
          <Stack.Screen name="(community)" />
          <Stack.Screen name="(settings)" />
          {/* v2 — PRD v2 modules */}
          <Stack.Screen name="(peer)" />
          <Stack.Screen name="(business)" />
          <Stack.Screen name="(groups)" />
          <Stack.Screen name="(groupbuy)" />
          <Stack.Screen name="(wallet)" />
          <Stack.Screen name="(notifications)" />
          <Stack.Screen name="(discover)" />
          <Stack.Screen name="(dashboard)" />
          <Stack.Screen name="(invite)" />
        </Stack>
      </ThemeProvider>
      </ErrorBoundary>
    </View>
  );
}
