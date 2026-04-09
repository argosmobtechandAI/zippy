import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Calendar, User as UserIcon, Star, Clock } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SessionDetailScreen() {
  const navigation = useNavigation();


  // Example data simulating variables passed via route or fetched
  const session = {
    title: 'Advanced Show Jumping',
    date: 'Saturday, Oct 28 • 09:30 AM',
    trainer: 'Sarah Jenkins',
    horse: 'Thunderbolt',
    status: 'PENDING',
    rating: 0
  };

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-[#e2e8f0]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#f8fafc] rounded-full">
          <ArrowLeft color="#1a202c" size={20} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-lg">SESSION DETAILS</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-[#1a202c] font-bold text-xl flex-1 mr-2">{session.title}</Text>
            <View className="bg-[#fceddf] px-3 py-1.5 rounded-lg">
              <Text className="text-[#8C4A28] font-bold text-[10px] uppercase tracking-widest">{session.status}</Text>
            </View>
          </View>

          <View className="space-y-3 mb-6">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#f8fafc] items-center justify-center mr-3">
                <Calendar color="#8C4A28" size={16} />
              </View>
              <Text className="text-[#1a202c] text-sm font-medium">{session.date}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-[#f8fafc] items-center justify-center mr-3">
                <UserIcon color="#8C4A28" size={16} />
              </View>
              <Text className="text-[#1a202c] text-sm font-medium">Trainer: {session.trainer}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center bg-[#f8fafc] p-4 rounded-2xl mb-6">
            <View className="flex-1 border-r border-[#e2e8f0]">
              <Text className="text-[#94a3b8] text-xs uppercase font-bold tracking-wider mb-1">Horse</Text>
              <Text className="text-[#1a202c] font-semibold text-base">{session.horse}</Text>
            </View>
            <View className="flex-1 pl-4">
              <Text className="text-[#94a3b8] text-xs uppercase font-bold tracking-wider mb-1">Duration</Text>
              <Text className="text-[#1a202c] font-semibold text-base">45 mins</Text>
            </View>
          </View>

          {session.rating > 0 && (
            <View className="flex-row justify-between items-center border-t border-[#f1f5f9] pt-5">
              <Text className="text-sm font-medium text-[#64748b]">Your Rating:</Text>
              <View className="flex-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} color={i < session.rating ? '#f59e0b' : '#cbd5e1'} fill={i < session.rating ? '#f59e0b' : 'transparent'} />
                ))}
              </View>
            </View>
          )}

        </View>

      </ScrollView>

      {/* Footer Action */}
      <View className="p-4 bg-white border-t border-[#e2e8f0] pb-8">
        <TouchableOpacity className="bg-[#8C4A28] py-4 rounded-xl items-center shadow-sm">
          <Text className="text-white font-bold text-sm">Cancel Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
