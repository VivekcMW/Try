import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';

export default function KidsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
