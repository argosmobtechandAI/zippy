import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Leaf, Bell, AlertTriangle, Calendar, Clock, Activity, Plus, User } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchRiderSessions, fetchUser } from '../redux/getDataSlice';

export default function DashboardHomeScreen() {
  const { user, rider, sessions, loading } = useSelector((state: any) => state.getData)
  const navigation = useNavigation()
  const dispatch = useDispatch<any>()

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Refreshing Dashboard data...");
      if (!user) {
        dispatch(fetchUser())
      }
      if (!rider) {
        dispatch(fetchRider())
      }
      if (user?.riderId) {
        dispatch(fetchRiderSessions(user.riderId))
      }
    });

    return unsubscribe;
  }, [navigation, user?.riderId, rider, dispatch]);

  const nextRide = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    const now = new Date();

    const upcoming = sessions.filter(s => {
      const sessionDate = new Date(s.date);

      // If the session is for today, we need to check the timing
      if (sessionDate.toDateString() === now.toDateString()) {
        try {
          const [startTime] = s.timing.split(' - ');
          const [hours, minutes] = startTime.split(':').map(Number);
          const sessionWithTime = new Date(sessionDate);
          sessionWithTime.setHours(hours, minutes, 0, 0);

          return sessionWithTime > now;
        } catch (e) {
          // Fallback if timing format is unexpected
          return true;
        }
      }

      // For other days, just check if it's in the future
      return sessionDate > now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcoming[0];
  }, [sessions]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: any = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

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
        {rider?.sessionCount <= 2 && <TouchableOpacity onPress={() => navigation.navigate("Enrollment")} className="bg-[#fceddf] border border-[#eabba4] rounded-2xl p-4 flex-row items-center mb-6">
          <View className="w-10 h-10 bg-[#eabba4] rounded-full items-center justify-center mr-4 opacity-80">
            <AlertTriangle color="#8C4A28" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-[#8C4A28] font-bold text-sm mb-1">Low balance! {rider?.sessionCount} sessions left</Text>
            <Text className="text-[#8C4A28] opacity-80 text-xs">Consider topping up your plan soon.</Text>
          </View>
        </TouchableOpacity>}

        {/* Remaining Sessions Card */}
        <TouchableOpacity onPress={() => navigation.navigate("Sessions")} className="bg-[#8C4A28] rounded-3xl p-6 mb-8 flex-row justify-between items-center shadow-md">
          <View>
            <Text className="text-[#fceddf] opacity-80 text-[10px] font-bold tracking-wider mb-1">
              REMAINING SESSIONS
            </Text>
            <Text className="text-white text-4xl font-bold">{rider?.sessionCount || 0}</Text>
          </View>
          <View className="items-end">
            <Text className="text-[#fceddf] opacity-80 text-[10px] font-bold tracking-wider mb-1">
              PLAN EXPIRY: {rider?.planEndDate?.split("T")[0] || "NA"}
            </Text>
            <Text className="text-white text-lg font-bold">
              {rider?.plan && rider?.plan.length > 0 ? "Active Plan" : "No Active Plan"}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Next Ride */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[#8C4A28] text-xl font-bold">Next Ride</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Booking')}>
            <Text className="text-[#8C4A28] underline font-bold text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {nextRide ? (
          <View className="bg-white rounded-3xl p-5 mb-8 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center space-x-2">
                <Calendar color="#64748b" size={16} />
                <Text className="text-[#1a202c] font-bold text-sm ml-2">{formatDate(nextRide.date)}</Text>
              </View>
              <View className="bg-[#fceddf] px-3 py-1 rounded-full">
                <Text className="text-[#8C4A28] font-bold text-[10px]">Upcoming</Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-2 mb-6">
              <Clock color="#64748b" size={16} />
              <Text className="text-[#1a202c] font-bold text-sm ml-2">{nextRide.timing}</Text>
            </View>

            <View className="h-[1px] bg-[#f1f5f9] mb-4" />

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-[#FAEDDD] rounded-full mr-3 items-center justify-center">
                  <Activity color="#8C4A28" size={20} />
                </View>
                <View>
                  <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Horse</Text>
                  <Text className="text-[#8C4A28] font-bold text-sm">{nextRide.title}</Text>
                </View>
              </View>
              <View className="items-end flex-1 pl-4 border-l border-[#f1f5f9]">
                <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Location</Text>
                <Text className="text-[#8C4A28] font-bold text-sm">{nextRide.location}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-white/50 rounded-3xl p-10 mb-8 border border-[#e2d5c3] border-dashed items-center justify-center">
            <Calendar color="#94a3b8" size={32} />
            <Text className="text-[#64748b] mt-2 font-semibold">No upcoming rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Sessions")} className="mt-4">
              <Text className="text-[#8C4A28] font-bold">Book your first session →</Text>
            </TouchableOpacity>
          </View>
        )}

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
            onPress={() => navigation.navigate('DashboardProfile')}
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
