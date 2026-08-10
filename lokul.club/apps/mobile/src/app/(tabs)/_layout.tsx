import { Redirect, Tabs } from 'expo-router';
import { Compass, Home, Plus, ShoppingBag, User } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '@lokul/ui-tokens';
import { useAccessibilityStore } from '@/store/accessibilityStore';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function TabLayout() {
  const { t } = useTranslation('common');
  const seniorMode = useAccessibilityStore((s) => s.seniorMode);
  const { pin, name } = useOnboardingStore();

  // Redirect to complete onboarding if missing critical data
  if (!pin || !name) {
    return <Redirect href="/(onboarding)/profile" />;
  }

  const iconSize  = seniorMode ? 28 : 22;
  const tabHeight = Platform.OS === 'ios'
    ? (seniorMode ? 100 : 88)
    : (seniorMode ? 72 : 64);
  const labelSize = seniorMode ? 13 : 11;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.surface.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface.background,
          borderTopWidth: 1,
          borderTopColor: colors.surface.border,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          ...shadows.sm.ios,
          elevation: shadows.sm.android,
        },
        tabBarLabelStyle: { fontSize: labelSize, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_feed'),
          tabBarIcon: ({ color, focused }) => (
            <Home size={iconSize} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('tab_discover'),
          tabBarIcon: ({ color, focused }) => (
            <Compass size={iconSize} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.createBtn, focused && styles.createBtnActive]}>
              <Plus size={seniorMode ? 30 : 26} color={colors.surface.background} strokeWidth={2.6} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <ShoppingBag size={iconSize} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tab_you'),
          tabBarIcon: ({ color, focused }) => (
            <User size={iconSize} color={color} strokeWidth={focused ? 2.4 : 1.8} />
          ),
        }}
      />
      <Tabs.Screen name="safety" options={{ href: null }} />
      <Tabs.Screen name="index-commerce" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -10 : -16,
    shadowColor: colors.brand[700],
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  createBtnActive: {
    backgroundColor: colors.brand[700],
  },
});
