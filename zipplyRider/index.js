/**
 * @format
 */


import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler early (must be outside of React lifecycle)
if (Platform.OS !== 'ios') {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
}

AppRegistry.registerComponent(appName, () => App);
