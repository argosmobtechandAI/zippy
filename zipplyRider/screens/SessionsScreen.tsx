import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { ArrowLeft, Calendar, Clock, Smartphone } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const dates = [
  { day: 'OCT', date: '12', weekday: 'MON' },
  { day: 'OCT', date: '13', weekday: 'TUE' },
  { day: 'OCT', date: '14', weekday: 'WED' },
  { day: 'OCT', date: '15', weekday: 'THU' },
  { day: 'OCT', date: '16', weekday: 'FRI' },
];

const slots = [
  { time: '08:00 AM - 09:30 AM', title: 'Morning Training', status: '6 seats available', statusColor: 'text-green-600', border: 'border-l-green-500', price: '$45.00' },
  { time: '10:30 AM - 12:00 PM', title: 'Jump Practice', status: '2 seats left', statusColor: 'text-[#d97706]', border: 'border-l-[#d97706]', price: '$55.00' },
  { time: '02:00 PM - 03:30 PM', title: 'Advanced Class', status: '1 seat left', statusColor: 'text-red-500', border: 'border-l-red-500', price: '$60.00' },
  { time: '04:30 PM - 06:00 PM', title: 'Evening Session', status: '4 seats available', statusColor: 'text-green-600', border: 'border-l-green-500', price: '$45.00' },
];

export default function SessionsScreen() {
  const [selectedDate, setSelectedDate] = useState('12');
  const [selectedSlot, setSelectedSlot] = useState(slots[1]);
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="bg-[#8C4A28] px-4 py-4 flex-row items-center">
        <TouchableOpacity>
          <View className="mr-4 pl-1">
            <ArrowLeft color="white" size={24} />
          </View>
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">zippy Equestrian Center</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
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
            <Text className="text-[#8C4A28] text-sm opacity-80">4 sessions found</Text>
          </View>

          <View className="space-y-3">
            {slots.map((slot, idx) => {
              const isSelected = selectedSlot.time === slot.time;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedSlot(slot)
                    navigation.navigate("SessionDetail", { slot })
                  }}
                  className={`bg-white rounded-2xl p-4 flex-row justify-between items-center border-l-[6px] ${slot.border} border-t border-b border-r mb-3 ${isSelected ? 'border-t-[#8C4A28] border-b-[#8C4A28] border-r-[#8C4A28] shadow-md' : 'border-[#e2e8f0]'}`}
                >
                  <View>
                    <Text className="text-[#8C4A28] font-bold text-base mb-1">{slot.time}</Text>
                    <Text className="text-[#64748b] text-sm">{slot.title}</Text>
                  </View>
                  <View className="items-end">
                    <Text className={`${slot.statusColor} font-bold text-[10px] mb-1`}>{slot.status}</Text>
                    <Text className="text-[#8C4A28] font-bold text-lg">{slot.price}</Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-[#F5EDDF] p-4 shadow-xl border-t border-[#e2d5c3]">
        <View className="flex-row justify-between items-end mb-4 px-2">
          <View>
            <Text className="text-[#64748b] text-[10px] font-bold uppercase tracking-widest mb-1">SELECTED SESSION</Text>
            <Text className="text-[#8C4A28] font-bold text-sm">
              Mon, Oct 12 • {selectedSlot.time.split(' - ')[0]}
            </Text>
          </View>
          <Text className="text-[#8C4A28] font-bold text-xl">{selectedSlot.price}</Text>
        </View>
        <TouchableOpacity className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center shadow-md">
          <View className="mr-2">
            <Smartphone color="white" size={20} />
          </View>
          <Text className="text-white font-bold text-lg">REQUEST BOOKING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
