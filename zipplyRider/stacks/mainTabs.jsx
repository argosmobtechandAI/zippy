import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BookingsScreen from '../screens/BookingsScreen';
import HomePageStack from './homePageStack';

import { Activity, Clipboard, Home, User, UserPlus2 } from 'lucide-react-native';
import DashboardProfileScreen from '../screens/DashboardProfileScreen';
import PlanStack from './planStack';
import SessionStack from "./sessionStack"

const Tab = createBottomTabNavigator();

const MainTabsStack = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#8C4A28',
                tabBarInactiveTintColor: '#999',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomePageStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Booking"
                component={BookingsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Clipboard size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Sessions"
                component={SessionStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Activity size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Enrollment"
                component={PlanStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <UserPlus2 size={size} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Profile"
                component={DashboardProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <User size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabsStack;