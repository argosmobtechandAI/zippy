import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getSessionsByTrainerApi, approveSessionApi, getUserApi } from '../api/api';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_TABS = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'CONFIRMED', label: 'Confirmed' },
  { key: 'REJECTED', label: 'Rejected' },
];

const formatWithDay = (dateStr: string) => {
  if (!dateStr || dateStr === 'N/A' || dateStr === 'daily') return dateStr;
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return `${dateStr} (${days[d.getDay()]})`;
  }
  return dateStr;
};

export default function BookingRequestsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const userRes = await apiFunction(`${getUserApi}/${userId}`, [], {}, 'GET');
      if (userRes?.success && userRes?.user?.trainerId) {
        const res = await apiFunction(getSessionsByTrainerApi(userRes.user.trainerId), [], {}, 'GET');
        if (res?.success) {
          setSessions(res.sessions || []);
        }
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSessions();
    }, [])
  );

  const handleBookingStatus = async (sessionId: string, riderId: string, newStatus: string) => {
    try {
      const res = await apiFunction(approveSessionApi(sessionId, riderId), [], { status: newStatus }, 'PUT');
      if (res?.success) {
        // Refresh to get updated data
        fetchSessions();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const allParticipants = useMemo(() =>
    sessions.flatMap(s =>
      (s.participants || []).map((p: any) => ({ ...p, session: s }))
    ), [sessions]);

  const tabFiltered = useMemo(() => {
    return allParticipants.filter(p => p.status?.toUpperCase() === activeTab);
  }, [allParticipants, activeTab]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDDF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8C4A28" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5EDDF' }}>
      <View className="px-6 py-4">
        <Text className="text-3xl font-bold text-[#5C2E0E] mb-2">Booking Requests</Text>
        <Text className="text-sm font-semibold text-gray-500 mb-6">Review, approve or reject rider bookings.</Text>

        <View className="flex-row bg-white rounded-2xl p-1 mb-6 border border-[#E6D9CC] shadow-sm">
          {STATUS_TABS.map(tab => {
            const count = allParticipants.filter(p => (p.status?.toUpperCase() || 'PENDING') === tab.key).length;
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${isActive ? 'bg-[#8C4A28]' : 'bg-transparent'}`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.label}</Text>
                <View className={`ml-2 px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Text className={`text-[10px] font-black ${isActive ? 'text-white' : 'text-gray-500'}`}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {tabFiltered.length === 0 ? (
            <View className="bg-white rounded-2xl py-12 items-center border border-[#E6D9CC] shadow-sm">
              <AlertTriangle color="#E6D9CC" size={40} />
              <Text className="text-gray-400 font-bold mt-4">No {activeTab.toLowerCase()} requests found.</Text>
            </View>
          ) : (
            tabFiltered.map((p, idx) => (
              <View key={idx} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-[#E6D9CC]">
                <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-[#F6EDE2]">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-10 h-10 rounded-full bg-[#F6EDE2] items-center justify-center mr-3 border border-[#E6D9CC]">
                      <Text className="text-[#8C4A28] font-black text-lg">{p.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                    </View>
                    <View>
                      <Text className="text-[15px] font-black text-[#1e2330]">{p.name}</Text>
                      <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{p.type || 'Standard'}</Text>
                    </View>
                  </View>
                  <View className={`px-3 py-1.5 rounded-full ${p.paid ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${p.paid ? 'text-green-600' : 'text-orange-600'}`}>
                      {p.paid ? 'PAID' : 'UNPAID'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-4 mb-5">
                  <View className="flex-1 bg-[#FBF9F6] rounded-xl p-3 border border-[#E6D9CC]">
                    <View className="flex-row items-center mb-1">
                      <Clock size={12} color="#A59588" />
                      <Text className="text-[10px] font-black text-[#A59588] ml-1 uppercase tracking-widest">Timing</Text>
                    </View>
                    <Text className="text-xs font-bold text-[#1e2330]">{p.session?.timing || p.session?.time || '—'}</Text>
                  </View>
                  <View className="flex-1 bg-[#FBF9F6] rounded-xl p-3 border border-[#E6D9CC]">
                    <View className="flex-row items-center mb-1">
                      <Calendar size={12} color="#A59588" />
                      <Text className="text-[10px] font-black text-[#A59588] ml-1 uppercase tracking-widest">Date</Text>
                    </View>
                    <Text className="text-xs font-bold text-[#1e2330]">{formatWithDay(p.date || p.session?.date)}</Text>
                  </View>
                </View>

                <View className="flex-row gap-3 mt-2">
                  {activeTab === 'PENDING' ? (
                    <>
                      <TouchableOpacity 
                        className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 flex-row justify-center items-center"
                        onPress={() => handleBookingStatus(p.session?.id, p.riderId, 'CONFIRMED')}
                      >
                        <CheckCircle2 size={16} color="#16a34a" />
                        <Text className="text-green-600 font-bold text-xs ml-2">Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 flex-row justify-center items-center"
                        onPress={() => handleBookingStatus(p.session?.id, p.riderId, 'REJECTED')}
                      >
                        <XCircle size={16} color="#dc2626" />
                        <Text className="text-red-600 font-bold text-xs ml-2">Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : activeTab === 'CONFIRMED' ? (
                    <TouchableOpacity 
                      className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 flex-row justify-center items-center"
                      onPress={() => handleBookingStatus(p.session?.id, p.riderId, 'REJECTED')}
                    >
                      <XCircle size={16} color="#dc2626" />
                      <Text className="text-red-600 font-bold text-xs ml-2">Revoke Booking</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 flex-row justify-center items-center"
                      onPress={() => handleBookingStatus(p.session?.id, p.riderId, 'CONFIRMED')}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <Text className="text-green-600 font-bold text-xs ml-2">Re-Approve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
