import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { updateFcmTokenApi } from '../api/api';
import Toast from 'react-native-toast-message';
import * as NavigationService from './NavigationService';

export async function requestUserPermission() {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled;
  }
  // Android 13+ requires explicit permission request.
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'This app needs notification permission to send you updates about your sessions and bookings.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  // For older Android versions, permission is granted at install time.
  return true; 
}

export async function setupFirebaseMessaging(userId) {
  const hasPermission = await requestUserPermission();
  if (!hasPermission) return;

  try {
    // Get the device token
    const token = await messaging().getToken();
    console.log("🔥 FCM Token:", token);

    // Save token to AsyncStorage to avoid unnecessary API calls
    const storedToken = await AsyncStorage.getItem('fcmToken');
    if (storedToken !== token) {
      await AsyncStorage.setItem('fcmToken', token);
      
      // Send token to backend
      if (userId) {
        const res = await apiFunction(updateFcmTokenApi, [], { userId, token }, "POST", true);
        console.log("FCM Token sent to backend:", res?.message);
      }
    }

    // Listen to token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log("🔥 FCM Token Refreshed:", newToken);
      await AsyncStorage.setItem('fcmToken', newToken);
      if (userId) {
        await apiFunction(updateFcmTokenApi, [], { userId, token: newToken }, "POST", true);
      }
    });

  } catch (error) {
    console.error("Firebase setup error:", error);
  }
}

/**
 * Handle notification routing logic
 */
export function handleNotificationRoute(remoteMessage) {
  if (!remoteMessage) return;

  const type = remoteMessage?.data?.type;

  // Wait a moment for NavigationContainer to be ready, especially if waking from killed state
  setTimeout(() => {
    if (type === 'booking') {
      NavigationService.navigate('Tabs', { screen: 'Sessions' });
    } else {
      // Default fallback (e.g. 'marketing' or anything else)
      NavigationService.navigate('Notification');
    }
  }, 1000);
}

/**
 * Listeners for the 3 App States: Foreground, Background, and Quit (Killed)
 */
export function listenToNotifications() {
  // 1. Foreground State: App is open
  const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    console.log('🔥 A new FCM message arrived (Foreground)!', JSON.stringify(remoteMessage));
    
    Toast.show({
      type: 'info',
      text1: remoteMessage.notification?.title || 'New Notification',
      text2: remoteMessage.notification?.body || '',
      position: 'top',
      visibilityTime: 4000,
      onPress: () => handleNotificationRoute(remoteMessage)
    });
  });

  // 2. Background State: App is in background but not killed
  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('🔥 Notification caused app to open from background state:', remoteMessage);
    handleNotificationRoute(remoteMessage);
  });

  // 3. Quit (Killed) State: App is fully closed
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('🔥 Notification caused app to open from quit state:', remoteMessage);
        handleNotificationRoute(remoteMessage);
      }
    });

  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpenedApp();
  };
}
