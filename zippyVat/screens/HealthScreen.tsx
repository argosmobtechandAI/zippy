import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { ArrowLeft, Share2, Pill, Syringe, UploadCloud } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function HealthScreen() {

   const navigation = useNavigation()
   return (
      <SafeAreaView className="flex-1 bg-[#F5EDDF]">
         {/* Header */}
         <View className="flex-row items-center justify-between px-4 py-4 mb-2">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-white rounded-full">
               <ArrowLeft color="#8C4A28" size={20} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-[#1a202c]">Horse Health Report</Text>
            <TouchableOpacity className="p-2">
               <Share2 color="#8C4A28" size={20} />
            </TouchableOpacity>
         </View>

         <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Profile */}
            <View className="flex-row items-center mb-8">
               <View className="w-20 h-20 rounded-full border-4 border-white overflow-hidden mr-4 shadow-sm">
                  <Image
                     source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                     className="w-full h-full"
                  />
               </View>
               <View>
                  <Text className="text-xl font-bold text-[#1a202c] mb-1">Zippy Equestrian</Text>
                  <Text className="text-[#8C4A28] font-bold text-xs mb-2">Medical ID: #ZE-2024</Text>
                  <View className="bg-[#ccfbf1] px-3 py-1 rounded-full flex-row items-center self-start">
                     <View className="w-1.5 h-1.5 bg-[#14b8a6] rounded-full mr-1.5" />
                     <Text className="text-[#0f766e] text-[10px] font-bold">Stable: A-12</Text>
                  </View>
               </View>
            </View>

            {/* Health Status Tabs */}
            <View className="flex-row items-center mb-4">
               <ActivityIcon color="#1a202c" size={16} className="mr-2" />
               <Text className="text-sm font-bold text-[#1a202c]">Current Health Status</Text>
            </View>
            <View className="bg-white rounded-xl flex-row p-1 mb-6 border border-[#e2e8f0]">
               <TouchableOpacity className="flex-1 bg-[#8C4A28] py-2 rounded-lg items-center shadow-sm">
                  <Text className="text-white font-bold text-xs">Fit for Work</Text>
               </TouchableOpacity>
               <TouchableOpacity className="flex-1 py-2 items-center">
                  <Text className="text-[#8C4A28] font-semibold text-xs">Light Work</Text>
               </TouchableOpacity>
               <TouchableOpacity className="flex-1 py-2 items-center">
                  <Text className="text-[#8C4A28] font-semibold text-xs">Rest Required</Text>
               </TouchableOpacity>
            </View>

            {/* Weekly Health Summary */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
               <Text className="text-[#1a202c] font-bold text-sm mb-6">Weekly Health Summary</Text>

               {/* Dummy Chart Area */}
               <View className="h-24 justify-end mb-4">
                  {/* Just the x-axis labels */}
                  <View className="flex-row justify-between pl-2 pr-2 border-t border-[#f1f5f9] pt-2">
                     {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <Text key={i} className="text-[#94a3b8] text-[8px] font-bold">{d}</Text>
                     ))}
                  </View>
               </View>

               <Text className="text-[#64748b] text-xs leading-5">
                  Performance is 12% higher than last week. Vital signs remain stable within normal ranges.
               </Text>
            </View>

            {/* Veterinary Notes */}
            <Text className="text-sm font-bold text-[#1a202c] mb-3">Veterinary Notes</Text>
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-3 border border-[#e2e8f0] text-[#1a202c]"
               placeholder="Diagnosis title..."
               placeholderTextColor="#94a3b8"
            />
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-8 border border-[#e2e8f0] text-[#1a202c] min-h-[100px]"
               placeholder="Treatment notes and observation details..."
               placeholderTextColor="#94a3b8"
               multiline
               textAlignVertical="top"
            />

            {/* Medications */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-sm font-bold text-[#1a202c]">Medications</Text>
               <TouchableOpacity className="flex-row items-center">
                  <Text className="text-[#8C4A28] font-bold text-[10px]">+ Add New</Text>
               </TouchableOpacity>
            </View>

            <View className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] mb-3 flex-row items-center">
               <View className="w-10 h-10 bg-[#fde1d3] rounded-full items-center justify-center mr-3">
                  <Pill color="#8C4A28" size={18} />
               </View>
               <View className="flex-1">
                  <Text className="text-[#1a202c] font-bold text-sm">Equioxx Oral Paste</Text>
                  <Text className="text-[#94a3b8] text-xs">1 dose daily - Morning feed</Text>
               </View>
               <Text className="text-[#8C4A28] font-bold text-[8px] tracking-wider">ACTIVE</Text>
            </View>

            <View className="bg-white/60 rounded-xl p-4 shadow-sm border border-[#e2e8f0] mb-8 flex-row items-center opacity-80">
               <View className="w-10 h-10 bg-[#f1f5f9] rounded-full items-center justify-center mr-3">
                  <Syringe color="#94a3b8" size={18} />
               </View>
               <View className="flex-1">
                  <Text className="text-[#64748b] font-bold text-sm">West Nile Vaccine</Text>
                  <Text className="text-[#94a3b8] text-xs">Booster shot - Completed Oct 12</Text>
               </View>
            </View>

            {/* Medical Documents */}
            <Text className="text-sm font-bold text-[#1a202c] mb-3">Medical Documents</Text>
            <TouchableOpacity className="bg-[#fdfbf7] rounded-3xl p-6 border-2 border-dashed border-[#d1c2a3] items-center mb-8">
               <View className="w-12 h-12 rounded-full bg-[#fceee6] items-center justify-center mb-3">
                  <UploadCloud color="#8C4A28" size={24} />
               </View>
               <Text className="text-[#64748b] font-bold text-sm mb-1">Upload lab results or X-rays</Text>
               <Text className="text-[#94a3b8] text-[10px] mb-4">PDF, JPG, PNG (Max 10MB)</Text>
               <View className="bg-[#8C4A28] px-6 py-2 rounded-lg">
                  <Text className="text-white font-bold text-xs">Select Files</Text>
               </View>
            </TouchableOpacity>

         </ScrollView>
      </SafeAreaView>
   );
}

// Just an inline dummy SVG for the first icon
function ActivityIcon(props: any) {
   return (
      <View style={{ width: props.size, height: props.size, borderColor: props.color, borderWidth: 2, borderRadius: 4 }} />
   );
}
