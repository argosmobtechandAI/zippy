import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Leaf, Bell, AlertTriangle, Calendar, Clock, Activity, Plus, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';

export default function DashboardHomeScreen() {
  const { user, rider, loading } = useSelector((state) => state.getData)
  const navigation = useNavigation()
  const dispatch = useDispatch()

  useEffect(() => {

    if (!user) {
      dispatch(fetchUser())
    }
    if (!rider) {
      dispatch(fetchRider())
    }
  }, [dispatch])

  console.log(user, "user")


  return (
    <View className="flex-1 bg-[#F5EDDF]">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View className="w-16 h-16 bg-[#e0ebd5] rounded-xl items-center justify-center">
            <Leaf color="#2c5f43" size={32} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Notification")} className="p-2 relative pt-2">
            <Bell color="#8C4A28" size={28} />
            <View className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#F5EDDF]" />
          </TouchableOpacity>
        </View>

        <View className="mb-6">
          <Text className="text-3xl font-bold text-[#8C4A28] mb-1">Hello, {user?.name}!</Text>
          <Text className="text-[#64748b]">Welcome back to the stable.</Text>
        </View>

        {/* Alert Banner */}
        <TouchableOpacity onPress={() => navigation.navigate("Enrollment")} className="bg-[#fceddf] border border-[#eabba4] rounded-2xl p-4 flex-row items-center mb-6">
          <View className="w-10 h-10 bg-[#eabba4] rounded-full items-center justify-center mr-4 opacity-80">
            <AlertTriangle color="#8C4A28" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-[#8C4A28] font-bold text-sm mb-1">Low balance! 2 sessions left</Text>
            <Text className="text-[#8C4A28] opacity-80 text-xs">Consider topping up your plan soon.</Text>
          </View>
        </TouchableOpacity>

        {/* Remaining Sessions Card */}
        <TouchableOpacity onPress={() => navigation.navigate("Sessions")} className="bg-[#8C4A28] rounded-3xl p-6 mb-8 flex-row justify-between items-center shadow-md">
          <View>
            <Text className="text-[#fceddf] opacity-80 text-[10px] font-bold tracking-wider mb-1">
              REMAINING SESSIONS
            </Text>
            <Text className="text-white text-4xl font-bold">8</Text>
          </View>
          <View className="items-end">
            <Text className="text-[#fceddf] opacity-80 text-[10px] font-bold tracking-wider mb-1">
              PLAN EXPIRY
            </Text>
            <Text className="text-white text-lg font-bold">Oct 12, 2026</Text>
          </View>
        </TouchableOpacity>

        {/* Next Ride */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[#8C4A28] text-xl font-bold">Next Ride</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Booking')}>
            <Text className="text-[#8C4A28] underline font-bold text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center space-x-2">
              <Calendar color="#64748b" size={16} />
              <Text className="text-[#1a202c] font-bold text-sm ml-2">Saturday, May 18</Text>
            </View>
            <View className="bg-[#fceddf] px-3 py-1 rounded-full">
              <Text className="text-[#8C4A28] font-bold text-[10px]">Intermediate</Text>
            </View>
          </View>
          <View className="flex-row items-center space-x-2 mb-6">
            <Clock color="#64748b" size={16} />
            <Text className="text-[#1a202c] font-bold text-sm ml-2">09:30 AM - 10:30 AM</Text>
          </View>

          <View className="h-[1px] bg-[#f1f5f9] mb-4" />

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 bg-[#FAEDDD] rounded-full mr-3 items-center justify-center">
                <Activity color="#8C4A28" size={20} />
              </View>
              <View>
                <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Horse</Text>
                <Text className="text-[#8C4A28] font-bold text-sm">Thunderbolt</Text>
              </View>
            </View>
            <View className="items-end flex-1 pl-4 border-l border-[#f1f5f9]">
              <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Trainer</Text>
              <Text className="text-[#8C4A28] font-bold text-sm">Sarah Jenkins</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between mb-2">
          <TouchableOpacity
            className="flex-1 bg-[#8C4A28] rounded-3xl p-6 mr-3 items-center justify-center shadow-sm h-32"
            onPress={() => navigation.navigate('Sessions')}
          >
            <View className="mb-2">
              <Plus color="white" size={36} />
            </View>
            <Text className="text-white font-bold text-sm">Book a Slot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-3xl p-6 ml-3 items-center justify-center shadow-sm h-32"
            onPress={() => navigation.navigate('Profile')}
          >
            <View className="mb-2">
              <User color="#8C4A28" size={32} />
            </View>
            <Text className="text-[#8C4A28] font-bold text-sm">My Profile</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
