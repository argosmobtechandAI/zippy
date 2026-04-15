import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, Search, Syringe, CheckCircle2, Plus, Stethoscope, ClipboardList } from 'lucide-react-native';
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
  const [activeTab, setActiveTab] = useState('All Status');
  const [recordType, setRecordType] = useState('Vaccinations'); // New toggle state
  const navigation = useNavigation();
  const route = useRoute();
  const { horseId } = (route.params as any) || {};

  const [loading, setLoading] = useState(true);
  const [vaccineRecords, setVaccineRecords] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [horseId]);

  const fetchData = async () => {
    setLoading(true);
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

  const activeRecords = recordType === 'Vaccinations' ? vaccineRecords : healthRecords;
  const selectedHorse = horseId ? horses.find(h => h.id === horseId) : null;

  const enrichedRecords = activeRecords.map(record => {
    const horse = horses.find(h => h.id === record.horseId);
    return { ...record, horse };
  });

  const filteredRecords = enrichedRecords.filter(r => {
    const recordName = r.name || r.title || "";
    const horseName = r.horse?.name || "";
    const matchesSearch = recordName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          horseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For vaccinations specifically, support status filtering
    if (recordType === 'Vaccinations') {
        if (activeTab === 'Upcoming') return matchesSearch && new Date(r.nextDate) > new Date();
        if (activeTab === 'Overdue') return matchesSearch && new Date(r.nextDate) < new Date();
        if (activeTab === 'Completed') return matchesSearch && new Date(r.date) <= new Date();
    }
    
    return matchesSearch;
  });

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

      {/* Internal Tabs (Only for Vaccinations) */}
      {recordType === 'Vaccinations' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6 h-10 flex-grow-0" contentContainerStyle={{ paddingRight: 20 }}>
            {['All Status ▼', 'Upcoming', 'Overdue', 'Completed'].map(tab => {
            const isAllStatus = tab === 'All Status ▼';
            const bgClass = isAllStatus ? 'bg-[#8C4A28]' : 'bg-white';
            const textClass = isAllStatus ? 'text-white' : 'text-[#8C4A28]';
            
            return (
                <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab.replace(' ▼', ''))}
                className={`px-4 py-2 border border-[#8C4A28]/30 rounded-full mr-2 justify-center items-center ${bgClass}`}
                >
                    <Text className={`text-[11px] font-bold ${textClass}`}>
                    {tab}
                    </Text>
                </TouchableOpacity>
            )
            })}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
                             {recordType === 'Vaccinations' && (
                                <View className="bg-[#f8fafc] p-3 border-t border-[#f1f5f9] flex-row justify-between items-center">
                                   <Text className="text-[#94a3b8] text-[9px]">Batch: {record.batchNumber}</Text>
                                   <TouchableOpacity onPress={() => navigation.navigate("LogVaccination", { horse: record.horse })} className="bg-[#8C4A28] px-4 py-2 rounded-xl flex-row items-center">
                                      <Syringe color="white" size={14} className="mr-2" />
                                      <Text className="text-white font-bold text-xs">Log New</Text>
                                   </TouchableOpacity>
                                </View>
                             )}
                          </View>
                      );
                  })}
             </View>
         ))}
      </ScrollView>

    </SafeAreaView>
  );
}
