import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

let sound: Audio.Sound | null = null;

export const triggerJobAlert = async () => {
  try {
    // Always cleanup previous sound
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }

    // VIBRATION
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Heavy
    );

    // AUDIO MODE (important)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // SOUND
    sound = new Audio.Sound();
    await sound.loadAsync(
      require('../assets/skype.mp3'),
      { shouldPlay: true }
    );

    console.log('🔔 Job alert triggered');
  } catch (err) {
    console.error('❌ Job alert error:', err);
  }
};

export const cleanupJobAlert = async () => {
  try {
    if (sound) {
      await sound.unloadAsync();
      sound = null;
    }
  } catch (err) {
    console.warn('⚠️ Cleanup error:', err);
  }
};
