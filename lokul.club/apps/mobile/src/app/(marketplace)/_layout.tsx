import { Stack } from 'expo-router';

export default function MarketplaceLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="orders-dashboard" />
      <Stack.Screen name="my-listings" />
      <Stack.Screen name="my-merchant-orders" />
      <Stack.Screen name="category/[cat]" />
      <Stack.Screen name="merchant/[id]" />
      <Stack.Screen name="merchant-order/[id]" />
      <Stack.Screen name="book/[id]" />
      <Stack.Screen name="order/[id]" />
    </Stack>
  );
}
