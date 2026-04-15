
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WelcomeScreen from '../screens/WelcomeScreen'
import LoginScreen from '../screens/LoginScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SuccessScreen from '../screens/SuccessScreen'
import SessionDetailScreen from '../screens/SessionDetailScreen'
import TrophiesScreen from '../screens/TrophiesScreen'
import SettingsScreen from '../screens/SettingsScreen'
import PersonalInformationScreen from '../screens/PersonalInformationScreen'
import MainTabsStack from './mainTabs'
import DeclarationScreen from '../screens/declarationScreen'
import NotificationScreen from '../screens/notificationScreen'

const Stack = createNativeStackNavigator()

const WelcomStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
             <Stack.Screen name="declaration" component={DeclarationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
            <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
            <Stack.Screen name="Trophies" component={TrophiesScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
            <Stack.Screen name="Tabs" component={MainTabsStack} />
        </Stack.Navigator>
    )
}

export default WelcomStack
