import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Settings, Check, Info, AlertOctagon, Stethoscope, ClipboardList, Trophy, Medal, Star, Award } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { Config } from '../api/config';

const trophies = [
  { title: 'Spring Derby 2023', subtitle: '1st Place Gold', icon: Trophy, color: '#85431E' },
  { title: 'Mountain Trail', subtitle: 'Completed Achievement', icon: Medal, color: '#DA7347' },
  { title: 'Horse Whisperer', subtitle: '10 Successful Tames', icon: Star, color: '#85431E' },
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
    { icon: AlertOctagon, title: 'Emergency Contact', desc: user?.emergencyContact || 'Not Set', color: '#85431E' },
    { icon: Stethoscope, title: 'Medical Information', desc: rider?.medical || 'No medical conditions reported.', color: '#DA7347' },
    { icon: ClipboardList, title: 'Safety Instructions', desc: rider?.instructions || 'Standard safety rules apply.', color: '#526FAE' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-brand-beige">
      {/* Premium Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
        >
          <ArrowLeft color="#85431E" size={20} />
        </TouchableOpacity>
        <Text className="text-brand-brown font-display text-lg uppercase tracking-widest">Rider's Profile</Text>
        <TouchableOpacity 
           onPress={() => navigation.navigate("Settings")}
           className="w-10 h-10 rounded-full bg-white/50 items-center justify-center border border-brand-brown/10"
        >
          <Settings color="#85431E" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        
        {/* Profile Info Section */}
        <View className="items-center mt-4 mb-8">
          <View className="relative">
            <View className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl items-center justify-center overflow-hidden bg-white">
              <Image
                source={{ uri: user?.profilePicture ? `${Config.API_BASE_URL.replace('/api', '')}${user.profilePicture}` : 'https://images.unsplash.com/photo-1579975002161-0f4db23932e6?auto=format&fit=crop&w=300&q=80' }}
                className="w-full h-full"
              />
            </View>
            <View className="absolute bottom-1 right-1 bg-brand-orange w-9 h-9 rounded-full border-[3px] border-white items-center justify-center shadow-lg">
              <Check color="white" size={18} strokeWidth={3} />
            </View>
          </View>
          
          <View className="items-center mt-5">
            <Text className="text-3xl font-display text-brand-brown text-center leading-tight">
              {user?.name?.split(' ')[0] || 'Alex'} <Text className="font-display-reg font-light">{user?.name?.split(' ')[1] || 'Sterling'}</Text>
            </Text>
            <Text className="text-brand-brown/60 font-body text-sm mt-1 uppercase tracking-widest">
              Advanced Equestrian • Level {rider?.level || 8}
            </Text>
            <Text className="text-brand-brown/40 font-body-light text-xs mt-1">
              Member since {user?.createdAt?.split("-")[0] || "April 2021"}
            </Text>
          </View>
        </View>

        {/* High-Fidelity Stats Row */}
        <View className="flex-row justify-between px-6 mb-10">
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center mr-2 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.sessionCount || 42}</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Total Rides</Text>
          </View>
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center mx-1 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.trophies?.length || 12}</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Trophies</Text>
          </View>
          <View className="bg-[#FDF8F2] border border-brand-brown/5 rounded-[24px] p-4 flex-1 items-center ml-2 shadow-sm">
            <Text className="text-2xl font-display text-brand-brown mb-0.5">{rider?.safetyBriefing?.length || 85}%</Text>
            <Text className="text-brand-brown/40 text-[9px] uppercase font-bold tracking-[2px] text-center">Safety Score</Text>
          </View>
        </View>

        {/* Essential Details Card Layout */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-5">
             <Text className="text-brand-brown font-display text-xl">Essential Details</Text>
             <Info color="#85431E" size={20} opacity={0.5} />
          </View>

          <View className="space-y-4">
            {essentialDetails.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <View key={idx} className="bg-white/70 border border-brand-brown/5 rounded-3xl p-5 flex-row items-center mb-4 shadow-sm">
                  <View style={{ backgroundColor: `${item.color}15` }} className="w-14 h-14 rounded-2xl items-center justify-center mr-4">
                    <IconComp color={item.color} size={24} strokeWidth={2.5} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-brand-brown font-display-reg font-bold text-sm mb-0.5">{item.title}</Text>
                    <Text className="text-brand-brown/50 font-body text-xs leading-relaxed">{item.desc}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Trophies Grid Section */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <Trophy color="#85431E" size={22} className="mr-2" />
              <Text className="text-brand-brown font-display text-xl ml-2">My Trophies</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("Trophies")}>
              <Text className="text-brand-orange font-bold text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {trophies.map((trophy, idx) => {
              const IconComp = trophy.icon;
              return (
                <View key={idx} className="bg-white border border-brand-brown/5 rounded-[28px] p-5 w-[48%] mb-4 shadow-md relative overflow-hidden">
                  <View className="absolute -top-6 -right-6 w-20 h-20 bg-brand-beige/50 rounded-full" />
                  <View className="mb-4 bg-brand-beige/30 self-start p-3 rounded-2xl">
                    <IconComp color={trophy.color} size={28} strokeWidth={2.5} />
                  </View>
                  <Text className="text-brand-brown font-display-reg font-bold text-[13px] mb-1">{trophy.title}</Text>
                  <Text className="text-brand-brown/40 font-body text-[10px] uppercase tracking-wider">{trophy.subtitle}</Text>
                </View>
              )
            })}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

