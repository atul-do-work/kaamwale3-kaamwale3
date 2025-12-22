import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;
  
  try {
    console.log('🔔 Starting notification setup...');
    
    // Android: Set up notification channel
    if (Platform.OS === 'android') {
      console.log('📱 Setting up Android notification channel...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
      console.log('✅ Android channel configured');
    }
    
    // Request permission
    console.log('🔐 Requesting notification permissions...');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('📊 Current permission status:', existingStatus);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('⚠️ Permissions not granted, requesting...');
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📊 Permission request result:', status);
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('❌ Notification permissions DENIED by user');
      Alert.alert(
        'Permissions Required',
        'Please allow notifications to receive OTP via push notifications.',
        [{ text: 'OK' }]
      );
      return null;
    }
    
    console.log('✅ Permissions GRANTED');
    
    // Get the Expo push token
    console.log('🔑 Getting FCM token...');
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    token = tokenResponse.data;
    console.log('✅ FCM Token received:', token);
    return token;
    
  } catch (err) {
    console.error('❌ Error in notification setup:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return null;
  }
}
