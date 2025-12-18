import { Stack } from 'expo-router';

/**
 * Home layout simply renders the nested layouts
 * Role-based routing is handled in home/index.tsx
 * This prevents double navigation and race conditions
 */
export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Index handles role-based routing */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }}
      />
      {/* Register both child layouts for Expo Router to recognize them */}
      <Stack.Screen 
        name="worker/_layout" 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="contractor/_layout" 
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
