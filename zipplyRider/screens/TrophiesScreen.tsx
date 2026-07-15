import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Calendar, Award } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import { getRiderApi } from '../api/api';

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

  const records = rider?.championship_records || rider?.championshipRecords || [];
  const totalPoints = rider?.championship_points || rider?.championshipPoints || 0;

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">Championship Points</Text>
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
              <Text className="text-[#fceddf] opacity-80 text-xs font-bold tracking-widest mb-1 uppercase">Total Points</Text>
              <Text className="text-white text-4xl font-bold">{totalPoints} pts</Text>
            </View>
            <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
              <Trophy color="white" size={32} />
            </View>
          </View>

          <Text className="text-[#8C4A28] font-bold text-lg mb-4">Points History ({records.length})</Text>

          {/* History List */}
          <View className="space-y-4">
            {records.length === 0 ? (
              <View className="py-16 items-center justify-center bg-white rounded-3xl border border-[#e2d5c3] border-dashed p-6">
                <Award color="#cbd5e1" size={48} strokeWidth={1.5} />
                <Text className="text-[#64748b] font-bold mt-4 text-center">No points allotted yet.</Text>
                <Text className="text-[#94a3b8] text-xs text-center mt-1">Participate in stable competitions to gain championship points!</Text>
              </View>
            ) : (
              records.map((rec: any, index: number) => {
                return (
                  <View key={rec.id || index} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] flex-row items-center mb-4 relative overflow-hidden">
                    <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#F5EDDF] rounded-full opacity-40" />
                    
                    <View className="w-12 h-12 bg-[#fceddf] rounded-2xl items-center justify-center mr-4 flex-shrink-0">
                      <Award color="#8C4A28" size={24} />
                    </View>
                    
                    <View className="flex-1 pr-2">
                      <View className="flex-row justify-between items-start mb-1">
                        <Text className="text-[#1a202c] font-bold text-[15px] flex-1 mr-2 leading-snug">{rec.competitionName}</Text>
                      </View>
                      {(() => {
                        const catOrRound = rec.categoryOrRound || '';
                        const parts = catOrRound.split(' • ');
                        const category = parts.length > 1 ? parts[0] : '';
                        const round = parts.length > 1 ? parts[1] : parts[0];
                        return (
                          <View className="mb-1">
                            {category ? (
                              <View className="flex-row items-center mb-0.5">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Category: </Text>
                                <Text className="text-[#8C4A28] font-extrabold text-[10px] uppercase bg-[#fceddf] px-1.5 py-0.5 rounded ml-1">{category}</Text>
                              </View>
                            ) : null}
                            <Text className="text-[#8C4A28] font-bold text-[11px]">{round || 'General'}</Text>
                          </View>
                        );
                      })()}
                      <View className="flex-row items-center">
                        <Calendar color="#94a3b8" size={12} />
                        <Text className="text-[#94a3b8] text-[10px] font-semibold ml-1">{rec.date}</Text>
                      </View>
                    </View>

                    <View className="bg-green-50 border border-green-100 rounded-xl px-3 py-1.5 items-center justify-center">
                      <Text className="text-green-700 font-bold text-sm">+{rec.points}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}
