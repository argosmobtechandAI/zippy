import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RiderPlanManagementScreen from '../screens/RiderPlanManagementScreen';
import EnrolmentScreen from '../screens/EnrolmentScreen';
import CompetitiveRiderPacksScreen from '../screens/CompetitiveRiderPacksScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import CartScreen from '../screens/CartScreen';

const Stack = createNativeStackNavigator();

const PlanStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
            initialRouteName='CompetitiveRiderPacks'
        >
            <Stack.Screen name="CompetitiveRiderPacks" component={CompetitiveRiderPacksScreen} />
            <Stack.Screen name="RiderPlanManagement" component={RiderPlanManagementScreen} />
            <Stack.Screen name="Enrolment" component={EnrolmentScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
        </Stack.Navigator>
    );
};

export default PlanStack;
