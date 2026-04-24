import { View, Text } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DashboardHomeScreen from '../screens/DashboardHomeScreen'

const Stack = createNativeStackNavigator()

const HomePageStack = () => {
    return (
        <Stack.Navigator initialRouteName='DashboardHome'>
            <Stack.Screen name="DashboardHome" component={DashboardHomeScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export default HomePageStack