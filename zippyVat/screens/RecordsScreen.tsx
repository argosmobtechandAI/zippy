import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { ArrowLeft, Calendar, Search, Syringe, CheckCircle2, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('All Status');
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 mb-2">
        <TouchableOpacity className="p-3 bg-white rounded-full shadow-sm">
           <ArrowLeft color="#8C4A28" size={20} />
        </TouchableOpacity>
        <View className="items-center flex-1">
           <Text className="text-xl font-bold text-[#8C4A28]">Health Records</Text>
           <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase">Vaccination Schedule</Text>
        </View>
       
      </View>

      {/* Search */}
      <View className="px-4 mb-4">
         <View className="bg-white rounded-full flex-row items-center px-4 py-2 border border-[#e2e8f0] shadow-sm">
            <Search color="#8C4A28" size={18} className="mr-2" />
            <TextInput 
              placeholder="Search..." 
              placeholderTextColor="#94a3b8"
              className="flex-1 text-[#1a202c] h-8"
            />
         </View>
      </View>

      {/* Internal Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6 h-10 flex-grow-0" contentContainerStyle={{ paddingRight: 20 }}>
         {['All Status ▼', 'Upcoming', 'Overdue', 'Completed'].map(tab => {
           const isAllStatus = tab === 'All Status ▼';
           const bgClass = isAllStatus ? 'bg-[#8C4A28]' : 'bg-white';
           const textClass = isAllStatus ? 'text-white' : 'text-[#8C4A28]';
           
           return (
             <TouchableOpacity 
               key={tab}
               className={`px-4 py-2 border border-[#8C4A28]/30 rounded-full mr-2 justify-center items-center ${bgClass}`}
             >
                <Text className={`text-[11px] font-bold ${textClass}`}>
                  {tab}
                </Text>
             </TouchableOpacity>
           )
         })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
         
         {/* OCTOBER 2023 */}
         <View className="flex-row items-center mb-4">
            <Text className="text-[#8C4A28] font-bold text-sm tracking-widest mr-4">OCTOBER 2023</Text>
            <View className="flex-1 h-[1px] bg-[#d1c2a3]" />
         </View>

         {/* Card 1 - Overdue */}
         <View className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-4 overflow-hidden">
            <View className="p-4 flex-row items-start">
               <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=200&auto=format&fit=crop' }} 
                 className="w-16 h-16 rounded-xl mr-3"
               />
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1 mt-1">
                     <Text className="text-[#1a202c] font-bold text-[15px]">Thunder Dash</Text>
                     <Text className="text-[#ef4444] bg-red-50 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Overdue</Text>
                  </View>
                  <Text className="text-[#64748b] text-xs mb-2">Influenza + Tetanus Booster</Text>
                  <View className="flex-row items-center">
                     <Calendar color="#ef4444" size={12} className="mr-1" />
                     <Text className="text-[#ef4444] text-[10px] font-bold">Due: Oct 02, 2023</Text>
                  </View>
               </View>
            </View>
            <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] items-end">
               <TouchableOpacity onPress={() => navigation.navigate("LogVaccination")} className="bg-[#8C4A28] px-4 py-2.5 rounded-xl flex-row items-center">
                  <Syringe color="white" size={14} className="mr-2" />
                  <Text className="text-white font-bold text-xs">Log Vaccination</Text>
               </TouchableOpacity>
            </View>
         </View>

         {/* Card 2 - Upcoming */}
         <View className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-8 overflow-hidden">
            <View className="p-4 flex-row items-start">
               <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }} 
                 className="w-16 h-16 rounded-xl mr-3"
               />
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1 mt-1">
                     <Text className="text-[#1a202c] font-bold text-[15px]">Luna Star</Text>
                     <Text className="text-[#d97706] bg-[#fef3c7] text-[9px] font-bold px-2 py-0.5 rounded uppercase">Upcoming</Text>
                  </View>
                  <Text className="text-[#64748b] text-xs mb-2">West Nile Virus (WNV)</Text>
                  <View className="flex-row items-center">
                     <Calendar color="#64748b" size={12} className="mr-1" />
                     <Text className="text-[#1a202c] font-bold text-[10px]">Due: Oct 22, 2023</Text>
                  </View>
               </View>
            </View>
            <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] items-end">
               <TouchableOpacity onPress={() => navigation.navigate("LogVaccination")} className="bg-[#8C4A28] px-4 py-2.5 rounded-xl flex-row items-center">
                  <Syringe color="white" size={14} className="mr-2" />
                  <Text className="text-white font-bold text-xs">Log Vaccination</Text>
               </TouchableOpacity>
            </View>
         </View>

         {/* NOVEMBER 2023 */}
         <View className="flex-row items-center mb-4">
            <Text className="text-[#8C4A28] font-bold text-sm tracking-widest mr-4">NOVEMBER 2023</Text>
            <View className="flex-1 h-[1px] bg-[#d1c2a3]" />
         </View>

         {/* Card 3 - Completed */}
         <View className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-8 overflow-hidden">
            <View className="p-4 flex-row items-start">
               <Image 
                 source={{ uri: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=200&auto=format&fit=crop' }} 
                 className="w-16 h-16 rounded-xl mr-3"
               />
               <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1 mt-1">
                     <Text className="text-[#1a202c] font-bold text-[15px]">Midnight Blue</Text>
                     <Text className="text-[#059669] bg-[#d1fae5] text-[9px] font-bold px-2 py-0.5 rounded uppercase">Completed</Text>
                  </View>
                  <Text className="text-[#94a3b8] text-xs mb-2">Rabies Annual Vaccine</Text>
                  <View className="flex-row items-center">
                     <CheckCircle2 color="#059669" size={12} className="mr-1" />
                     <Text className="text-[#059669] font-bold text-[10px]">Done: Nov 01, 2023</Text>
                  </View>
               </View>
            </View>
            <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] flex-row justify-between items-center">
               <Text className="text-[#94a3b8] text-[9px]">Dr. Elena Thorne, VMD</Text>
               <TouchableOpacity className="bg-white border border-[#e2e8f0] px-4 py-2 rounded-xl">
                  <Text className="text-[#8C4A28] font-bold text-xs">View Certificate</Text>
               </TouchableOpacity>
            </View>
         </View>
      </ScrollView>

      {/* FAB over everything */}
      <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-[#8C4A28] rounded-full items-center justify-center shadow-lg border border-[#6b381e]">
         <Plus color="white" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
