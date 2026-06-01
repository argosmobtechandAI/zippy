import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Leaf, Bell, AlertTriangle, Calendar, Clock, Activity, Plus, User } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchRiderSessions, fetchUser } from '../redux/getDataSlice';

export default function DashboardHomeScreen() {
  const { user, rider, sessions, loading } = useSelector((state: any) => state.getData)
  const navigation = useNavigation()
  const dispatch = useDispatch<any>()

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUser());
      dispatch(fetchRider());
      if (user?.riderId) {
        dispatch(fetchRiderSessions(user.riderId));
      }
    }, [dispatch, user?.riderId])
  );

  useEffect(() => {
    if (user?.riderId) {
      dispatch(fetchRiderSessions(user.riderId));
    }
  }, [dispatch, user?.riderId]);

  console.log(user, rider, sessions, "dashboard data")

  const isSessionPassed = (date: string, timing: string) => {
    if (!date || !timing) return false;
    const now = new Date();
    const sessionDate = new Date(date);

    if (sessionDate.toDateString() === now.toDateString()) {
      try {
        const [startTime] = timing.split(' - ');
        const [hours, minutes] = startTime.split(':').map(Number);
        const sessionWithTime = new Date(sessionDate);
        sessionWithTime.setHours(hours, minutes, 0, 0);
        return sessionWithTime <= now;
      } catch (e) {
        return false;
      }
    }
    return sessionDate < now;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const options: any = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const confirmedRides = useMemo(() => {
    if (!sessions || sessions.length === 0 || !rider?.joinedSessions) return [];
    return sessions
      .filter((s: any) => {
        const isJoined = rider.joinedSessions.includes(s.id);
        if (!isJoined) return false;

        const me = s.participants?.find((p: any) =>
          p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase()
        );
        const bookedDate = me?.date || s.date;
        return !isSessionPassed(bookedDate, s.timing);
      })
      .sort((a: any, b: any) => {
        const dateA = a.participants?.find((p: any) => p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase())?.date || a.date;
        const dateB = b.participants?.find((p: any) => p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase())?.date || b.date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  }, [sessions, rider?.joinedSessions, rider?.id]);

  const pendingRides = useMemo(() => {
    if (!sessions || sessions.length === 0 || !rider?.pendingSessions) return [];
    return sessions
      .filter((s: any) => {
        const isPending = rider.pendingSessions.includes(s.id);
        if (!isPending) return false;

        const me = s.participants?.find((p: any) =>
          p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase()
        );
        const bookedDate = me?.date || s.date;
        return !isSessionPassed(bookedDate, s.timing);
      })
      .sort((a: any, b: any) => {
        const dateA = a.participants?.find((p: any) => p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase())?.date || a.date;
        const dateB = b.participants?.find((p: any) => p.riderId && rider.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase())?.date || b.date;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  }, [sessions, rider?.pendingSessions, rider?.id]);


  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
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

        {/* Confirmed Rides */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[#8C4A28] text-xl font-bold">Confirmed Rides</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Booking')}>
            <Text className="text-[#8C4A28] underline font-bold text-sm">See all</Text>
          </TouchableOpacity>
        </View>

        {confirmedRides.length > 0 ? (
          (() => {
            const ride = confirmedRides[0];
            const me = ride.participants?.find((p: any) =>
              p.riderId && rider?.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase()
            );
            const bookedDate = me?.date || ride.date;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate("SessionDetail", { session: ride, date: bookedDate })}
                className="bg-white rounded-3xl p-5 mb-6 shadow-sm active:opacity-95"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Calendar color="#64748b" size={16} />
                    <Text className="text-[#1a202c] font-bold text-sm ml-2">{formatDate(bookedDate)}</Text>
                  </View>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 font-bold text-[10px] uppercase">Confirmed</Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-6">
                  <Clock color="#64748b" size={16} />
                  <Text className="text-[#1a202c] font-bold text-sm ml-2">{ride.timing}</Text>
                </View>

                <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-[#FAEDDD] rounded-full mr-3 items-center justify-center">
                      <Activity color="#8C4A28" size={20} />
                    </View>
                    <View>
                      <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Session</Text>
                      <Text className="text-[#8C4A28] font-bold text-sm">{ride.title}</Text>
                    </View>
                  </View>
                  <View className="items-end flex-1 pl-4 border-l border-[#f1f5f9]">
                    <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Location</Text>
                    <Text className="text-[#8C4A28] font-bold text-sm">{ride.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })()
        ) : (
          <View className="bg-white/50 rounded-3xl p-6 mb-6 border border-[#e2d5c3] border-dashed items-center justify-center">
            <Calendar color="#94a3b8" size={24} />
            <Text className="text-[#64748b] mt-2 font-semibold text-sm">No upcoming confirmed rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Sessions")} className="mt-2">
              <Text className="text-[#8C4A28] font-bold text-xs">Book your session →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Approval */}
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-[#8C4A28] text-xl font-bold">Pending Approval</Text>
        </View>

        {pendingRides.length > 0 ? (
          (() => {
            const ride = pendingRides[0];
            const me = ride.participants?.find((p: any) =>
              p.riderId && rider?.id && String(p.riderId).toLowerCase() === String(rider.id).toLowerCase()
            );
            const bookedDate = me?.date || ride.date;
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate("SessionDetail", { session: ride, date: bookedDate })}
                className="bg-white rounded-3xl p-5 mb-8 shadow-sm active:opacity-95"
              >
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <Calendar color="#64748b" size={16} />
                    <Text className="text-[#1a202c] font-bold text-sm ml-2">{formatDate(bookedDate)}</Text>
                  </View>
                  <View className="bg-[#fceddf] px-3 py-1 rounded-full">
                    <Text className="text-[#8C4A28] font-bold text-[10px] uppercase">Pending</Text>
                  </View>
                </View>
                <View className="flex-row items-center mb-6">
                  <Clock color="#64748b" size={16} />
                  <Text className="text-[#1a202c] font-bold text-sm ml-2">{ride.timing}</Text>
                </View>

                <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-[#FAEDDD] rounded-full mr-3 items-center justify-center">
                      <Activity color="#8C4A28" size={20} />
                    </View>
                    <View>
                      <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Session</Text>
                      <Text className="text-[#8C4A28] font-bold text-sm">{ride.title}</Text>
                    </View>
                  </View>
                  <View className="items-end flex-1 pl-4 border-l border-[#f1f5f9]">
                    <Text className="text-[#94a3b8] text-[8px] font-bold tracking-widest uppercase mb-1">Location</Text>
                    <Text className="text-[#8C4A28] font-bold text-sm">{ride.location}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })()
        ) : (
          <View className="bg-white/50 rounded-3xl p-6 mb-8 border border-[#e2d5c3] border-dashed items-center justify-center">
            <Calendar color="#94a3b8" size={24} />
            <Text className="text-[#64748b] mt-2 font-semibold text-sm">No pending bookings</Text>
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
            <Text className="text-white font-bold text-sm">Book Session</Text>
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
    </SafeAreaView>
  );
}
