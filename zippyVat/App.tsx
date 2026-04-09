import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";
import WelcomeStack from './stack/welcomeStack';
import { NavigationContainer } from '@react-navigation/native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor="#F5EDDF" />
      <NavigationContainer>
        <WelcomeStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
