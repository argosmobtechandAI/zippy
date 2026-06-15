import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function FeedbackListScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionsWithRemarks, riderId } = (route.params as any) || {};

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">Trainer Feedback</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View className="bg-[#8C4A28] rounded-3xl p-6 mb-8 flex-row items-center justify-between shadow-md">
          <View>
            <Text className="text-[#fceddf] opacity-80 text-xs font-bold tracking-widest mb-1 uppercase">Total Feedbacks</Text>
            <Text className="text-white text-4xl font-bold">{sessionsWithRemarks?.length || 0}</Text>
          </View>
          <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
            <MessageSquare color="white" size={32} />
          </View>
        </View>

        {/* Feedback List */}
        <View className="space-y-4">
          {!sessionsWithRemarks || sessionsWithRemarks.length === 0 ? (
              <View className="py-10 items-center">
                  <Text className="text-[#64748b] font-bold">No feedback received yet.</Text>
              </View>
          ) : sessionsWithRemarks.map((session: any, index: number) => {
            const participantData = session.participants?.find((p: any) => p.riderId === riderId);
            
            // Extract trainer name correctly from the session payload
            // A session might have an array of trainers or a string
            let tName = 'Trainer';
            if (session.trainerInfo && session.trainerInfo.name) {
                tName = session.trainerInfo.name;
            } else if (session.trainers && session.trainers.length > 0 && typeof session.trainers[0] === 'object') {
                tName = session.trainers[0].name || 'Trainer';
            } else if (session.trainerName) {
                tName = session.trainerName;
            }
            
            return (
              <View key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                <View className="mb-3 border-b border-gray-100 pb-3">
                  <Text className="text-[#1a202c] font-black text-lg mb-1">Session Name : {session.title || 'Training Session'}</Text>
                  <Text className="text-[#64748b] text-[13px] font-bold mb-1">Date: {session.date} | Time: {session.timing || 'N/A'}</Text>
                  <Text className="text-[#8C4A28] font-bold text-[13px]">Trainer Name : {tName}</Text>
                </View>
                
                <View className="bg-[#FAF3EC] rounded-2xl p-4">
                    <Text className="text-[#DA7347] text-[10px] font-black uppercase tracking-widest mb-1">Remark</Text>
                    <Text className="text-[#5C2E0E] text-sm leading-5 font-normal">"{participantData?.remark}"</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
