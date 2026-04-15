import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, User as UserIcon, Star, Clock, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { updateSessionApi } from '../api/api';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUser } from '../redux/getDataSlice';

export default function SessionDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch<any>();
  const { session } = route.params as any;

  const [booking, setBooking] = useState(false);
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
        p.riderId && rider.riderId && String(p.riderId).toLowerCase() === String(rider.riderId).toLowerCase()
      );
      setIsBooked(booked);
    }
  }, [session, rider]);

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
        status: 'PENDING'
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
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5EDDF]">
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
            <View className="flex-1 border-r border-[#e2e8f0]">
              <Text className="text-[#94a3b8] text-xs uppercase font-bold tracking-wider mb-1">Price</Text>
              <Text className="text-[#1a202c] font-semibold text-base">${session.joiningAmount || '45.00'}</Text>
            </View>
            <View className="flex-1 pl-4">
              <Text className="text-[#94a3b8] text-xs uppercase font-bold tracking-wider mb-1">Capacity</Text>
              <Text className="text-[#1a202c] font-semibold text-base">{(session.participants?.length || 0)} / {session.totalSeats}</Text>
            </View>
          </View>

          <Text className="text-[#64748b] text-xs leading-5">
            Join this session to improve your riding skills with our expert trainers. Please arrive 15 minutes early to prepare your horse.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 bg-white border-t border-[#e2e8f0] pb-8">
        <TouchableOpacity 
          disabled={booking || isBooked}
          onPress={handleBookRide}
          className={`py-4 rounded-xl items-center shadow-sm flex-row justify-center ${isBooked ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
        >
          {booking ? <ActivityIndicator color="white" /> : (
            <>
              {isBooked ? <CheckCircle2 color="white" size={20} className="mr-2" /> : null}
              <Text className="text-white font-bold text-sm ml-2">
                {isBooked ? 'Already Booked' : 'Confirm Ride Booking'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
