import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  
  // ✅ Request permission to send notifications
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('⚠️ Notification permissions not granted');
    return null;
  }
  
  // ✅ Get the Expo push token
  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ FCM Token received:', token);
    return token;
  } catch (err) {
    console.error('❌ Failed to get FCM token:', err);
    return null;
  }
}
