import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HorsesScreen from "../screens/HorsesScreen";
import RecordsScreen from "../screens/RecordsScreen";
import { ChessKnight, HeartPlus, Home, List, User } from "lucide-react-native";
import HealthStack from "./heathStack";


const Tabs = createBottomTabNavigator();

const MainTabsStack = () => {
    return (
        <Tabs.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
            <Tabs.Screen name="Home" component={HomeScreen} options={{title: "Home" , tabBarIcon: ({color, size}) => (<Home size={size} color={color} />)}} />
            <Tabs.Screen name="Health" component={HealthStack} options={{title: "Health" , tabBarIcon: ({color, size}) => (<HeartPlus size={size} color={color} />)}} />
            <Tabs.Screen name="Horses" component={HorsesScreen} options={{title: "Horses" , tabBarIcon: ({color, size}) => (<ChessKnight size={size} color={color} />)}} />
            <Tabs.Screen name="Records" component={RecordsScreen} options={{title: "Records" , tabBarIcon: ({color, size}) => (<List size={size} color={color} />)}} />
            <Tabs.Screen name="Profile" component={ProfileScreen} options={{title: "Profile" , tabBarIcon: ({color, size}) => (<User size={size} color={color} />)}} />
        </Tabs.Navigator>
    )
}

export default MainTabsStack