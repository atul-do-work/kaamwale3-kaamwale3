import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Keep the splash screen visible while we check user auth
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately - let the app handle loading
    // The home/index.tsx will show its own loading screen if needed
    SplashScreen.hideAsync();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login screen - entry point */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false
        }}
      />
      
      {/* Home screens with role-based routing */}
      <Stack.Screen 
        name="home" 
        options={{ 
          headerShown: false
        }}
      />
      
      {/* Other screens */}
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="waiting" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="ActivityHistory" options={{ headerShown: false }} />
      <Stack.Screen name="DocumentsAndPolicies" options={{ headerShown: false }} />
      <Stack.Screen name="GigHistory" options={{ headerShown: false }} />
      <Stack.Screen name="HelpCentre" options={{ headerShown: false }} />
      <Stack.Screen name="NotificationHistory" options={{ headerShown: false }} />
      <Stack.Screen name="PaymentHistory" options={{ headerShown: false }} />
      <Stack.Screen name="Settings" options={{ headerShown: false }} />
      <Stack.Screen name="SupportTickets" options={{ headerShown: false }} />
      <Stack.Screen name="Verification" options={{ headerShown: false }} />
      <Stack.Screen name="VideosAndTutorials" options={{ headerShown: false }} />
    </Stack>
  );
}
