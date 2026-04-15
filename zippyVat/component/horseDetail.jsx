import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { ArrowLeft, HeartPulse, CalendarCheck, Activity, Zap, ShieldCheck, MapPin, MoreVertical, ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getHealthRecordsApi, getVaccinationRecordsApi, getSessionsApi } from '../api/api';

const HorseDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { horse } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [healthRecords, setHealthRecords] = useState([]);
    const [vaccinationRecords, setVaccinationRecords] = useState([]);
    const [sessions, setSessions] = useState([]);

    const fetchDetails = async () => {
        if (!horse?.id) return;
        setLoading(true);
        try {
            // Fetch Health Records
            const hrRes = await apiFunction(getHealthRecordsApi + `?horseId=${horse.id}`, [], {}, "GET", true);
            if (hrRes && hrRes.success) setHealthRecords(hrRes.records || []);

            // Fetch Vaccination Records
            const vrRes = await apiFunction(getVaccinationRecordsApi + `?horseId=${horse.id}`, [], {}, "GET", true);
            if (vrRes && vrRes.success) setVaccinationRecords(vrRes.records || []);

            // Fetch Today's Sessions
            const today = new Date().toISOString().split('T')[0];
            const sessionRes = await apiFunction(getSessionsApi + `?horseId=${horse.id}`, [], {}, "GET", true);
            if (sessionRes && sessionRes.success) {
               // Filter for today's sessions if needed, or show all for that horse
               setSessions(sessionRes.sessions || []);
            }
        } catch (error) {
            console.error("Fetch horse details error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [horse?.id]);

    const lastVisit = healthRecords.length > 0 ? new Date(healthRecords[0].date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '4-digit' }) : "No records";
    const nextVaccination = vaccinationRecords.length > 0 ? new Date(vaccinationRecords[0].nextDueDate || vaccinationRecords[0].date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '4-digit' }) : "Schedule Pending";

    if (!horse) {
        return (
            <View className="flex-1 bg-[#F5EDDF] items-center justify-center">
                <Text className="text-[#8C4A28] font-bold">Horse data not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-[#8C4A28] px-6 py-2 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 mb-2 mt-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]"
                >
                    <ArrowLeft color="#1a202c" size={20} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#1a202c]">Horse Details</Text>
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <MoreVertical color="#1a202c" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {/* Profile Card */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
                    <Image
                        source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=400&auto=format&fit=crop' }}
                        className="w-full h-48 rounded-2xl mb-4"
                    />
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                            <Text className="text-2xl font-black text-[#1a202c] tracking-tight">{horse.name}</Text>
                            <Text className="text-[#64748b] text-sm font-bold uppercase tracking-wider">{horse.title || 'Genetic Breed'}</Text>
                        </View>
                        <View className="bg-[#FAF7F2] px-4 py-2 rounded-2xl border border-[#8C4A28]/10">
                            <Text className="text-[#8C4A28] text-[10px] font-black uppercase tracking-widest">{horse.status === 'Available' ? 'ACTIVE' : horse.status?.toUpperCase() || 'STABLE'}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center mt-2 bg-[#F8FAFC] self-start px-3 py-1.5 rounded-full">
                        <MapPin color="#64748b" size={14} className="mr-1" />
                        <Text className="text-[#64748b] text-[11px] font-bold">{horse.location}</Text>
                    </View>
                </View>

                {/* Health Status */}
                <View className="flex-row items-center mb-5 px-1">
                    <HeartPulse color="#8C4A28" size={24} className="mr-2" />
                    <Text className="text-xl font-black text-[#1a202c]">Health Status</Text>
                </View>

                <View className="flex-row justify-between mb-8 gap-3">
                    <View className="flex-1 bg-white rounded-[2rem] p-5 shadow-lg shadow-gray-200 border border-white">
                        <ShieldCheck color="#10b981" size={24} className="mb-3" />
                        <Text className="text-[#94a3b8] text-[9px] font-black tracking-widest mb-1 uppercase">SHOE STATUS</Text>
                        <Text className="text-[#1a202c] font-black text-lg">{horse.shoeStatus || 'Standard'}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-[2rem] p-5 shadow-lg shadow-gray-200 border border-white">
                        <Zap color="#f59e0b" size={24} className="mb-3" />
                        <Text className="text-[#94a3b8] text-[9px] font-black tracking-widest mb-1 uppercase">SPEED</Text>
                        <Text className="text-[#1a202c] font-black text-lg">{horse.speed || '--'} <Text className="text-[10px] font-bold text-[#94a3b8]">KM/H</Text></Text>
                    </View>
                    <View className="flex-1 bg-white rounded-[2rem] p-5 shadow-lg shadow-gray-200 border border-white">
                        <Activity color="#3b82f6" size={24} className="mb-3" />
                        <Text className="text-[#94a3b8] text-[9px] font-black tracking-widest mb-1 uppercase">WEIGHT</Text>
                        <Text className="text-[#1a202c] font-black text-lg">{horse.weight || '--'} <Text className="text-[10px] font-bold text-[#94a3b8]">LBS</Text></Text>
                    </View>
                </View>

                <View className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200 border border-white mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[#64748b] font-bold text-xs uppercase tracking-wider">Last Vet Visit</Text>
                        <Text className="text-[#1a202c] font-black text-sm">{lastVisit}</Text>
                    </View>
                    <View className="w-full h-[1px] bg-gray-50 mb-4" />
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-[#64748b] font-bold text-xs uppercase tracking-wider">Next Vaccination</Text>
                        <Text className="text-[#8C4A28] font-black text-sm">{nextVaccination}</Text>
                    </View>
                    <View className="w-full h-[1px] bg-gray-50 mb-4" />
                    <View className="flex-row justify-between items-center">
                        <Text className="text-[#64748b] font-bold text-xs uppercase tracking-wider">Diet Plan</Text>
                        <Text className="text-[#1a202c] font-black text-sm truncate flex-1 text-right ml-4">{horse.diet || 'Standard Nutrition'}</Text>
                    </View>
                </View>

                {/* Availability */}
                <View className="flex-row items-center justify-between mb-5 px-1">
                    <View className="flex-row items-center">
                        <CalendarCheck color="#8C4A28" size={24} className="mr-2" />
                        <Text className="text-xl font-black text-[#1a202c]">Availability</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-[#8C4A28] font-black text-[10px] uppercase tracking-wider">View Calendar</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200 border border-white mb-4">
                    <Text className="text-[#1a202c] font-black text-base mb-6">Today's Schedule</Text>

                    {sessions.length === 0 ? (
                        <View className="py-8 items-center border border-dashed border-gray-100 rounded-3xl">
                             <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">No activities scheduled for today</Text>
                        </View>
                    ) : (
                        sessions.map((session, index) => (
                            <View key={session.id} className={`flex-row items-center ${index !== 0 ? 'mt-6 pt-6 border-t border-gray-50' : ''}`}>
                                <View className="w-14 items-center mr-3">
                                    <Text className="text-[#1a202c] font-black">{session.timing?.split(' ')[0]}</Text>
                                    <Text className="text-[#94a3b8] text-[9px] font-black uppercase tracking-tighter">{session.timing?.split(' ')[1] || 'AM'}</Text>
                                </View>
                                <View className={`w-1 h-10 ${index % 2 === 0 ? 'bg-[#8C4A28]' : 'bg-gray-200'} rounded-full mr-4`} />
                                <View className="flex-1">
                                    <Text className="text-[#1a202c] font-black text-sm leading-tight">{session.title}</Text>
                                    <Text className="text-[#94a3b8] text-[9px] font-bold uppercase tracking-wider mt-0.5">{session.location}</Text>
                                </View>
                                <View className={`${index % 2 === 0 ? 'bg-[#FAF7F2]' : 'bg-[#F0FDF4]'} px-3 py-1.5 rounded-2xl`}>
                                    <Text className={`text-[9px] font-black ${index % 2 === 0 ? 'text-[#8C4A28]' : 'text-emerald-700'} uppercase tracking-wider`}>{index % 2 === 0 ? 'UPCOMING' : 'DONE'}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {loading && (
                    <View className="mt-4 flex-row justify-center items-center">
                        <ActivityIndicator color="#8C4A28" size="small" />
                        <Text className="ml-2 text-[#8C4A28] font-bold text-[10px] uppercase tracking-[1px]">Syncing details...</Text>
                    </View>
                )}

            </ScrollView>
        </View>
    );
};

export default HorseDetail;
