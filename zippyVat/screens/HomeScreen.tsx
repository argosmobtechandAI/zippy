import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Bell, ChevronRight, Activity, Stethoscope } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {

   const navigation = useNavigation()
   return (
      <View className="flex-1 bg-[#F5EDDF]">
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-6 mt-2">
               <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-white rounded-full overflow-hidden mr-3 border-2 border-[#8C4A28]">
                     <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                        className="w-full h-full"
                     />
                  </View>
                  <View>
                     <Text className="text-xl font-bold text-[#8C4A28]">Welcome, Dr. Sarah</Text>
                     <Text className="text-sm font-semibold text-[#64748b]">Veterinary Dashboard</Text>
                  </View>
               </View>
               <TouchableOpacity onPress={() => navigation.navigate('Notification')} className="relative w-10 h-10 bg-[#e6d0b3] rounded-full items-center justify-center">
                  <Bell color="#8C4A28" size={20} />
                  <View className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
               </TouchableOpacity>
            </View>

            {/* Action Widgets */}
            <View className="flex-row justify-between mb-8">
               <TouchableOpacity
                  className="flex-1 bg-[#8C4A28] rounded-2xl p-4 mr-2 justify-center"
                  onPress={() => navigation.navigate('Health')}
               >
                  <Stethoscope color="white" size={24} className="mb-2" />
                  <Text className="text-white text-lg font-bold">Health Checks</Text>
                  <Text className="text-red-100 text-xs font-semibold mt-1">4 Scheduled Today</Text>
               </TouchableOpacity>
               <View className="flex-1">
                  <TouchableOpacity
                     className="bg-white rounded-2xl p-3 mb-2 shadow-sm border border-[#e2e8f0] flex-row items-center"
                     onPress={() => navigation.navigate('Horses')}
                  >
                     <View className="bg-red-100 p-2 rounded-lg mr-2">
                        <Activity color="#ef4444" size={16} />
                     </View>
                     <View>
                        <Text className="text-[#1a202c] font-bold text-sm">2 Critical</Text>
                        <Text className="text-[#64748b] text-[10px] font-semibold">Need attention</Text>
                     </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                     className="bg-white rounded-2xl p-3 shadow-sm border border-[#e2e8f0] flex-row items-center"
                     onPress={() => navigation.navigate('Records')}
                  >
                     <View className="bg-orange-100 p-2 rounded-lg mr-2">
                        <Activity color="#f97316" size={16} />
                     </View>
                     <View>
                        <Text className="text-[#1a202c] font-bold text-sm">5 Overdue</Text>
                        <Text className="text-[#64748b] text-[10px] font-semibold">Vaccinations</Text>
                     </View>
                  </TouchableOpacity>
               </View>
            </View>

            {/* Priority Patients */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-bold text-[#1a202c]">Priority Patients</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Health')}>
                  <Text className="text-[#8C4A28] font-bold text-sm">View All</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-3 flex-row items-center">
               <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                  className="w-16 h-16 rounded-xl mr-3"
               />
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                     <Text className="text-[#1a202c] font-bold text-base">Copper Blaze</Text>
                     <Text className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">REST REQUIRED</Text>
                  </View>
                  <Text className="text-[#64748b] text-xs font-semibold mb-1">ID: #ZE-7782 | Chestnut Gelding</Text>
                  <Text className="text-[#ef4444] text-xs font-bold">Post-operative eval today</Text>
               </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-8 flex-row items-center">
               <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1594911874499-28c0c4a4f896?q=80&w=200&auto=format&fit=crop' }}
                  className="w-16 h-16 rounded-xl mr-3"
               />
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                     <Text className="text-[#1a202c] font-bold text-base">Thunder Dash</Text>
                     <Text className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded">VACCINE DUE</Text>
                  </View>
                  <Text className="text-[#64748b] text-xs font-semibold mb-1">ID: #ZE-2299 | Bay Stallion</Text>
                  <Text className="text-[#f97316] text-xs font-bold">Influenza + Tetanus Booster</Text>
               </View>
            </TouchableOpacity>

            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-bold text-[#1a202c]">Horses</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Horses')}>
                  <Text className="text-[#8C4A28] font-bold text-sm">Manage</Text>
               </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
               <TouchableOpacity onPress={() => navigation.navigate("HorseDetail")} className="bg-white rounded-2xl p-3 mr-3 shadow-sm border border-[#e2e8f0] w-36">
                  <Image
                     source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=300&auto=format&fit=crop' }}
                     className="w-full h-32 rounded-xl mb-3"
                  />
                  <Text className="text-[#1a202c] font-bold text-sm mb-1">Thunder</Text>
                  <Text className="text-[#94a3b8] text-[10px] font-semibold">Stall: A12 • Gelding</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={() => navigation.navigate("HorseDetail")} className="bg-white rounded-2xl p-3 mr-3 shadow-sm border border-[#e2e8f0] w-36">
                  <Image
                     source={{ uri: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=300&auto=format&fit=crop' }}
                     className="w-full h-32 rounded-xl mb-3"
                  />
                  <Text className="text-[#1a202c] font-bold text-sm mb-1">Bella</Text>
                  <Text className="text-[#94a3b8] text-[10px] font-semibold">Stall: B04 • Mare</Text>
               </TouchableOpacity>

               <TouchableOpacity onPress={() => navigation.navigate("HorseDetail")} className="bg-white rounded-2xl p-3 mr-3 shadow-sm border border-[#e2e8f0] w-36">
                  <Image
                     source={{ uri: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=300&auto=format&fit=crop' }}
                     className="w-full h-32 rounded-xl mb-3"
                  />
                  <Text className="text-[#1a202c] font-bold text-sm mb-1">Spirit</Text>
                  <Text className="text-[#94a3b8] text-[10px] font-semibold">Stall: C01 • Stallion</Text>
               </TouchableOpacity>
            </ScrollView>
         </ScrollView>
      </View>
   );
}
