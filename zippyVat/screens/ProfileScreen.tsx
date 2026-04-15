import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Check, Award, FileText, Activity, User, ChevronRight, LogOut, HeartPulse, ShieldAlert, ClipboardList } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getUserApi } from '../api/api';

export default function ProfileScreen() {
   const navigation = useNavigation<any>();
   const [user, setUser] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState({
      patients: 0,
      logs: 24, // Mocked for now
      alerts: 2
   });

   const loadUserData = async () => {
      try {
         const userData = await AsyncStorage.getItem('user');
         if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);

            // Fetch fresh data from DB
            const res = await apiFunction(getUserApi, [], {}, "GET", true);
            if (res && res.success && res.user) {
               setUser(res.user);
               await AsyncStorage.setItem('user', JSON.stringify(res.user));
            }
         }

         // Fetch total patients for stat
         const horseRes = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
         if (horseRes && horseRes.success) {
            setStats(prev => ({ ...prev, patients: horseRes.horses?.length || 0 }));
         }
      } catch (error) {
         console.error("Load profile data error:", error);
      } finally {
         setLoading(false);
      }
   };

   useFocusEffect(
      useCallback(() => {
         loadUserData();
      }, [])
   );

   const handleLogout = async () => {
      await AsyncStorage.multiRemove(['token', 'user']);
      navigation.replace('Login');
   };

   if (loading && !user) {
      return (
         <View className="flex-1 bg-brand-beige items-center justify-center">
            <ActivityIndicator color="#85431E" />
         </View>
      );
   }

   return (
      <View className="flex-1 bg-brand-beige">
         <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

            {/* Top Profile Info - Premium Vet Redesign */}
            <View className="items-center mt-12 mb-10">
               <View className="relative">
                  <View className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
                      <Image
                         source={{ uri: user?.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                         className="w-full h-full"
                      />
                  </View>
                  <View className="absolute bottom-1 right-1 bg-brand-orange w-9 h-9 border-[3px] border-white rounded-full items-center justify-center shadow-lg">
                     <Check color="white" size={18} strokeWidth={3} />
                  </View>
               </View>

               <Text className="text-3xl font-display text-brand-brown mt-6 mb-1">{user?.name || 'Dr. Alexander'}</Text>
               <Text className="text-brand-brown/50 font-body text-xs uppercase tracking-[3px]">{user?.type === 'vet' ? 'Chief Veterinarian • Specialist' : (user?.type || 'Specialist')}</Text>
               <View className="bg-white/50 px-5 py-2 rounded-full border border-brand-brown/5 mt-4">
                  <Text className="text-brand-brown/40 text-[10px] font-body uppercase tracking-widest">{user?.email}</Text>
               </View>
            </View>

            {/* Stats Row - Professional Analytics */}
            <View className="flex-row justify-between mb-12 gap-4">
               <View className="flex-1 bg-white border border-brand-brown/5 rounded-[32px] py-7 items-center shadow-sm">
                  <HeartPulse color="#85431E" size={28} strokeWidth={2.5} className="mb-3" />
                  <Text className="text-brand-brown text-2xl font-display mb-0.5">{stats.patients}</Text>
                  <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px]">Patients</Text>
               </View>
               <View className="flex-1 bg-white border border-brand-brown/5 rounded-[32px] py-7 items-center shadow-sm">
                  <ClipboardList color="#DA7347" size={28} strokeWidth={2.5} className="mb-3" />
                  <Text className="text-brand-brown text-2xl font-display mb-0.5">{stats.logs}</Text>
                  <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px]">Logs</Text>
               </View>
               <View className="flex-1 bg-[#FDF8F2] border border-brand-brown/5 rounded-[32px] py-7 items-center shadow-sm">
                  <ShieldAlert color="#85431E" size={28} strokeWidth={2.5} className="mb-3" opacity={0.6} />
                  <Text className="text-brand-brown text-2xl font-display mb-0.5">{stats.alerts}</Text>
                  <Text className="text-brand-brown/40 text-[9px] font-display uppercase tracking-[2px]">Alerts</Text>
               </View>
            </View>

            {/* Account Settings */}
            <View className="mb-10">
               <Text className="text-2xl font-display text-brand-brown mb-6">Professional Portal</Text>
               
               <View className="bg-white/70 border border-brand-brown/5 rounded-[40px] p-3 shadow-sm">
                  <TouchableOpacity 
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("PersonalInformation")} 
                    className="flex-row items-center p-5 border-b border-brand-brown/5"
                  >
                     <View className="w-14 h-14 bg-brand-beige rounded-[22px] items-center justify-center mr-5">
                        <User color="#85431E" size={22} strokeWidth={2.5} />
                     </View>
                     <View className="flex-1">
                        <Text className="text-brand-brown font-display-reg font-bold text-base tracking-tight mb-0.5">Personal Identity</Text>
                        <Text className="text-brand-brown/40 font-body text-[11px] uppercase tracking-wider">Credentials & Security</Text>
                     </View>
                     <ChevronRight color="#85431E" size={20} opacity={0.3} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    activeOpacity={0.7}
                    className="flex-row items-center p-5 border-b border-brand-brown/5"
                  >
                     <View className="w-14 h-14 bg-brand-orange/10 rounded-[22px] items-center justify-center mr-5">
                        <Award color="#DA7347" size={22} strokeWidth={2.5} />
                     </View>
                     <View className="flex-1">
                        <Text className="text-brand-brown font-display-reg font-bold text-base tracking-tight mb-0.5">Specializations</Text>
                        <Text className="text-brand-brown/40 font-body text-[11px] uppercase tracking-wider">Verified Clinical Bio</Text>
                     </View>
                     <ChevronRight color="#85431E" size={20} opacity={0.3} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    activeOpacity={0.7}
                    className="flex-row items-center p-5"
                  >
                     <View className="w-14 h-14 bg-brand-brown/5 rounded-[22px] items-center justify-center mr-5">
                        <FileText color="#85431E" size={22} strokeWidth={2.5} />
                     </View>
                     <View className="flex-1">
                        <Text className="text-brand-brown font-display-reg font-bold text-base tracking-tight mb-0.5">Clinical Affiliations</Text>
                        <Text className="text-brand-brown/40 font-body text-[11px] uppercase tracking-wider">Practice Locations</Text>
                     </View>
                     <ChevronRight color="#85431E" size={20} opacity={0.3} />
                  </TouchableOpacity>
               </View>
            </View>

            {/* Logout Section */}
            <TouchableOpacity 
               activeOpacity={0.8}
               onPress={handleLogout}
               className="bg-brand-brown rounded-[32px] p-6 shadow-xl shadow-brand-brown/20 flex-row items-center justify-center mb-8"
            >
               <LogOut color="white" size={24} strokeWidth={2.5} className="mr-4" />
               <Text className="text-white font-display text-lg tracking-tight">End Professional Session</Text>
            </TouchableOpacity>

            <Text className="text-center text-brand-brown/20 font-body text-[9px] uppercase tracking-[4px] mt-4 mb-2">
               zippy equestrian center • vet portal v1.0.4
            </Text>

         </ScrollView>
      </View>
   );
}
