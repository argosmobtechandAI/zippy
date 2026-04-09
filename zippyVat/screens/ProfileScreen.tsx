import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Check, Award, FileText, TrendingUp, Trophy, Medal, Upload, User, ChevronRight, Calendar, LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {

   const navigation = useNavigation()
   return (
      <View className="flex-1 bg-[#F5EDDF]">
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

            {/* Top Profile Info */}
            <View className="items-center mt-6 mb-8">
               <View className="relative mb-4">
                  <View className="w-28 h-28 rounded-full border-4 border-[#e6d0b3] p-1 bg-[#F5EDDF]">
                     <View className="w-full h-full rounded-full overflow-hidden bg-white">
                        <Image
                           source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                           className="w-full h-full"
                        />
                     </View>
                  </View>
                  {/* Verified Badge */}
                  <View className="absolute bottom-1 right-2 w-6 h-6 bg-[#8C4A28] rounded-full items-center justify-center border-2 border-[#F5EDDF]">
                     <Check color="white" size={12} strokeWidth={3} />
                  </View>
               </View>

               <Text className="text-2xl font-bold text-[#1a202c] mb-1">Alex Sterling</Text>
               <Text className="text-[#8C4A28] font-bold text-sm mb-2">Professional Rider | Grade IV</Text>
               <View className="flex-row items-center">
                  <CalendarIcon color="#94a3b8" size={12} className="mr-1" />
                  <Text className="text-[#94a3b8] text-xs font-bold">Member since 2021</Text>
               </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-between mb-8">
               <View className="flex-1 bg-white rounded-2xl py-4 items-center mr-2 shadow-sm border border-[#e2e8f0]">
                  <Award color="#8C4A28" size={24} className="mb-2" />
                  <Text className="text-[#1a202c] text-2xl font-bold mb-1">12</Text>
                  <Text className="text-[#94a3b8] text-[9px] font-bold tracking-widest">MEDALS</Text>
               </View>
               <View className="flex-1 bg-white rounded-2xl py-4 items-center mr-2 shadow-sm border border-[#e2e8f0]">
                  <FileText color="#8C4A28" size={24} className="mb-2" />
                  <Text className="text-[#1a202c] text-2xl font-bold mb-1">8</Text>
                  <Text className="text-[#94a3b8] text-[9px] font-bold tracking-widest">CERTS</Text>
               </View>
               <View className="flex-1 bg-white rounded-2xl py-4 items-center shadow-sm border border-[#e2e8f0]">
                  <TrendingUp color="#8C4A28" size={24} className="mb-2" />
                  <Text className="text-[#1a202c] text-2xl font-bold mb-1">65%</Text>
                  <Text className="text-[#94a3b8] text-[9px] font-bold tracking-widest">WIN RATE</Text>
               </View>
            </View>

            {/* Performance History */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-lg font-bold text-[#1a202c]">Performance History</Text>
               <View className="bg-[#e6d0b3] px-3 py-1 rounded-lg">
                  <Text className="text-[#8C4A28] font-bold text-[10px]">Last 12 Months</Text>
               </View>
            </View>

            <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-8 h-40 justify-end relative">
               {/* Extremely simple dummy SVG-like curve using borders and absolutely positioned dots */}
               <View className="absolute inset-0 right-4 left-4 border-b border-[#f1f5f9] top-1/2" />
               <View className="flex-row justify-between items-end h-20 mb-3 px-2">
                  {/* Fake data points for the visual */}
                  <View className="w-1.5 h-1.5 bg-[#8C4A28] rounded-full absolute left-[10%] bottom-[20%]" />
                  <View className="w-1.5 h-1.5 bg-[#8C4A28] rounded-full absolute left-[30%] bottom-[50%]" />
                  <View className="w-1.5 h-1.5 bg-[#8C4A28] rounded-full absolute left-[50%] bottom-[40%]" />
                  <View className="w-1.5 h-1.5 bg-[#8C4A28] rounded-full absolute left-[70%] bottom-[80%]" />
                  <View className="w-1.5 h-1.5 bg-[#8C4A28] rounded-full absolute left-[90%] bottom-[60%]" />
               </View>

               <View className="flex-row justify-between border-t border-[#f1f5f9] pt-3 px-2">
                  {['JAN', 'MAR', 'JUN', 'SEP', 'DEC'].map((m) => (
                     <Text key={m} className="text-[#94a3b8] text-[10px] font-bold">{m}</Text>
                  ))}
               </View>
            </View>

            {/* Competition Log */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-lg font-bold text-[#1a202c]">Competition Log</Text>
               <TouchableOpacity className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full border border-[#8C4A28] items-center justify-center mr-1">
                     <Text className="text-[#8C4A28] text-[8px] font-bold">+</Text>
                  </View>
                  <Text className="text-[#8C4A28] font-bold text-[10px]">Record</Text>
               </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-3 flex-row items-center">
               <View className="w-12 h-12 bg-[#fdf2f2] rounded-xl items-center justify-center mr-4">
                  <Trophy color="#8C4A28" size={24} />
               </View>
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                     <Text className="text-[#1a202c] font-bold text-sm">Royal Windsor Horse Show</Text>
                     <Text className="text-[#b45309] font-bold text-[10px]">GOLD</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                     <Text className="text-[#64748b] text-[11px]">1st Place • Dressage</Text>
                     <Text className="text-[#94a3b8] text-[9px]">May 2024</Text>
                  </View>
               </View>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-8 flex-row items-center">
               <View className="w-12 h-12 bg-[#f8fafc] rounded-xl items-center justify-center mr-4">
                  <Medal color="#8C4A28" size={24} />
               </View>
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                     <Text className="text-[#1a202c] font-bold text-sm">National Equine League</Text>
                     <Text className="text-[#64748b] font-bold text-[10px]">BRONZE</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                     <Text className="text-[#64748b] text-[11px]">3rd Place • Jumping</Text>
                     <Text className="text-[#94a3b8] text-[9px]">Apr 2024</Text>
                  </View>
               </View>
            </View>

            <Text className="text-lg font-bold text-[#1a202c] mb-4">Account Overview</Text>

            <View className="bg-white rounded-3xl p-2 shadow-sm border border-[#e2e8f0] mb-6">
               <TouchableOpacity onPress={() => navigation.navigate("PersonalInformation")} className="flex-row items-center p-3 border-b border-[#f1f5f9]">
                  <View className="w-10 h-10 bg-[#F5EDDF] rounded-xl items-center justify-center mr-3">
                     <User color="#8C4A28" size={20} />
                  </View>
                  <View className="flex-1">
                     <Text className="text-[#1a202c] font-bold text-base mb-0.5">Personal Details</Text>
                     <Text className="text-[#64748b] text-xs">Email, Phone, Address</Text>
                  </View>
                  <ChevronRight color="#94a3b8" size={20} />
               </TouchableOpacity>


            </View>


            {/* Certificates */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-lg font-bold text-[#1a202c]">Certificates</Text>
               <TouchableOpacity className="flex-row items-center">
                  <Upload color="#8C4A28" size={12} className="mr-1" />
                  <Text className="text-[#8C4A28] font-bold text-[10px]">Upload</Text>
               </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible mb-6">
               <View className="w-40 h-28 bg-[#2c2c2c] rounded-2xl mr-3 overflow-hidden border border-[#e2e8f0] shadow-sm relative">
                  <View className="absolute inset-0 items-center justify-center opacity-40">
                     <FileText color="white" size={40} />
                  </View>
                  <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/40">
                     <Text className="text-white text-[9px] font-bold">Grade IV License.pdf</Text>
                  </View>
               </View>

               <View className="w-40 h-28 bg-[#475569] rounded-2xl mr-3 overflow-hidden border border-[#e2e8f0] shadow-sm relative">
                  <View className="absolute inset-0 items-center justify-center opacity-40">
                     <Award color="white" size={40} />
                  </View>
                  <View className="absolute bottom-0 left-0 right-0 p-2 bg-black/40">
                     <Text className="text-white text-[9px] font-bold">FEI Excellence.jpg</Text>
                  </View>
               </View>
            </ScrollView>

            {/* Support & Logout */}
            <Text className="text-lg font-bold text-[#1a202c] mb-4">Other</Text>
            <View className="bg-white rounded-3xl p-2 shadow-sm border border-[#e2e8f0] mb-6">
               <TouchableOpacity className="flex-row items-center p-3" onPress={() => navigation.navigate("Login")}>
                  <View className="w-10 h-10 bg-[#fee2e2] rounded-xl items-center justify-center mr-3">
                     <LogOut color="#ef4444" size={20} />
                  </View>
                  <View className="flex-1">
                     <Text className="text-[#ef4444] font-bold text-base">Log Out</Text>
                  </View>
               </TouchableOpacity>
            </View>

         </ScrollView>
      </View>
   );
}

function CalendarIcon(props: any) {
   return (
      <View style={{ width: props.size, height: props.size, borderColor: props.color, borderWidth: 1.5, borderRadius: 3, marginTop: 1 }} />
   );
}
