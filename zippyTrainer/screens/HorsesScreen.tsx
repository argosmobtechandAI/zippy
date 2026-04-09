import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Search, Filter, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HorsesScreen() {
  const navigation = useNavigation();
  const horses = [
    {
      id: '1',
      name: 'Thunder',
      type: 'Gelding',
      stall: 'A12',
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=300&auto=format&fit=crop',
    },
    {
      id: '2',
      name: 'Bella',
      type: 'Mare',
      stall: 'B04',
      image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=300&auto=format&fit=crop',
    },
    {
      id: '3',
      name: 'Spirit',
      type: 'Stallion',
      stall: 'C01',
      image: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=300&auto=format&fit=crop',
    },
    {
      id: '4',
      name: 'Eclipse',
      type: 'Mare',
      stall: 'B05',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
    },
    {
      id: '5',
      name: 'Starlight',
      type: 'Gelding',
      stall: 'A14',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
    },
    {
      id: '6',
      name: 'Shadow',
      type: 'Stallion',
      stall: 'C02',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop',
    },
  ];

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="px-4 py-4 mb-2 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-[#1a202c]">My Horses</Text>
        <TouchableOpacity className="bg-[#8C4A28] w-10 h-10 rounded-xl items-center justify-center">
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View className="px-4 flex-row items-center mb-6">
        <View className="flex-1 flex-row items-center bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 mr-3 shadow-sm">
          <Search color="#94a3b8" size={20} className="mr-2" />
          <Text className="flex-1 text-[#94a3b8]">Search horses...</Text>
        </View>
        <TouchableOpacity className="bg-white border border-[#e2e8f0] p-3 rounded-xl shadow-sm">
          <Filter color="#8C4A28" size={20} />
        </TouchableOpacity>
      </View>

      {/* Horses Grid */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          {horses.map((horse) => (
            <TouchableOpacity onPress={() => navigation.navigate("HorseDetail")} key={horse.id} activeOpacity={0.8} className="bg-white rounded-3xl p-3 shadow-sm border border-[#e2e8f0] w-[48%] mb-4">
              <Image
                source={{ uri: horse.image }}
                className="w-full h-36 rounded-2xl mb-3"
              />
              <Text className="text-[#1a202c] font-bold text-base mb-1">{horse.name}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-[#64748b] text-[10px] font-semibold tracking-wider">STALL {horse.stall}</Text>
                <View className="bg-[#e6d0b3] px-2 py-1 rounded">
                  <Text className="text-[#8C4A28] text-[10px] font-bold">{horse.type.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
