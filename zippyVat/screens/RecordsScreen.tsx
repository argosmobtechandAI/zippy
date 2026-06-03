import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, RefreshControl, Alert } from 'react-native';
import { ArrowLeft, Calendar, Search, Syringe, CheckCircle2, Plus, Stethoscope, ClipboardList, X } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getVaccinationRecordsApi, getAllHorsesApi, getHealthRecordsApi } from '../api/api';

const getMonthYear = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
    } catch (e) {
        return 'UNKNOWN';
    }
};

export default function RecordsScreen() {
  const [recordType, setRecordType] = useState('Vaccinations'); // New toggle state
  const navigation = useNavigation();
  const route = useRoute();
  const { horseId } = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vaccineRecords, setVaccineRecords] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedFilterHorseId, setSelectedFilterHorseId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [horseId]);

  const fetchData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      // Build query params if horseId exists
      const query = horseId ? `?horseId=${horseId}` : "";
      
      const [vacRes, healthRes, horseRes] = await Promise.all([
        apiFunction(`${getVaccinationRecordsApi}${query}`, [], {}, "GET", true),
        apiFunction(`${getHealthRecordsApi}${query}`, [], {}, "GET", true),
        apiFunction(getAllHorsesApi, [], {}, "GET", true)
      ]);

      if (vacRes && vacRes.success) setVaccineRecords(vacRes.records || []);
      if (healthRes && healthRes.success) setHealthRecords(healthRes.records || []);
      if (horseRes && horseRes.success) setHorses(horseRes.horses || []);
    } catch (error) {
      console.error("Fetch records error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(false);
    setRefreshing(false);
  };

  const activeRecords = recordType === 'Vaccinations' ? vaccineRecords : healthRecords;
  const selectedHorse = horseId ? horses.find(h => h.id === horseId) : null;

  const enrichedRecords = activeRecords.map(record => {
    // Supabase might return the horse ID in 'horse' or 'horseId' depending on the table schema
    const refId = record.horseId || (record.horse && typeof record.horse === 'object' ? record.horse.id : record.horse);
    const horseObj = horses.find(h => h.id === refId);
    return { 
      ...record, 
      horse: horseObj, 
      horseId: refId,
      nextDate: record.nextDate || record.next_date,
      batchNumber: record.batchNumber || record.batch_number
    };
  });

  const filteredRecords = enrichedRecords.filter(r => {
    const recordName = r.name || r.title || "";
    const horseName = r.horse?.name || "";
    const matchesSearch = recordName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          horseName.toLowerCase().includes(searchQuery.toLowerCase());
    const recordHorseId = r.horseId || (r.horse && typeof r.horse === 'object' ? r.horse.id : r.horse);
    const matchesHorse = selectedFilterHorseId ? (recordHorseId === selectedFilterHorseId || r.horse?.id === selectedFilterHorseId) : true;
    return matchesSearch && matchesHorse;
  });

  // Sort descending by date (newest first)
  filteredRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by month
  const groupedRecords: { [key: string]: any[] } = {};
  filteredRecords.forEach(r => {
    const month = getMonthYear(r.date);
    if (!groupedRecords[month]) groupedRecords[month] = [];
    groupedRecords[month].push(r);
  });

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 mb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-3 bg-white rounded-full shadow-sm">
           <ArrowLeft color="#8C4A28" size={20} />
        </TouchableOpacity>
        <View className="items-center flex-1">
           <Text className="text-xl font-bold text-[#8C4A28]">{selectedHorse ? `${selectedHorse.name}'s History` : 'Health Records'}</Text>
           <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase">Clinical Timeline</Text>
        </View>
       
      </View>

      {/* Search */}
      <View className="px-4 mt-2 mb-4">
         <View className="flex-row items-center justify-between">
             <View className="flex-1 mr-3 flex-row items-center bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] shadow-sm">
                <Search color="#94a3b8" size={18} className="mr-2" />
                <TextInput 
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..." 
                  placeholderTextColor="#94a3b8"
                  className="flex-1 text-[#1a202c] h-10"
                />
             </View>
             
             <TouchableOpacity 
                 onPress={() => {
                     if (recordType === 'Vaccinations') {
                         navigation.navigate("LogVaccination", { horseId: horseId || selectedFilterHorseId });
                     } else {
                         const targetHorse = horses.find(h => h.id === (horseId || selectedFilterHorseId));
                         if (targetHorse) {
                             navigation.navigate("PatientDetail", { horse: targetHorse });
                         } else {
                             Alert.alert("Select Patient", "Please filter/select a patient horse first to log a health note.");
                         }
                     }
                 }} 
                 className="bg-[#8C4A28] px-4 py-2 rounded-2xl flex-row items-center h-12 shadow-sm"
             >
                 <Plus color="white" size={16} className="mr-2" />
                 <Text className="text-white font-bold text-xs">Log New</Text>
             </TouchableOpacity>
         </View>
      </View>

      {/* Record Type Toggle */}
      <View className="px-4 flex-row mb-6">
          <TouchableOpacity 
            onPress={() => setRecordType('Vaccinations')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl mr-2 border ${recordType === 'Vaccinations' ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#8C4A28]/20'}`}
          >
              <Syringe size={16} color={recordType === 'Vaccinations' ? 'white' : '#8C4A28'} className="mr-2" />
              <Text className={`font-bold text-xs ${recordType === 'Vaccinations' ? 'text-white' : 'text-[#8C4A28]'}`}>Vaccinations</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setRecordType('Health')}
            className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl border ${recordType === 'Health' ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#8C4A28]/20'}`}
          >
              <Stethoscope size={16} color={recordType === 'Health' ? 'white' : '#8C4A28'} className="mr-2" />
              <Text className={`font-bold text-xs ${recordType === 'Health' ? 'text-white' : 'text-[#8C4A28]'}`}>Health Notes</Text>
          </TouchableOpacity>
      </View>

      {/* Horse Filter */}
      {!horseId && horses.length > 0 && (
         <View className="mb-4">
             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                 <TouchableOpacity 
                    onPress={() => setSelectedFilterHorseId(null)}
                    className={`px-4 py-2 rounded-full mr-2 border ${!selectedFilterHorseId ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#8C4A28]/20'}`}
                 >
                    <Text className={`text-xs font-bold ${!selectedFilterHorseId ? 'text-white' : 'text-[#8C4A28]'}`}>All Horses</Text>
                 </TouchableOpacity>
                 {horses.map(h => (
                     <TouchableOpacity 
                        key={h.id}
                        onPress={() => setSelectedFilterHorseId(h.id)}
                        className={`px-4 py-2 rounded-full mr-2 border ${selectedFilterHorseId === h.id ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#8C4A28]/20'}`}
                     >
                        <Text className={`text-xs font-bold ${selectedFilterHorseId === h.id ? 'text-white' : 'text-[#8C4A28]'}`}>{h.name}</Text>
                     </TouchableOpacity>
                 ))}
             </ScrollView>
         </View>
      )}

      <ScrollView 
         contentContainerStyle={{ padding: 16, paddingBottom: 100 }} 
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
         {loading ? (
             <ActivityIndicator size="large" color="#8C4A28" />
         ) : Object.keys(groupedRecords).length === 0 ? (
             <View className="py-20 items-center justify-center">
                 <Syringe size={48} color="#94a3b8" />
                 <Text className="text-[#64748b] font-bold mt-4">No health records found.</Text>
             </View>
         ) : Object.keys(groupedRecords).map(month => (
             <View key={month}>
                 <View className="flex-row items-center mb-4 mt-2">
                    <Text className="text-[#8C4A28] font-bold text-sm tracking-widest mr-4">{month}</Text>
                    <View className="flex-1 h-[1px] bg-[#d1c2a3]" />
                 </View>

                 {groupedRecords[month].map((record) => {
                      const isOverdue = recordType === 'Vaccinations' && new Date(record.nextDate) < new Date();
                      const isUpcoming = recordType === 'Vaccinations' && new Date(record.nextDate) > new Date();

                      return (
                          <View key={record.id} className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] mb-4 overflow-hidden">
                             <View className="p-4 flex-row items-start">
                                <View className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${recordType === 'Vaccinations' ? 'bg-[#fde1d3]' : 'bg-[#e0f2fe]'}`}>
                                   {recordType === 'Vaccinations' ? <Syringe color="#8C4A28" size={24} /> : <Stethoscope color="#0284c7" size={24} />}
                                </View>
                                <View className="flex-1">
                                   <View className="flex-row justify-between items-center mb-1">
                                      <Text className="text-[#1a202c] font-black text-[15px]">{record.name || record.title}</Text>
                                      {recordType === 'Vaccinations' && (
                                          <Text className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                              isOverdue ? 'text-[#ef4444] bg-red-50' : isUpcoming ? 'text-[#d97706] bg-[#fef3c7]' : 'text-[#059669] bg-[#d1fae5]'
                                          }`}>
                                              {isOverdue ? 'Overdue' : isUpcoming ? 'Upcoming' : 'Completed'}
                                          </Text>
                                      )}
                                   </View>
                                   <Text className="text-[#64748b] text-xs mb-2 font-bold uppercase tracking-tight">
                                       Patient: {record.horse?.name || 'Loading...'}
                                   </Text>
                                   <View className="flex-row items-center mb-2">
                                      <Calendar color="#64748b" size={12} className="mr-1" />
                                      <Text className="text-[10px] font-bold text-[#1a202c]">
                                          {new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </Text>
                                   </View>
                                   {(record.notes || record.treatment) && (
                                       <View className="bg-[#f8fafc] p-3 rounded-lg border border-[#f1f5f9]">
                                           <Text className="text-[#475569] text-xs leading-4">{record.notes || record.treatment}</Text>
                                       </View>
                                   )}
                                </View>
                             </View>
                             {recordType === 'Vaccinations' ? (
                                <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] flex-row justify-between items-center">
                                   <Text className="text-[#94a3b8] text-[9px]">Batch: {record.batchNumber}</Text>
                                   <TouchableOpacity onPress={() => setSelectedRecord(record)} className="bg-white border border-[#e2e8f0] px-4 py-2 rounded-xl">
                                      <Text className="text-[#64748b] font-bold text-xs">View Details</Text>
                                   </TouchableOpacity>
                                </View>
                             ) : (
                                <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] flex-row justify-end items-center">
                                   <TouchableOpacity onPress={() => setSelectedRecord(record)} className="bg-white border border-[#e2e8f0] px-4 py-2 rounded-xl">
                                      <Text className="text-[#64748b] font-bold text-xs">View Details</Text>
                                   </TouchableOpacity>
                                </View>
                             )}
                          </View>
                      );
                  })}
             </View>
         ))}
      </ScrollView>

      {/* View Details Modal */}
      <Modal visible={!!selectedRecord} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
              <View className="bg-white rounded-t-3xl pt-2 px-6 pb-10 min-h-[50%]">
                  <View className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
                  
                  {selectedRecord && (
                      <>
                          <View className="flex-row justify-between items-start mb-6">
                              <View className="flex-1">
                                  <Text className="text-[10px] font-bold text-[#8C4A28] uppercase tracking-widest mb-1">
                                      {recordType === 'Vaccinations' ? 'Vaccination Record' : 'Health Note'}
                                  </Text>
                                  <Text className="text-2xl font-black text-[#1a202c]">
                                      {selectedRecord.name || selectedRecord.title}
                                  </Text>
                                  <Text className="text-sm font-bold text-gray-500 mt-1">
                                      Patient: {selectedRecord.horse?.name || 'Unknown'}
                                  </Text>
                              </View>
                              <TouchableOpacity onPress={() => setSelectedRecord(null)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                  <X color="#64748b" size={20} />
                              </TouchableOpacity>
                          </View>

                          <ScrollView showsVerticalScrollIndicator={false}>
                              <View className="bg-[#fdfaf7] rounded-2xl p-5 mb-4 border border-[#f5eedf]">
                                  <View className="flex-row mb-4">
                                      <View className="flex-1">
                                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date Logged</Text>
                                          <Text className="text-sm font-bold text-[#1a202c]">
                                              {new Date(selectedRecord.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                                          </Text>
                                      </View>
                                      {recordType === 'Vaccinations' && selectedRecord.nextDate && (
                                          <View className="flex-1">
                                              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Next Due</Text>
                                              <Text className="text-sm font-bold text-[#1a202c]">
                                                  {new Date(selectedRecord.nextDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                              </Text>
                                          </View>
                                      )}
                                  </View>

                                  {recordType === 'Health' && selectedRecord.status && (
                                      <View className="mb-4">
                                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Status</Text>
                                          <Text className="text-sm font-bold text-[#1a202c]">{selectedRecord.status}</Text>
                                      </View>
                                  )}

                                  {recordType === 'Vaccinations' && selectedRecord.batchNumber && (
                                      <View className="mb-4">
                                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Batch Number</Text>
                                          <Text className="text-sm font-bold text-[#1a202c]">{selectedRecord.batchNumber}</Text>
                                      </View>
                                  )}

                                  {(selectedRecord.notes || selectedRecord.treatment) && (
                                      <View>
                                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clinical Notes & Treatment</Text>
                                          <Text className="text-sm text-[#475569] leading-6 bg-white p-4 rounded-xl border border-gray-100 mt-1">
                                              {selectedRecord.notes || selectedRecord.treatment}
                                          </Text>
                                      </View>
                                  )}

                                  {recordType === 'Health' && selectedRecord.medications && selectedRecord.medications.length > 0 && (
                                      <View className="mt-4">
                                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Prescribed Medications</Text>
                                          {selectedRecord.medications.map((med: any, idx: number) => (
                                              <View key={idx} className="bg-white p-3 rounded-lg border border-gray-100 mb-2 flex-row justify-between items-center">
                                                  <Text className="text-xs font-bold text-[#1a202c]">{med.name}</Text>
                                                  <Text className="text-xs text-gray-500">{med.dosage}</Text>
                                              </View>
                                          ))}
                                      </View>
                                  )}
                              </View>
                          </ScrollView>
                      </>
                  )}
              </View>
          </View>
      </Modal>

    </SafeAreaView>
  );
}
