import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import MainTabsStack from "./mainTabsStack";
import NotificationScreen from "../screens/notificationScreen";
import HorseDetail from "../component/horseDetail";
import HealthScreen from "../screens/HealthScreen";
import LogVaccinationScreen from "../screens/LogVaccinationScreen";
import PersonalInformationScreen from "../component/PersonalInformationScreen";

const WelcomeStack = () => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Tabs" component={MainTabsStack} options={{ headerShown: false }} />
            <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HorseDetail" component={HorseDetail} options={{ headerShown: false }} />
            <Stack.Screen name="PatientDetail" component={HealthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LogVaccination" component={LogVaccinationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export default WelcomeStack;