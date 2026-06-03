import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { Menu, Bell, Search, ListFilter, Activity, ChevronRight, Plus, ArrowLeft, Calendar, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getHorsesByVat } from '../api/api';
import { Config } from '../api/config';

const getImageUrl = (url: string) => url?.startsWith('/') ? `${Config.BASE_URL}${url}` : url;

const { width } = Dimensions.get('window');

export default function HorsesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [horses, setHorses] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async () => {
    if (!refreshing) setLoading(true);
    try {
      const res = await apiFunction(getHorsesByVat, [], {}, "GET", true);
      if (res && res.success) {
        setHorses(res.horses || []);
      }
    } catch (error) {
      console.error("Fetch vet horses error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchHorses();
  }, []);

  console.log(horses, "horses")

  const filteredHorses = Array.isArray(horses) ? horses : [];

  return (
    <View className="flex-1 bg-[#FDF5EA]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-6 mt-4">
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Menu color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-black text-[#8C4A28] tracking-tight">Horse Health</Text>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <Bell color="#8C4A28" size={24} />
          <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FDF5EA]" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8C4A28']} tintColor="#8C4A28" />
        }
      >
        {/* Search */}
        <View className="mb-6">
          <View className="bg-white rounded-[2rem] flex-row items-center px-6 py-1 border border-[#8C4A28]/10 shadow-sm">
            <Search color="#8C4A28" size={20} opacity={0.6} />
            <TextInput
              placeholder="Search by name or ID..."
              placeholderTextColor="#94a3b8"
              className="flex-1 text-[#1a202c] h-14 text-sm font-bold ml-3"
            />
            <TouchableOpacity className="p-2">
              <ListFilter color="#8C4A28" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stable Overview Hero */}
        <TouchableOpacity
          activeOpacity={0.9}
          className="bg-[#8C4A28] rounded-[2.5rem] p-8 mb-8 shadow-2xl shadow-[#8C4A28]/40 overflow-hidden"
        >
          <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
          <View className="mb-1">
            <Text className="text-white/60 text-[10px] font-black tracking-[2px] uppercase">Stable Overview</Text>
          </View>
          <View className="flex-row justify-between items-end">
            <Text className="text-white text-4xl font-black">{Array.isArray(horses) ? horses.length : 0} Total Horses</Text>
            <View className="flex-row items-center">
              <View className="flex-row -space-x-4">
                {Array.isArray(horses) && horses.slice(0, 2).map((h, i) => (
                  <View key={i} className="w-10 h-10 rounded-full border-2 border-[#8C4A28] overflow-hidden bg-white shadow-sm items-center justify-center">
                    {h.imageUrl ? <Image source={{ uri: getImageUrl(h.imageUrl) }} className="w-full h-full" /> : <Activity color="#8C4A28" size={20} opacity={0.5} />}
                  </View>
                ))}
                <View className="w-10 h-10 rounded-full border-2 border-white bg-[#FAF7F2] items-center justify-center z-10 shadow-sm">
                  <Text className="text-[#8C4A28] text-[10px] font-black">+{Array.isArray(horses) && horses.length > 2 ? horses.length - 2 : 0}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* List Section */}
        <View className="gap-6">
          {loading ? (
            <View className="py-20 flex-row justify-center items-center">
              <ActivityIndicator color="#8C4A28" size="large" />
            </View>
          ) : filteredHorses.length === 0 ? (
            <View className="py-20 items-center bg-white/50 rounded-[2.5rem] border-2 border-dashed border-[#8C4A28]/10">
              <Activity color="#cbd5e1" size={40} className="mb-4" />
              <Text className="text-[#94a3b8] font-black text-[10px] uppercase tracking-[2px]">No matching patients</Text>
            </View>
          ) : (
            filteredHorses.map((horse, index) => (
              <TouchableOpacity
                key={horse.id || index}
                activeOpacity={0.95}
                onPress={() => navigation.navigate('HorseDetail', { horse })}
                className="bg-white rounded-[2.5rem] p-5 shadow-xl shadow-gray-200 border border-white flex-row items-center"
              >
                <View className="shadow-lg shadow-gray-200">
                  {horse.imageUrl ? (
                    <Image
                      source={{ uri: getImageUrl(horse.imageUrl) }}
                      className="w-24 h-24 rounded-[2rem] border-2 border-gray-50 bg-[#FAF7F2]"
                    />
                  ) : (
                    <View className="w-24 h-24 rounded-[2rem] border-2 border-gray-50 bg-[#FAF7F2] items-center justify-center p-2">
                      <Text className="text-[10px] font-bold text-[#94a3b8] text-center uppercase tracking-widest">No Preview Image</Text>
                    </View>
                  )}
                </View>

                <View className="flex-1 ml-5">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-[#1a202c] font-black text-lg tracking-tight">{horse.name}</Text>
                    <Text className="text-[10px] font-black text-[#8C4A28] uppercase tracking-wider">{horse.status || 'UNKNOWN'}</Text>
                  </View>

                  <Text className="text-[#94a3b8] text-[9px] font-black uppercase tracking-[1px] mb-3">
                    ID: #{horse.id?.substring(0, 8).toUpperCase()} | {horse.title || 'General'}
                  </Text>

                  <View className="flex-row items-center">
                    <Calendar color="#8C4A28" size={12} opacity={0.5} />
                    <Text className="text-[#64748b] text-[10px] font-bold ml-2">
                      {horse.lastVisit ? `Last Check: ${horse.lastVisit}` : 'No recent visits'}
                    </Text>
                  </View>
                </View>

                <View className="ml-2">
                  <ChevronRight color="#cbd5e1" size={20} strokeWidth={3} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('AddHorse')}
        className="absolute bottom-10 right-8 w-20 h-20 bg-[#8C4A28] rounded-full items-center justify-center shadow-2xl shadow-[#8C4A28]/50 border-4 border-[#FDF5EA]"
      >
        <Plus color="white" size={32} strokeWidth={3} />
      </TouchableOpacity>
    </View>
  );
}
