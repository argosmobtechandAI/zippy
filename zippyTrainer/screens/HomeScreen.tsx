import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {

   const navigation = useNavigation();
   return (
      <View className="flex-1 bg-[#F5EDDF]">
         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Header Section */}
            <View className="flex-row justify-between items-center mb-6">
               <View className="flex-row items-center">
                  {/* Profile Image Dummy */}
                  <View className="w-12 h-12 bg-white rounded-full overflow-hidden mr-3 border-2 border-[#8C4A28]">
                     <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                        className="w-full h-full"
                     />
                  </View>
                  <View>
                     <Text className="text-xl font-bold text-[#8C4A28]">zippy Equestrian</Text>
                     <Text className="text-sm font-semibold text-[#64748b]">Trainer Dashboard</Text>
                  </View>
               </View>
               <TouchableOpacity onPress={() => navigation.navigate("Notification")} className="relative w-10 h-10 bg-[#e6d0b3] rounded-full items-center justify-center">
                  <Bell color="#8C4A28" size={20} />
                  <View className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
               </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View className="flex-row justify-between mb-8">
               <View className="flex-1 bg-[#8C4A28] rounded-2xl p-4 mr-2">
                  <Text className="text-white text-[10px] font-bold tracking-wider mb-2">TODAY</Text>
                  <Text className="text-white text-3xl font-bold mb-1">8</Text>
                  <Text className="text-red-100 text-xs font-semibold">Sessions</Text>
               </View>
               <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm border border-[#e2e8f0]">
                  <Text className="text-[#8C4A28] text-[10px] font-bold tracking-wider mb-2">PENDING</Text>
                  <Text className="text-[#8C4A28] text-3xl font-bold mb-1">3</Text>
                  <Text className="text-[#8C4A28] text-xs font-semibold">Approvals</Text>
               </View>
               <View className="flex-1 bg-[#e6d0b3] rounded-2xl p-4">
                  <Text className="text-[#8C4A28] text-[10px] font-bold tracking-wider mb-2">HORSES</Text>
                  <Text className="text-[#8C4A28] text-3xl font-bold mb-1">12</Text>
                  <Text className="text-[#8C4A28] text-xs font-semibold">Assigned</Text>
               </View>
            </View>

            {/* Today's Schedule */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-bold text-[#1a202c]">Today's Schedule</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
                  <Text className="text-[#8C4A28] font-bold text-sm">View All</Text>
               </TouchableOpacity>
            </View>

            <View className="mb-8">
               {/* Card 1 */}
               <TouchableOpacity className="bg-white rounded-2xl flex-row items-center p-3 mb-3 shadow-sm border border-[#e2e8f0]" onPress={() => navigation.navigate('SessionDetail')}>
                  <View className="bg-[#8C4A28] p-3 rounded-xl items-center justify-center min-w-[60px] h-[60px] mr-3">
                     <Text className="text-white font-bold text-[13px]">09:00</Text>
                     <Text className="text-red-100 font-semibold text-[10px]">AM</Text>
                  </View>
                  <View className="flex-1">
                     <Text className="text-[#1a202c] font-bold text-[15px] mb-1">Show Jumping Practice</Text>
                     <Text className="text-[#64748b] text-xs font-semibold">Rider: Sarah J. • Horse: Thunder</Text>
                  </View>
                  <ChevronRight onPress={() => navigation.navigate("SessionDetail")} color="#8C4A28" size={20} className="ml-2" />
               </TouchableOpacity>

               {/* Card 2 */}
               <TouchableOpacity className="bg-white rounded-2xl flex-row items-center p-3 mb-3 shadow-sm border border-[#e2e8f0]">
                  <View className="bg-[#e6d0b3] p-3 rounded-xl items-center justify-center min-w-[60px] h-[60px] mr-3">
                     <Text className="text-[#8C4A28] font-bold text-[13px]">11:30</Text>
                     <Text className="text-[#8C4A28] opacity-80 font-semibold text-[10px]">AM</Text>
                  </View>
                  <View className="flex-1">
                     <Text className="text-[#1a202c] font-bold text-[15px] mb-1">Dressage Basics</Text>
                     <Text className="text-[#64748b] text-xs font-semibold">Rider: Mike D. • Horse: Bella</Text>
                  </View>
                  <ChevronRight onPress={() => navigation.navigate("SessionDetail")} color="#8C4A28" size={20} className="ml-2" />
               </TouchableOpacity>

               {/* Card 3 */}
               <TouchableOpacity className="bg-white rounded-2xl flex-row items-center p-3 shadow-sm border border-[#e2e8f0]">
                  <View className="bg-[#e6d0b3] p-3 rounded-xl items-center justify-center min-w-[60px] h-[60px] mr-3">
                     <Text className="text-[#8C4A28] font-bold text-[13px]">02:00</Text>
                     <Text className="text-[#8C4A28] opacity-80 font-semibold text-[10px]">PM</Text>
                  </View>
                  <View className="flex-1">
                     <Text className="text-[#1a202c] font-bold text-[15px] mb-1">Cross Country Intro</Text>
                     <Text className="text-[#64748b] text-xs font-semibold">Rider: Emma L. • Horse: Spirit</Text>
                  </View>
                  <ChevronRight onPress={() => navigation.navigate("SessionDetail")} color="#8C4A28" size={20} className="ml-2" />
               </TouchableOpacity>
            </View>

            {/* Assigned Horses */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-xl font-bold text-[#1a202c]">Assigned Horses</Text>
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
