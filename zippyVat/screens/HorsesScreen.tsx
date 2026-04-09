import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Menu, Bell, Search, Filter, CalendarDays, History, Activity, ChevronRight, Plus, ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HorsesScreen() {
  const [activeTab, setActiveTab] = useState('All Horses');

  const horses = [
    {
      id: 'ZE-2901',
      name: 'Thunder Strike',
      type: 'Bay Stallion',
      status: 'FIT FOR WORK',
      statusColor: 'text-[#1a202c]',
      lastCheck: 'Today, 09:30 AM',
      icon: CalendarDays,
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'ZE-1104',
      name: 'Midnight Rose',
      type: 'Black Mare',
      status: 'LIGHT WORK',
      statusColor: 'text-[#1a202c]',
      lastCheck: '2 days ago',
      icon: CalendarDays,
      image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'ZE-7782',
      name: 'Copper Blaze',
      type: 'Chestnut Gelding',
      status: 'REST REQUIRED',
      statusColor: 'text-[#1a202c]',
      lastCheck: 'Under medication - Lameness',
      icon: History,
      image: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: 'ZE-0544',
      name: 'Silver Mist',
      type: 'Grey Mare',
      status: 'FIT FOR WORK',
      statusColor: 'text-[#1a202c]',
      lastCheck: 'Yesterday',
      icon: CalendarDays,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
  ];

  const filterTabs = ['All Horses', 'Fit for Work', 'Light Work', 'Rest Required'];
  const navigation = useNavigation()

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row justify-start gap-4 items-center px-4 py-4 mb-2 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
          <ArrowLeft color="#8C4A28" size={20} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#8C4A28]">Horse Health</Text>
       
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
        <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-[#e2e8f0] shadow-sm">
          <Search color="#94a3b8" size={20} className="mr-2" />
          <TextInput
            placeholder="Search by name or ID..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-[#1a202c] h-8"
          />
          <Filter color="#94a3b8" size={20} className="ml-2" />
        </View>
      </View>

      {/* Internal Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6 h-10 flex-grow-0" contentContainerStyle={{ paddingRight: 20 }}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-2 border rounded-full mr-2 justify-center items-center ${activeTab === tab ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-transparent border-[#8C4A28]/30'}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`text-xs font-bold ${activeTab === tab ? 'text-white' : 'text-[#8C4A28]'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Stable Overview */}
        <View className="bg-[#8C4A28] rounded-2xl p-4 flex-row justify-between items-center mb-4 shadow-sm">
          <View>
            <Text className="text-white/80 text-[10px] font-bold tracking-widest mb-1">STABLE OVERVIEW</Text>
            <Text className="text-white text-2xl font-bold">24 Total Horses</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full border border-[#8C4A28] overflow-hidden -mr-2 bg-[#F5EDDF]">
              <Image source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }} className="w-full h-full" />
            </View>
            <View className="w-8 h-8 rounded-full border border-[#e2e8f0] overflow-hidden bg-[#e2e8f0] items-center justify-center z-10">
              <Text className="text-[#1a202c] text-[10px] font-bold">+21</Text>
            </View>
          </View>
        </View>

        {/* List */}
        {horses.map((horse, index) => {
          const IconComp = horse.icon;
          return (
            <TouchableOpacity key={index} onPress={() => navigation.navigate('HorseDetail')} className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] flex-row items-center mb-3">
              <Image source={{ uri: horse.image }} className="w-[70px] h-[70px] rounded-xl mr-3" />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-[#8C4A28] font-bold text-base">{horse.name}</Text>
                  <Text className={`text-[9px] font-bold ${horse.statusColor}`}>{horse.status}</Text>
                </View>
                <Text className="text-[#94a3b8] text-xs mb-2">ID: #{horse.id} | {horse.type}</Text>

                <View className="flex-row items-center">
                  <IconComp color="#94a3b8" size={12} className="mr-1" />
                  <Text className="text-[#94a3b8] text-[10px]">{horse.lastCheck}</Text>
                </View>
              </View>
              <ChevronRight color="#94a3b8" size={20} className="ml-1" />
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-[#8C4A28] rounded-full items-center justify-center shadow-lg border border-[#6b381e]">
        <Plus color="white" size={28} />
      </TouchableOpacity>
    </View>
  );
}
