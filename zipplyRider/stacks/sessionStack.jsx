import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SessionsScreen from "../screens/SessionsScreen";
import SessionDetailScreen from "../screens/SessionDetailScreen";

const Stack = createNativeStackNavigator();

const SessionStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="SessionsScreen" component={SessionsScreen} />
            <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        </Stack.Navigator>
    )
}

export default SessionStack