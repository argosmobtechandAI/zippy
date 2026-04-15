import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, Calendar, Clock, Smartphone } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getAllSessionsApi } from '../api/api';

export default function SessionsScreen() {
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push({
        day: months[d.getMonth()],
        date: d.getDate().toString(),
        weekday: weekdays[d.getDay()],
        fullDate: d.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const dates = generateDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].date);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Refreshing Sessions...");
      fetchSessions();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (sessions.length > 0 && !selectedSlot) {
      setSelectedSlot(sessions[0]);
    }
  }, [sessions]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await apiFunction(getAllSessionsApi, [], {}, "GET", true);
      if (res && res.success) {
        setSessions(res.sessions || []);
      }
    } catch (error) {
      console.error("Fetch sessions error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => {
    if (!s.date) return false;
    // Handle both "2026-04-10" and "10" (day only) formats
    if (s.date.includes('-')) {
      const dayFromDate = s.date.split('-')[2];
      return parseInt(dayFromDate) === parseInt(selectedDate);
    }
    return s.date === selectedDate;
  });

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="bg-[#8C4A28] px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View className="mr-4 pl-1">
            <ArrowLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">zippy Equestrian Center</Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSessions} colors={['#8C4A28']} />
        }
      >
        {/* Top Image Section */}
        <View className="relative h-64 w-full">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80' }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-black/40 pt-10">
            <Text className="text-white text-2xl font-bold mb-1 shadow-sm">Premium Riding Session</Text>
            <Text className="text-[#fceddf] text-sm">Advanced Dressage & Show Jumping</Text>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-center mb-4 mt-2">
            <View className="mr-2">
              <Calendar color="#8C4A28" size={20} />
            </View>
            <Text className="text-xl font-bold text-[#8C4A28]">Select Date</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
            {dates.map((d) => {
              const isActive = selectedDate === d.date;
              return (
                <TouchableOpacity
                  key={d.date}
                  onPress={() => setSelectedDate(d.date)}
                  className={`items-center justify-center p-3 rounded-2xl mr-3 w-16 h-20 border ${isActive ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2d5c3]'
                    }`}
                >
                  <Text className={`text-[10px] font-bold tracking-wider mb-1 ${isActive ? 'text-[#fceddf]' : 'text-[#64748b]'}`}>{d.day}</Text>
                  <Text className={`text-xl font-bold mb-1 ${isActive ? 'text-white' : 'text-[#8C4A28]'}`}>{d.date}</Text>
                  <Text className={`text-[8px] font-bold uppercase ${isActive ? 'text-[#fceddf]' : 'text-[#64748b]'}`}>{d.weekday}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="mr-2">
                <Clock color="#8C4A28" size={20} />
              </View>
              <Text className="text-xl font-bold text-[#8C4A28]">Available Slots</Text>
            </View>
            <Text className="text-[#8C4A28] text-sm opacity-80">{filteredSessions.length} sessions found</Text>
          </View>

          <View className="space-y-3">
            {loading ? (
                <ActivityIndicator size="large" color="#8C4A28" />
            ) : filteredSessions.length === 0 ? (
                <View className="py-10 items-center justify-center bg-white rounded-2xl border border-[#e2d5c3] border-dashed">
                    <Calendar color="#94a3b8" size={32} />
                    <Text className="text-[#64748b] mt-2 font-semibold">No sessions for this date</Text>
                </View>
            ) : filteredSessions.map((slot, idx) => {
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    navigation.navigate("SessionDetail", { session: slot })
                  }}
                  className={`bg-white rounded-2xl p-4 flex-row justify-between items-center border-l-[6px] border-[#8C4A28] border-t border-b border-r mb-3 border-[#e2e8f0] shadow-sm`}
                >
                  <View>
                    <Text className="text-[#8C4A28] font-bold text-base mb-1">{slot.timing}</Text>
                    <Text className="text-[#64748b] text-sm">{slot.title}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`text-green-600 font-bold text-[10px] mb-1`}>{(slot.totalSeats || 0) - (slot.participants?.length || 0)} seats left</Text>
                    <Text className="text-[#8C4A28] font-bold text-lg">${slot.joiningAmount || '45.00'}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

    </View>
  );
}
