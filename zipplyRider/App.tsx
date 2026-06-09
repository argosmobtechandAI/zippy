import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css"
import WelcomStack from './stacks/welcomStack';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './utils/NavigationService';
import { listenToNotifications } from './utils/firebaseUtils';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import store from "./redux/store"

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const unsubscribe = listenToNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Provider store={store}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="#F5EDDF" />
          <WelcomStack />
          <Toast />
        </Provider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
