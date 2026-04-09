import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ScheduleScreen from '../screens/ScheduleScreen';
import HorsesScreen from '../screens/HorsesScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Birdhouse, Calendar, ClipboardList, Home, User } from 'lucide-react-native';

const MainTabsStack = () => {
    const Tabs = createBottomTabNavigator();
    return (
        <Tabs.Navigator initialRouteName="HomeStack" screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="HomeStack" component={HomeStack} options={{ title: "Home", tabBarIcon: ({ color, size }) => (<Home color={color} size={size} />) }} />
            <Tabs.Screen name="Schedule" component={ScheduleScreen} options={{ title: "Schedule", tabBarIcon: ({ color, size }) => (<Calendar color={color} size={size} />) }} />
            <Tabs.Screen name="Horses" component={HorsesScreen} options={{ title: "Horses", tabBarIcon: ({ color, size }) => (<Birdhouse color={color} size={size} />) }} />
            <Tabs.Screen name="Attendance" component={AttendanceScreen} options={{ title: "Attendance", tabBarIcon: ({ color, size }) => (<ClipboardList color={color} size={size} />) }} />
            <Tabs.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile", tabBarIcon: ({ color, size }) => (<User color={color} size={size} />) }} />
        </Tabs.Navigator>
    )
}

export default MainTabsStack;