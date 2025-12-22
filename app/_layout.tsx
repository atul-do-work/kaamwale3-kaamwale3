import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

// ✅ Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately
    SplashScreen.hideAsync().catch(() => {});

    // ✅ Listen for push notifications
    const subscription = Notifications.addNotificationResponseListener((response) => {
      console.log('📬 Notification received:', response.notification.request.content);
      // Handle notification interaction here
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login/Auth screen is the entry point */}
      <Stack.Screen name="index" />
      
      {/* Home with role-based routing */}
      <Stack.Screen name="home" />
      
      {/* Other screens */}
      <Stack.Screen name="register" />
      <Stack.Screen name="waiting" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="ActivityHistory" />
      <Stack.Screen name="DocumentsAndPolicies" />
      <Stack.Screen name="GigHistory" />
      <Stack.Screen name="HelpCentre" />
      <Stack.Screen name="NotificationHistory" />
      <Stack.Screen name="PaymentHistory" />
      <Stack.Screen name="Settings" />
      <Stack.Screen name="SupportTickets" />
      <Stack.Screen name="Verification" />
      <Stack.Screen name="VideosAndTutorials" />
    </Stack>
  );
}
