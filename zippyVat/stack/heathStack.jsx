import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HorseDetail from "../component/horseDetail";
import HealthScreen from "../screens/HealthScreen";
import LogVaccinationScreen from "../screens/LogVaccinationScreen";
import PatientListScreen from "../screens/PatientListScreen";
import RecordsScreen from "../screens/RecordsScreen";

const Stack = createNativeStackNavigator();

const HealthStack = () => {
    return (
        <Stack.Navigator initialRouteName="Health">
            <Stack.Screen name="Health" component={PatientListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HorseDetail" component={HorseDetail} options={{ headerShown: false }} />
            <Stack.Screen name="PatientDetail" component={HealthScreen} options={{ headerShown: false }} />
            <Stack.Screen name="LogVaccination" component={LogVaccinationScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Records" component={RecordsScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    )
}

export default HealthStack;