import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Medal, Star, Award } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getRiderApi } from '../api/api';

const iconMap: Record<string, any> = {
  'Trophy': Trophy,
  'Medal': Medal,
  'Star': Star,
  'Award': Award,
};

export default function TrophiesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [rider, setRider] = useState<any>(null);

  useEffect(() => {
    fetchRiderData();
  }, []);

  const fetchRiderData = async () => {
    setLoading(true);
    try {
      const res = await apiFunction(getRiderApi, [], {}, "GET", true);
      if (res && res.success) {
        setRider(res.rider);
      }
    } catch (error) {
      console.error("Fetch rider trophies error:", error);
    } finally {
      setLoading(false);
    }
  };

  const trophies = rider?.trophies || [];

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">My Trophies</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8C4A28" />
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Summary Card */}
        <View className="bg-[#8C4A28] rounded-3xl p-6 mb-8 flex-row items-center justify-between shadow-md">
          <View>
            <Text className="text-[#fceddf] opacity-80 text-xs font-bold tracking-widest mb-1 uppercase">Total Awards</Text>
            <Text className="text-white text-4xl font-bold">{trophies.length}</Text>
          </View>
          <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
            <Trophy color="white" size={32} />
          </View>
        </View>

        {/* Trophies List */}
        <View className="space-y-4">
          {trophies.length === 0 ? (
              <View className="py-10 items-center">
                  <Text className="text-[#64748b] font-bold">No trophies earned yet. Keep riding!</Text>
              </View>
          ) : trophies.map((trophy: any, index: number) => {
            const IconComp = iconMap[trophy.icon] || Trophy;
            return (
              <View key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] flex-row items-center mb-4 relative overflow-hidden">
                <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F5EDDF] rounded-full opacity-40" />
                
                <View className="w-16 h-16 bg-[#fceddf] rounded-2xl items-center justify-center mr-4">
                  <IconComp color={trophy.color || "#f59e0b"} size={32} />
                </View>
                
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="text-[#1a202c] font-bold text-lg flex-1 mr-2">{trophy.title}</Text>
                    <Text className="text-[#94a3b8] text-[10px] font-bold mt-1">{trophy.date}</Text>
                  </View>
                  <Text className="text-[#8C4A28] font-bold text-xs mb-2">{trophy.subtitle}</Text>
                  <Text className="text-[#64748b] text-xs leading-5 pr-2 font-normal">{trophy.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

      </ScrollView>
      )}
    </SafeAreaView>
  );
}
