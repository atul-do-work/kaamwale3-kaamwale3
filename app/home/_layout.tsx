import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function Layout() {
  const router = useRouter();
  const [role, setRole] = useState<'worker' | 'contractor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log(`✅ Home layout loaded for role: ${userData.role}`);
          setRole(userData.role);
        } else {
          console.warn('⚠️ No user data found in AsyncStorage');
          // If no user data, redirect to login
          router.replace('/');
        }
      } catch (error) {
        console.error('Error reading user role:', error);
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout to prevent infinite loading state
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Home layout loading timeout - checking role again');
        getUserRole();
      }
    }, 5000);

    getUserRole();

    return () => clearTimeout(timeoutId);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#1a2f4d" />
      </View>
    );
  }

  // Fallback if role is not set (redirect to login)
  if (!role) {
    // Redirect to login
    if (!loading) {
      router.replace('/');
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#1a2f4d" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {role === 'worker' ? (
        <Stack.Screen name="worker/_layout" />
      ) : (
        <Stack.Screen name="contractor/_layout" />
      )}
    </Stack>
  );
}
