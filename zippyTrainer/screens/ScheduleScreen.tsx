import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Menu, Bell, MapPin, CheckCircle2, XCircle, Clock, ChevronRight, Calendar as CalendarIcon, MoreVertical, Loader } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function ScheduleScreen() {
  
   const [selectedDay, setSelectedDay] = useState('18');
   const navigation = useNavigation()

   return (
      <View className="flex-1 bg-[#F5EDDF]">
         {/* Header */}
         <View className="flex-row justify-between items-center px-4 py-4 mb-2">
            
            <Text className="text-lg font-bold text-[#1a202c]">Schedule</Text>
           
         </View>


         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            

            
               <View>
                  {/* Calendar / Date Selector */}
                  <View className="flex-row justify-between items-center mb-6">
                     <View>
                        <Text className="text-2xl font-bold text-[#1a202c] mb-1">October 2026</Text>
                        <Text className="text-[#64748b] text-sm">Week 3 • 14 Sessions Scheduled</Text>
                     </View>
                     <TouchableOpacity onPress={()=> navigation.navigate("Pending")}  className="bg-white p-2 rounded-xl flex flex-row gap-2 items-center border border-[#e2e8f0]">
                        <Loader color="#8C4A28" size={20} />
                        <Text className="text-[#8C4A28] text-xs font-semibold">Pending Requests</Text>
                     </TouchableOpacity>
                  </View>

                  {/* Horizontal Day Selector */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                     {[
                        { day: 'MON', date: '16' },
                        { day: 'TUE', date: '17' },
                        { day: 'WED', date: '18' },
                        { day: 'THU', date: '19' },
                        { day: 'FRI', date: '20' },
                        { day: 'SAT', date: '21' },
                        { day: 'SUN', date: '22' }
                     ].map((item, index) => (
                        <TouchableOpacity
                           key={index}
                           onPress={() => setSelectedDay(item.date)}
                           className={`rounded-2xl p-4 items-center mr-3 min-w-[70px] ${
                              selectedDay === item.date 
                                 ? 'bg-[#8C4A28]' 
                                 : 'bg-white border border-[#e2e8f0]'
                           }`}
                        >
                           <Text className={`text-[10px] font-bold mb-2 ${
                              selectedDay === item.date ? 'text-white opacity-80' : 'text-[#94a3b8]'
                           }`}>
                              {item.day}
                           </Text>
                           <Text className={`font-bold text-xl ${
                              selectedDay === item.date ? 'text-white' : 'text-[#1a202c]'
                           }`}>
                              {item.date}
                           </Text>
                        </TouchableOpacity>
                     ))}
                  </ScrollView>

                  {/* Sessions List */}
                  <View className="mb-6">
                     <Text className="text-lg font-bold text-[#1a202c] mb-4">
                        {
                           selectedDay === '16' ? "Monday's Sessions" :
                           selectedDay === '17' ? "Tuesday's Sessions" :
                           selectedDay === '18' ? "Wednesday's Sessions" :
                           selectedDay === '19' ? "Thursday's Sessions" :
                           selectedDay === '20' ? "Friday's Sessions" :
                           selectedDay === '21' ? "Saturday's Sessions" :
                           "Sunday's Sessions"
                        }
                     </Text>
                     
                     {/* Session 1 */}
                     <TouchableOpacity onPress={() => navigation.navigate("SessionDetail")} activeOpacity={0.7} className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4 flex-row">
                        {/* Time column */}
                        <View className="items-center mr-4 w-12">
                           <Text className="text-[#1a202c] font-bold text-base">08:00</Text>
                           <Text className="text-[#94a3b8] font-semibold text-[10px] mb-1">AM</Text>
                           <View className="w-[2px] h-10 bg-[#e2e8f0] my-1 rounded-full"></View>
                           <Text className="text-[#94a3b8] font-bold text-xs mt-1">09:30</Text>
                        </View>
                        
                        {/* Content */}
                        <View className="flex-1 bg-[#F5EDDF] rounded-2xl p-3 border border-[#e6d0b3]">
                           <View className="flex-row justify-between mb-2">
                              <Text className="bg-white px-2 py-1 rounded-md text-[#8C4A28] text-[10px] font-bold">Dressage</Text>
                              <TouchableOpacity>
                                 <MoreVertical color="#8C4A28" size={16} />
                              </TouchableOpacity>
                           </View>
                           <Text className="text-[#1a202c] font-bold text-lg mb-1">Emma Wilson</Text>
                           <View className="flex-row items-center mb-3">
                              <Clock color="#8C4A28" size={12} className="mr-1" />
                              <Text className="text-[#8C4A28] text-xs font-semibold mr-3">1.5 hrs</Text>
                              <MapPin color="#8C4A28" size={12} className="mr-1" />
                              <Text className="text-[#8C4A28] text-xs font-semibold">Arena B</Text>
                           </View>
                           <View className="flex-row items-center bg-white p-2 rounded-xl">
                              <Image 
                                 source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                                 className="w-8 h-8 rounded-lg mr-2"
                              />
                              <View>
                                 <Text className="text-[#1a202c] font-bold text-xs">Bella</Text>
                                 <Text className="text-[#94a3b8] text-[10px]">Mare • Stall B04</Text>
                              </View>
                           </View>
                        </View>
                     </TouchableOpacity>

                     {/* Session 2 */}
                     <TouchableOpacity onPress={() => navigation.navigate("SessionDetail")} activeOpacity={0.7} className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4 flex-row">
                        {/* Time column */}
                        <View className="items-center mr-4 w-12">
                           <Text className="text-[#1a202c] font-bold text-base">10:30</Text>
                           <Text className="text-[#94a3b8] font-semibold text-[10px] mb-1">AM</Text>
                           <View className="w-[2px] h-10 bg-[#e2e8f0] my-1 rounded-full"></View>
                           <Text className="text-[#94a3b8] font-bold text-xs mt-1">11:30</Text>
                        </View>
                        
                        {/* Content */}
                        <View className="flex-1 bg-[#ebf8ff] rounded-2xl p-3 border border-[#bee3f8]">
                           <View className="flex-row justify-between mb-2">
                              <Text className="bg-white px-2 py-1 rounded-md text-[#2b6cb0] text-[10px] font-bold">Show Jumping</Text>
                              <TouchableOpacity>
                                 <MoreVertical color="#2b6cb0" size={16} />
                              </TouchableOpacity>
                           </View>
                           <Text className="text-[#1a202c] font-bold text-lg mb-1">Liam Noah</Text>
                           <View className="flex-row items-center mb-3">
                              <Clock color="#2b6cb0" size={12} className="mr-1" />
                              <Text className="text-[#2b6cb0] text-xs font-semibold mr-3">1 hr</Text>
                              <MapPin color="#2b6cb0" size={12} className="mr-1" />
                              <Text className="text-[#2b6cb0] text-xs font-semibold">Main Arena</Text>
                           </View>
                           <View className="flex-row items-center bg-white p-2 rounded-xl">
                              <Image 
                                 source={{ uri: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=200&auto=format&fit=crop' }}
                                 className="w-8 h-8 rounded-lg mr-2"
                              />
                              <View>
                                 <Text className="text-[#1a202c] font-bold text-xs">Thunder</Text>
                                 <Text className="text-[#94a3b8] text-[10px]">Gelding • Stall A12</Text>
                              </View>
                           </View>
                        </View>
                     </TouchableOpacity>

                     {/* Session 3 */}
                     <TouchableOpacity onPress={() => navigation.navigate("SessionDetail")} activeOpacity={0.7} className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] flex-row">
                        {/* Time column */}
                        <View className="items-center mr-4 w-12">
                           <Text className="text-[#1a202c] font-bold text-base">02:00</Text>
                           <Text className="text-[#94a3b8] font-semibold text-[10px] mb-1">PM</Text>
                           <View className="w-[2px] h-10 bg-[#e2e8f0] my-1 rounded-full"></View>
                           <Text className="text-[#94a3b8] font-bold text-xs mt-1">04:00</Text>
                        </View>
                        
                        {/* Content */}
                        <View className="flex-1 bg-[#f0fff4] rounded-2xl p-3 border border-[#c6f6d5]">
                           <View className="flex-row justify-between mb-2">
                              <Text className="bg-white px-2 py-1 rounded-md text-[#2f855a] text-[10px] font-bold">Trail Ride</Text>
                              <TouchableOpacity>
                                 <MoreVertical color="#2f855a" size={16} />
                              </TouchableOpacity>
                           </View>
                           <Text className="text-[#1a202c] font-bold text-lg mb-1">Sophia Grace</Text>
                           <View className="flex-row items-center mb-3">
                              <Clock color="#2f855a" size={12} className="mr-1" />
                              <Text className="text-[#2f855a] text-xs font-semibold mr-3">2 hrs</Text>
                              <MapPin color="#2f855a" size={12} className="mr-1" />
                              <Text className="text-[#2f855a] text-xs font-semibold">Forest Trail</Text>
                           </View>
                           <View className="flex-row items-center bg-white p-2 rounded-xl">
                              <Image 
                                 source={{ uri: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=200&auto=format&fit=crop' }}
                                 className="w-8 h-8 rounded-lg mr-2"
                              />
                              <View>
                                 <Text className="text-[#1a202c] font-bold text-xs">Spirit</Text>
                                 <Text className="text-[#94a3b8] text-[10px]">Stallion • Stall C01</Text>
                              </View>
                           </View>
                        </View>
                     </TouchableOpacity>

                  </View>
               </View>
            
         </ScrollView>
      </View>
   );
}
