import { View, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DashboardHomeScreen from '../screens/DashboardHomeScreen'
import NotificationScreen from '../screens/notificationScreen'

const HomePageStack = () => {
    const Stack = createNativeStackNavigator()
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={DashboardHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Notification' component={NotificationScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export default HomePageStack