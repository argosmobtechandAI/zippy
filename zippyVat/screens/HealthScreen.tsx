import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, Share2, Pill, Syringe, UploadCloud, Activity, ChevronRight, Stethoscope, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { baseURL, getAllHorsesApi, getHorseApi, updateHealthStatusApi } from '../api/api';

export default function HealthScreen({ navigation, route }: any) {
   const { horse: initialHorse } = route.params as any;

   const [notesTitle, setNotesTitle] = useState("");
   const [notesContent, setNotesContent] = useState("");
   const [health, setHealth] = useState("Fit for Work")
   const [stat, setStat] = useState("Fit for Work")
   const [saving, setSaving] = useState(false);
   const [refreshing, setRefreshing] = useState(false);
   const [treatment, setTreatment] = useState("");
   const [medicationInput, setMedicationInput] = useState("");
   const [medications, setMedications] = useState<string[]>([]);

   const [currentHorse, setCurrentHorse] = useState(null);

   useEffect(() => {
      const fetchHorse = async () => {
         try {

            const res = await apiFunction(
               getAllHorsesApi,
               [initialHorse.id],
               {},
               "GET",
               true
            );

            console.log(res.horse, "resssHorse")
            if (res && res.success && res.horse) {

               setCurrentHorse(res.horse);
            }
         } catch (err) {
            console.log(err);
         } finally {
            setRefreshing(false);
         }
      };

      fetchHorse();
   }, [initialHorse, refreshing]);

   const onRefresh = async () => {
      setRefreshing(true);
   };

   const handleAddMedication = () => {
      if (medicationInput.trim() !== "") {
         setMedications([...medications, medicationInput.trim()]);
         setMedicationInput("");
      }
   };

   const handleRemoveMedication = (index: number) => {
      setMedications(medications.filter((_, i) => i !== index));
   };

   const handleSaveHealth = async () => {
      if (!notesTitle || !notesContent || !health) {
         Alert.alert("Error", "Please enter both title and notes.");
         return;
      }

      setSaving(true);
      const status = health === 'Fit for Work' ? 'Fit' : health === 'Light Work' ? 'Light Work' : 'Unfit';
      try {
         const res = await apiFunction(updateHealthStatusApi, [], {
            horseId: initialHorse.id,
            title: notesTitle,
            notes: notesContent,
            status: status,
            date: new Date().toISOString(),
            treatment: treatment,
            medications: medications
         }, "POST", true);

         if (res && res.success) {
            Alert.alert("Success", "Health status logged successfully.");
            setNotesTitle("");
            setNotesContent("");
            setTreatment("");
            setMedications([]);
            setMedicationInput("");
         }
      } catch (error) {
         Alert.alert("Error", "Failed to save health logs.");
      } finally {
         setSaving(false);
      }
   };





   return (
      <SafeAreaView className="flex-1 bg-[#F5EDDF]">
         {/* Header */}
         <View className="flex-row items-center justify-between px-4 py-4 mb-2 mt-2">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-white rounded-full">
               <ArrowLeft color="#8C4A28" size={20} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-[#1a202c]">Horse Health Report</Text>
            <TouchableOpacity className="p-2">
               <Share2 color="#8C4A28" size={20} />
            </TouchableOpacity>
         </View>



         <ScrollView
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#8C4A28"
                  colors={["#8C4A28"]}
               />
            }
         >
            {/* Profile */}
            <View className="flex-row items-center mb-8">
               <View className="w-20 h-20 rounded-full border-4 border-white overflow-hidden mr-4 shadow-sm bg-[#FAF7F2] items-center justify-center">
                  {currentHorse?.image || currentHorse?.imageUrl ? (
                     <Image
                        source={{ uri: currentHorse?.image || currentHorse?.imageUrl }}
                        className="w-full h-full"
                     />
                  ) : (
                     <View className="items-center justify-center">
                        <Stethoscope color="#8C4A28" size={24} opacity={0.6} />
                        <Text className="text-[8px] font-bold text-[#8C4A28]/40 uppercase mt-1">Zippy</Text>
                     </View>
                  )}
               </View>
               <View>
                  <Text className="text-xl font-bold text-[#1a202c] mb-1">{currentHorse?.name}</Text>
                  <Text className="text-[#8C4A28] font-bold text-xs mb-2">Medical ID: #{currentHorse?.id?.slice(0, 8)}</Text>
                  <View className="bg-[#ccfbf1] px-3 py-1 rounded-full flex-row items-center self-start">
                     <View className="w-1.5 h-1.5 bg-[#14b8a6] rounded-full mr-1.5" />
                     <Text className="text-[#0f766e] text-[10px] font-bold">Stable: {currentHorse?.location}</Text>
                  </View>
               </View>
            </View>

            {/* Health Status Tabs */}
            <View className="flex-row items-center mb-4">
               <Activity color="#1a202c" size={16} className="mr-2" />
               <Text className="text-sm font-bold text-[#1a202c]">Current Health Status</Text>
            </View>
            <View className="bg-white rounded-xl flex-row p-1 mb-6 border border-[#e2e8f0]">
               {['Fit for Work', 'Light Work', 'Rest Required'].map((status) => (
                  <TouchableOpacity
                     key={status}
                     onPress={() => setHealth(status)}
                     className={`flex-1 py-2 rounded-lg items-center`}
                     style={{ backgroundColor: health === status ? '#8C4A28' : 'transparent' }}
                  >
                     <Text style={{ color: health === status ? "white" : "#8C4A28" }} className={`font-bold text-xs `}>{status}</Text>
                  </TouchableOpacity>
               ))}
            </View>

            {/* Weekly Health Summary */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-6">
               <Text className="text-[#1a202c] font-bold text-sm mb-6">Weekly Health Summary</Text>

               <View className="h-24 justify-end mb-4 bg-[#f8fafc] rounded-xl relative overflow-hidden">
                  <View className="flex-row justify-between items-end px-4 pb-8 w-full h-full">
                     {[40, 60, 45, 80, 50, 70, 65].map((h, i) => (
                        <View
                           key={i}
                           style={{ height: `${h}%` }}
                           className={`w-2 rounded-full ${i === 3 ? 'bg-[#8C4A28]' : 'bg-[#d1c2a3]'}`}
                        />
                     ))}
                  </View>
                  <View className="flex-row justify-between pl-4 pr-4 border-t border-[#f1f5f9] pt-2 w-full absolute bottom-0">
                     {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <Text key={i} className="text-[#94a3b8] text-[8px] font-bold">{d}</Text>
                     ))}
                  </View>
               </View>

               {/* <Text className="text-[#64748b] text-xs leading-5">
                  Vitals for {currentHorse?.name} remain stable. Last check recorded {currentHorse?.shoeStatus || 'Stable'} condition. {health === 'Fit for Work' ? 'Regular training recommended.' : 'Observation period active.'}
               </Text> */}
            </View>

            {/* Veterinary Notes */}
            <Text className="text-sm font-bold text-[#1a202c] mb-3">Veterinary Notes</Text>
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-3 border border-[#e2e8f0] text-[#1a202c]"
               placeholder="Diagnosis title..."
               placeholderTextColor="#94a3b8"
               value={notesTitle}
               onChangeText={setNotesTitle}
            />
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-3 border border-[#e2e8f0] text-[#1a202c] min-h-[100px]"
               placeholder="Treatment notes and observation details..."
               placeholderTextColor="#94a3b8"
               multiline
               textAlignVertical="top"
               value={notesContent}
               onChangeText={setNotesContent}
            />

            {/* Treatment */}
            <Text className="text-sm font-bold text-[#1a202c] mb-3 mt-4">Treatment</Text>
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-3 border border-[#e2e8f0] text-[#1a202c]"
               placeholder="Treatment provided..."
               placeholderTextColor="#94a3b8"
               value={treatment}
               onChangeText={setTreatment}
            />

            {/* Medications */}
            <Text className="text-sm font-bold text-[#1a202c] mb-3">Medications</Text>
            <TextInput
               className="bg-white rounded-xl px-4 py-3 mb-2 border border-[#e2e8f0] text-[#1a202c]"
               placeholder="Enter medication and press Enter..."
               placeholderTextColor="#94a3b8"
               value={medicationInput}
               onChangeText={setMedicationInput}
               onSubmitEditing={handleAddMedication}
               returnKeyType="done"
            />

            <View className="flex-row flex-wrap mb-4">
               {medications.map((med, index) => (
                  <View key={index} className="flex-row items-center bg-[#fde1d3] px-3 py-1.5 rounded-full mr-2 mb-2 border border-[#fbd3c1]">
                     <Text className="text-[#8C4A28] text-xs font-bold mr-2">{med}</Text>
                     <TouchableOpacity onPress={() => handleRemoveMedication(index)}>
                        <X color="#8C4A28" size={14} />
                     </TouchableOpacity>
                  </View>
               ))}
            </View>

            <TouchableOpacity
               disabled={saving}
               onPress={handleSaveHealth}
               className="bg-[#8C4A28] py-3 rounded-xl items-center mb-8"
            >
               {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Log Health Entry</Text>}
            </TouchableOpacity>

            {/* Medications & Vaccination Links */}
            <View className="flex-row justify-between items-center mb-4">
               <Text className="text-sm font-bold text-[#1a202c]">Vaccinations & Procedures</Text>
               <TouchableOpacity onPress={() => navigation.navigate("LogVaccination", { horse: currentHorse })}>
                  <View className="flex-row items-center bg-[#8C4A28]/10 px-3 py-1.5 rounded-lg border border-[#8C4A28]/20">
                     <Syringe color="#8C4A28" size={12} className="mr-1" />
                     <Text className="text-[#8C4A28] font-bold text-[10px]">Log Vaccine</Text>
                  </View>
               </TouchableOpacity>
            </View>

            <TouchableOpacity
               activeOpacity={0.8}
               onPress={() => navigation.navigate("Records", { horseId: currentHorse?.id })}
               className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] mb-8 flex-row items-center"
            >
               <View className="w-10 h-10 bg-[#fde1d3] rounded-full items-center justify-center mr-3">
                  <Syringe color="#8C4A28" size={18} />
               </View>
               <View className="flex-1">
                  <Text className="text-[#1a202c] font-bold text-sm">Vaccination Records</Text>
                  <Text className="text-[#94a3b8] text-xs">{currentHorse?.vaccinationRecords?.length || 0} entries found</Text>
               </View>
               <ChevronRight color="#94a3b8" size={20} />
            </TouchableOpacity>

         </ScrollView>
      </SafeAreaView>
   );
}
