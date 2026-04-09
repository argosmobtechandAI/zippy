import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Settings, Check, Info, AlertOctagon, Stethoscope, ClipboardList, Trophy, Medal, Star, Award } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';



const trophies = [
  { title: 'Spring Derby 2023', subtitle: '1st Place Gold', icon: Trophy, color: '#f59e0b' },
  { title: 'Mountain Trail', subtitle: 'Completed Achievement', icon: Medal, color: '#3b82f6' },
  { title: 'Horse Whisperer', subtitle: '10 Successful Tames', icon: Star, color: '#8b5cf6' },
  { title: 'Winter Gala', subtitle: 'Silver Runner-up', icon: Award, color: '#94a3b8' },
];

export default function DashboardProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, rider } = useSelector((state) => state.getData)
  const dispatch = useDispatch();


  useEffect(() => {

    if (!user) {
      dispatch(fetchUser())
    }
    if (!rider) {
      dispatch(fetchRider())
    }
  }, [dispatch])


  const essentialDetails = [
    { icon: AlertOctagon, title: 'Emergency Contact', desc: 'Sarah Sterling (Mother) • +1 (555) 012-3456' },
    { icon: Stethoscope, title: 'Medical Information', desc: 'No known allergies. Blood type A+.' },
    { icon: ClipboardList, title: 'Safety Instructions', desc: 'Certified for Level 3 jumping. Must wear helmet at all times.' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 mb-2">
        <TouchableOpacity>
          <View className="mr-6 pl-1">
            <ArrowLeft color="#8C4A28" size={24} />
          </View>
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-lg">Rider Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Settings color="#8C4A28" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* Profile Info */}
        <View className="items-center mb-8">
          <View className="w-28 h-28 rounded-full border-4 border-[#e2d5c3] items-center justify-center relative mb-4">
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1579975002161-0f4db23932e6?auto=format&fit=crop&w=300&q=80' }}
              className="w-full h-full rounded-full"
            />
            <View className="absolute bottom-0 right-0 bg-[#8C4A28] w-8 h-8 rounded-full border-2 border-[#F5EDDF] items-center justify-center">
              <Check color="white" size={16} />
            </View>
          </View>
          <Text className="text-3xl font-bold text-[#8C4A28] mb-1">{user?.name}</Text>
          <View className="flex-row items-center mb-1">
            <Text className="text-[#64748b] text-sm"> Level {rider?.level}</Text>
          </View>
          <Text className="text-[#94a3b8] text-xs">Member since {user?.createdAt}</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-white rounded-3xl p-4 flex-1 items-center mr-2 shadow-sm">
            <Text className="text-2xl font-bold text-[#8C4A28] mb-1">{rider?.session_count}</Text>
            <Text className="text-[#94a3b8] text-[8px] uppercase font-bold tracking-widest text-center">Total Rides</Text>
          </View>
          <View className="bg-white rounded-3xl p-4 flex-1 items-center mx-1 shadow-sm">
            <Text className="text-2xl font-bold text-[#8C4A28] mb-1">12{rider?.trophies?.length}</Text>
            <Text className="text-[#94a3b8] text-[8px] uppercase font-bold tracking-widest text-center">Trophies</Text>
          </View>
          <View className="bg-white rounded-3xl p-4 flex-1 items-center ml-2 shadow-sm">
            <Text className="text-2xl font-bold text-[#8C4A28] mb-1">{rider?.safety_briefing}%</Text>
            <Text className="text-[#94a3b8] text-[8px] uppercase font-bold tracking-widest text-center">Safety Score</Text>
          </View>
        </View>

        {/* Essential Details */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="mr-2">
              <Info color="#8C4A28" size={24} />
            </View>
            <Text className="text-[#8C4A28] font-bold text-xl">Essential Details</Text>
          </View>

          <View className="space-y-3">
            {essentialDetails.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <View key={idx} className="bg-white rounded-2xl p-4 flex-row items-start shadow-sm mb-3">
                  <View className="bg-[#fceddf] w-10 h-10 rounded-xl items-center justify-center mr-4">
                    <IconComp color="#8C4A28" size={20} />
                  </View>
                  <View className="flex-1 pt-1">
                    <Text className="text-[#1a202c] font-bold text-sm mb-1">{item.title}</Text>
                    <Text className="text-[#64748b] text-xs leading-relaxed">{item.desc}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* My Trophies */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <View className="mr-2">
                <Trophy color="#8C4A28" size={24} />
              </View>
              <Text className="text-[#8C4A28] font-bold text-xl">My Trophies</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Trophies")}>
              <Text className="text-[#8C4A28] font-bold text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {trophies.map((trophy, idx) => {
              const IconComp = trophy.icon;
              return (
                <View key={idx} className="bg-white rounded-2xl p-4 w-[48%] mb-4 shadow-sm relative overflow-hidden">
                  <View className="absolute -top-4 -right-4 w-16 h-16 bg-[#F5EDDF] rounded-full opacity-50" />
                  <View className="mb-3">
                    <IconComp color={trophy.color} size={28} />
                  </View>
                  <Text className="text-[#1a202c] font-bold text-sm mb-1">{trophy.title}</Text>
                  <Text className="text-[#94a3b8] text-[10px]">{trophy.subtitle}</Text>
                </View>
              )
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
