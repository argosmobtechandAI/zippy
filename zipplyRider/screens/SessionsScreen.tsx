import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getAllSessionsApi, getRiderApi, getUserApi } from '../api/api';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [riderType, setRiderType] = useState<string | null>(null);

  const generateDates = (type: string | null) => {
    const dates = [];
    const today = new Date();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const weekdaysNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    let addedCount = 0;
    let daysToCheck = 0;
    const isWeekDaysOnly = type?.toLowerCase() === 'weekdays';

    while (addedCount < 7 && daysToCheck < 30) {
      const d = new Date();
      d.setDate(today.getDate() + daysToCheck);
      const dayOfWeek = d.getDay();

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekDaysOnly && isWeekend) {
        daysToCheck++;
        continue;
      }

      const year = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');

      dates.push({
        day: months[d.getMonth()],
        date: d.getDate().toString(),
        weekday: weekdaysNames[dayOfWeek],
        fullDate: `${year}-${monthStr}-${dayStr}`
      });

      addedCount++;
      daysToCheck++;
    }
    return dates;
  };

  const dates = useMemo(() => {
    return generateDates(riderType || "Regular");
  }, [riderType]);

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (dates.length > 0) {
      const exists = dates.some(d => d.fullDate === selectedDate);
      if (!exists) {
        setSelectedDate(dates[0].fullDate);
      }
    }
  }, [dates, selectedDate]);

  const navigation = useNavigation<any>();

  useEffect(() => {
    const getRider = async () => {
      const res = await apiFunction(getRiderApi, [], {}, "GET", true)
      if (res && res.success) {
        setRiderType(res.rider.riderType);
      }
    }

    getRider();
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Refreshing Sessions...");
      fetchSessions();
    });

    return unsubscribe;
  }, [navigation]);

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
    if (s.date === "daily") return true;
    return s.date === selectedDate;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
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
              const isActive = selectedDate === d.fullDate;
              return (
                <TouchableOpacity
                  key={d.fullDate}
                  onPress={() => setSelectedDate(d.fullDate)}
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
              <Text className="text-xl font-bold text-[#8C4A28]">Available Sessions</Text>
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
            ) : filteredSessions.map((session, idx) => {
              const seatsLeft = (session.totalSeats || 10) - (session.participants?.length || 0);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => navigation.navigate("SessionDetail", { session, date: selectedDate })}
                  className="bg-white rounded-2xl p-4 border border-[#e2d5c3] shadow-sm mb-4 border-l-[6px] border-[#8C4A28] active:opacity-90"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-[#8C4A28] font-black text-lg mb-1">{session.title}</Text>
                      <View className="flex-row items-center opacity-70">
                        <Clock size={12} color="#64748b" />
                        <Text className="text-[#64748b] text-xs ml-1 font-bold">{session.timing} • {session.duration}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-4 border-t border-[#f1f5f9]">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Text className="text-[#8C4A28]/40 text-[10px] font-black uppercase tracking-widest mr-2">LOCATION</Text>
                      <Text className="text-[#64748b] text-[11px] font-black uppercase truncate">{session.location}</Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full border ${seatsLeft <= 2 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <Text className={`text-[9px] font-black uppercase tracking-widest ${seatsLeft <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                        {seatsLeft <= 0 ? 'Fully Booked' : `${seatsLeft} Seats Left`}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
