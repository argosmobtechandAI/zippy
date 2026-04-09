import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import RiderPlanManagementScreen from '../screens/RiderPlanManagementScreen';
import EnrolmentScreen from '../screens/EnrolmentScreen';

const Stack = createNativeStackNavigator();

const PlanStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="RiderPlanManagement" component={RiderPlanManagementScreen} />
            <Stack.Screen name="Enrolment" component={EnrolmentScreen} />
        </Stack.Navigator>
    );
};

export default PlanStack;
