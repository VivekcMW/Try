import { Stack } from 'expo-router';
import { colors } from '@lokul/ui-tokens';

export default function ParkingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
