import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

/**
 * Home router - redirects based on user role
 * This is the single source of truth for role-based navigation
 * The _layout.tsx should NOT do role checking to avoid race conditions
 */
export default function HomeIndex() {
  const [role, setRole] = useState<'worker' | 'contractor' | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          console.log(`✅ Home router: User role detected: ${userData.role}`);
          
          if (userData.role === 'worker') {
            setRedirect('/home/worker');
          } else if (userData.role === 'contractor') {
            setRedirect('/home/contractor');
          }
          setRole(userData.role as 'worker' | 'contractor');
        } else {
          console.warn('⚠️ No user data in AsyncStorage, redirecting to login');
          setRedirect('/');
        }
      } catch (error) {
        console.error('Error reading user role:', error);
        setRedirect('/');
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, []);

  // Show loading screen while checking
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#1a2f4d" />
      </View>
    );
  }

  // Redirect based on role
  if (redirect === '/home/worker') {
    console.log('→ Redirecting to /home/worker');
    return <Redirect href="/home/worker" />;
  }
  
  if (redirect === '/home/contractor') {
    console.log('→ Redirecting to /home/contractor');
    return <Redirect href="/home/contractor" />;
  }

  // Redirect to login if no role
  if (redirect === '/') {
    console.log('→ Redirecting to login');
    return <Redirect href="/" />;
  }

  // Fallback (should not happen)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#1a2f4d" />
    </View>
  );
}
