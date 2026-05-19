import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabsStack from "./mainTabsStack";
import LoginScreen from "../screens/LoginScreen";
import PendingRequestsScreen from "../component/pendingRequest";
import SessionDetail from "../component/sessionDetail";
import HorseDetail from "../component/horseDetail";
import SettingsScreen from "../component/SettingsScreen";
import PersonalInformationScreen from "../component/PersonalInformationScreen";
import SlotManagementScreen from "../screens/SlotManagementScreen";

const WelcomeStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />

            <Stack.Screen name="Tabs" component={MainTabsStack} options={{ headerShown: false }} />
            <Stack.Screen name="Pending" component={PendingRequestsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SessionDetail" component={SessionDetail} options={{ headerShown: false }} />
            <Stack.Screen name="HorseDetail" component={HorseDetail} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SlotManagement" component={SlotManagementScreen} options={{ headerShown: false }} />

        </Stack.Navigator>
    )
}

export default WelcomeStack;