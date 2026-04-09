import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ArrowLeft, Trophy, Medal, Star, Award } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const trophiesList = [
  { id: 1, title: 'Spring Derby 2023', subtitle: '1st Place Gold', icon: Trophy, color: '#f59e0b', date: 'May 12, 2023', desc: 'Won the regional spring derby with Thunderbolt. A flawless performance in show jumping.' },
  { id: 2, title: 'Mountain Trail', subtitle: 'Completed Achievement', icon: Medal, color: '#3b82f6', date: 'Aug 05, 2022', desc: 'Successfully completed the challenging 50-mile mountain trail in record time.' },
  { id: 3, title: 'Horse Whisperer', subtitle: '10 Successful Tames', icon: Star, color: '#8b5cf6', date: 'Dec 20, 2021', desc: 'Awarded for demonstrating exceptional calmness and taming 10 unridden horses.' },
  { id: 4, title: 'Winter Gala', subtitle: 'Silver Runner-up', icon: Award, color: '#94a3b8', date: 'Jan 15, 2022', desc: 'Placed second out of 50 competitors in the annual winter jumping gala.' },
  { id: 5, title: 'Speed Demon', subtitle: 'Fastest Sprint', icon: Trophy, color: '#ef4444', date: 'Jul 04, 2023', desc: 'Recorded the fastest sprint time of the entire summer racing season.' },
  { id: 6, title: 'Perfect Form', subtitle: 'Dressage Mastery', icon: Award, color: '#10b981', date: 'Sep 22, 2023', desc: 'Achieved a flawless score from all judges in the intermediate dressage event.' },
];

export default function TrophiesScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">My Trophies</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View className="bg-[#8C4A28] rounded-3xl p-6 mb-8 flex-row items-center justify-between shadow-md">
          <View>
            <Text className="text-[#fceddf] opacity-80 text-xs font-bold tracking-widest mb-1 uppercase">Total Awards</Text>
            <Text className="text-white text-4xl font-bold">12</Text>
          </View>
          <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
            <Trophy color="white" size={32} />
          </View>
        </View>

        {/* Trophies List */}
        <View className="space-y-4">
          {trophiesList.map((trophy) => {
            const IconComp = trophy.icon;
            return (
              <View key={trophy.id} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] flex-row items-center mb-4 relative overflow-hidden">
                <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F5EDDF] rounded-full opacity-40" />
                
                <View className="w-16 h-16 bg-[#fceddf] rounded-2xl items-center justify-center mr-4">
                  <IconComp color={trophy.color} size={32} />
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-[#1a202c] font-bold text-lg flex-1 mr-2">{trophy.title}</Text>
                    <Text className="text-[#94a3b8] text-[10px] font-bold mt-1">{trophy.date}</Text>
                  </View>
                  <Text className="text-[#8C4A28] font-bold text-xs mb-2">{trophy.subtitle}</Text>
                  <Text className="text-[#64748b] text-xs leading-5 pr-2">{trophy.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
