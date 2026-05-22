import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, User as UserIcon, Star, Clock, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { updateSessionApi, cancelBookingApi } from '../api/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../redux/getDataSlice';

export default function SessionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<any>();
  const { session, date } = route.params as any;

  const isDeadlinePassed = useMemo(() => {
    if (!date) return false;
    try {
      const [year, month, day] = date.split('-').map(Number);
      const sessionDate = new Date(year, month - 1, day);
      const deadline = new Date(sessionDate);
      deadline.setDate(deadline.getDate() - 1);
      deadline.setHours(20, 0, 0, 0); // 8:00 PM of previous day
      return new Date() > deadline;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, [date]);

  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { user } = useSelector((state: any) => state.getData);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [user]);

  const rider = user;
  const [isBooked, setIsBooked] = useState(false);

  useEffect(() => {
    if (session?.participants && rider?.riderId) {
      const booked = session.participants.some((p: any) =>
        p.riderId && rider.riderId &&
        String(p.riderId).toLowerCase() === String(rider.riderId).toLowerCase() &&
        p.date === date
      );
      setIsBooked(booked);
    }
  }, [session, rider, date]);

  const handleBookRide = async () => {
    if (!rider) {
      Alert.alert("Error", "Please log in to book a session.");
      return;
    }

    // Double check from fresh state
    if (isBooked) {
      Alert.alert("Info", "You are already registered for this session.");
      return;
    }

    if (isDeadlinePassed) {
      Alert.alert("Booking Closed", "You cannot book this slot after 8:00 PM of the previous day.");
      return;
    }

    setBooking(true);
    try {

      const updatedParticipants = [...(session.participants || [])];

      if (isBooked) {
        Alert.alert("Info", "You are already registered for this session.");
        setBooking(false);
        return;
      }

      let currentRider = rider;
      if (!currentRider?.riderId) {
        // Try refreshing once in the background
        const res = await dispatch(fetchUser()).unwrap();
        if (res?.riderId) {
          currentRider = res;
        } else {
          Alert.alert("Profile Incomplete", "Your rider profile is not fully synced. Please logout and login again to refresh your credentials.");
          setBooking(false);
          return;
        }
      }

      updatedParticipants.push({
        riderId: currentRider.riderId,
        name: currentRider.name,
        type: currentRider.riderType || 'Standard',
        image: currentRider.image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        status: 'PENDING',
        date: date
      });

      const res = await apiFunction(updateSessionApi(session.id), [], {
        participants: updatedParticipants
      }, "PUT", true);

      if (res && res.success) {
        Alert.alert("Success", "Your booking request has been sent!");
        navigation.goBack();
      } else {
        Alert.alert("Error", res?.message || "Failed to book session.");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to book session.");
    } finally {
      setBooking(false);
    }
  };

  const handleCancelBooking = () => {
    if (!rider?.riderId) {
      Alert.alert("Error", "Rider profile not found.");
      return;
    }

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel your booking for this session?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await apiFunction(
                cancelBookingApi(session.id),
                [],
                { riderId: rider.riderId, date },
                "PUT",
                true
              );

              if (res && res.success) {
                Alert.alert("Success", "Your booking has been cancelled.");
                setIsBooked(false);
                navigation.goBack();
              } else {
                Alert.alert("Error", res?.message || "Failed to cancel booking.");
              }
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to cancel booking.");
            } finally {
              setCancelling(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      <Text>{date}</Text>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-[#e2e8f0] mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#f8fafc] rounded-full">
          <ArrowLeft color="#1a202c" size={20} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-lg">SESSION DETAILS</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-[#1a202c] font-bold text-xl flex-1 mr-2">{session.title}</Text>
            <View className={`px-3 py-1.5 rounded-lg ${isBooked ? 'bg-green-100' : 'bg-[#fceddf]'}`}>
              <Text className={`font-bold text-[10px] uppercase tracking-widest ${isBooked ? 'text-green-700' : 'text-[#8C4A28]'}`}>
                {isBooked ? 'BOOKED' : 'AVAILABLE'}
              </Text>
            </View>
          </View>

          <View className="space-y-3 mb-6">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-[#f8fafc] items-center justify-center mr-3">
                <Calendar color="#8C4A28" size={16} />
              </View>
              <Text className="text-[#1a202c] text-sm font-medium">{session.timing}</Text>
            </View>

            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-[#f8fafc] items-center justify-center mr-3">
                <UserIcon color="#8C4A28" size={16} />
              </View>
              <Text className="text-[#1a202c] text-sm font-medium">Trainer: {session.trainerName || 'Assigned Trainer'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-[#f8fafc] p-4 rounded-2xl mb-6">
            <View className="flex-1">
              <Text className="text-[#94a3b8] text-xs uppercase font-bold tracking-wider mb-1">Capacity</Text>
              <Text className="text-[#1a202c] font-semibold text-base">{(session.participants?.length || 0)} / {session.totalSeats}</Text>
            </View>
          </View>

          <Text className="text-[#64748b] text-xs leading-5">
            Join this session to improve your riding skills with our expert trainers. Please arrive 15 minutes early to prepare your horse.
          </Text>
          {isDeadlinePassed && (
            <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <Text className="text-red-700 text-xs font-bold text-center">
                Booking closed for this date. Bookings close at 8:00 PM of the previous day.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 bg-white border-t border-[#e2e8f0] pb-8">
        {isBooked ? (
          <TouchableOpacity
            disabled={cancelling}
            onPress={handleCancelBooking}
            className="py-4 rounded-xl items-center shadow-sm flex-row justify-center bg-red-600 active:opacity-90"
          >
            {cancelling ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-bold text-sm ml-2">
                Cancel Booking
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={booking || isDeadlinePassed}
            onPress={handleBookRide}
            className={`py-4 rounded-xl items-center shadow-sm flex-row justify-center ${isDeadlinePassed ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
          >
            {booking ? <ActivityIndicator color="white" /> : (
              <Text className="text-white font-bold text-sm ml-2">
                {isDeadlinePassed ? 'Booking Closed' : 'Confirm Ride Booking'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
