import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { ArrowLeft, Search, Filter, Stethoscope, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getHorsesByVat } from '../api/api';
import { Config } from '../api/config';

const getImageUrl = (url: string) => url?.startsWith('/') ? `${Config.BASE_URL}${url}` : url;

export default function PatientListScreen({ navigation }: any) {
    const [horses, setHorses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchHorses();
    }, [refreshing]);

    const onRefresh = () => {
        setRefreshing(true);
    };

    const fetchHorses = async () => {
        setLoading(true);
        try {
            const res = await apiFunction(getHorsesByVat, [], {}, "GET", true);

            console.log("Fetch horses res:", res);
            if (res && res.success) {
                setHorses(res.horses || []);
            }
        } catch (error) {
            console.error("Fetch horses error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };


    const filteredPatients = useMemo(() => {
        if (horses) {
            return horses.filter(h => {
                return h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.location.toLowerCase().includes(searchQuery.toLowerCase());
            });
        }
        return [];
    }, [horses, searchQuery])

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            <ScrollView
                
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#85431E"
                        colors={["#85431E"]}
                    />
                }
            >


                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-4 mb-2 mt-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                        <ArrowLeft color="#8C4A28" size={20} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#8C4A28]">Patient Directory</Text>
                    <View className="w-10 h-10" />
                </View>

                {/* Search Bar */}
                <View className="px-4 mb-4">
                    <View className="bg-white rounded-xl flex-row items-center px-4 py-2 border border-[#e2e8f0] shadow-sm">
                        <Search color="#64748b" size={20} className="mr-2" />
                        <TextInput
                            placeholder="Search patient, owner, or ID..."
                            placeholderTextColor="#64748b"
                            className="flex-1 text-[#1a202c] h-11 text-sm pt-0 pb-0"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#8C4A28" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                        {filteredPatients.map((patient, index) => (
                            <TouchableOpacity
                                key={patient.id}
                                onPress={() => navigation.navigate("PatientDetail", { horse: patient })}
                                className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4 flex-row items-center"
                            >
                                <View className="w-[70px] h-[70px] rounded-xl mr-4 overflow-hidden bg-[#FAF7F2] items-center justify-center border border-[#8C4A28]/10">
                                    {patient.image || patient.imageUrl ? (
                                        <Image
                                            source={{ uri: getImageUrl(patient.image || patient.imageUrl) }}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <View className="items-center justify-center">
                                            <Stethoscope color="#8C4A28" size={24} opacity={0.6} />
                                            <Text className="text-[8px] font-bold text-[#8C4A28]/40 uppercase mt-1">Zippy</Text>
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-[#1a202c] font-bold text-base">{patient.name}</Text>
                                    </View>

                                    <Text className="text-[#64748b] text-[10px] font-semibold mb-2">ID: #{patient.id.slice(0, 8)} • {patient.location}</Text>

                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-[#8C4A28] text-xs font-bold w-[65%]">{patient.title}</Text>
                                        <View>
                                            {patient.shoeStatus === 'Critical' && (
                                                <View className="bg-red-100 flex-row items-center px-2 py-1 rounded">
                                                    <AlertTriangle color="#ef4444" size={10} className="mr-1" />
                                                    <Text className="text-[#ef4444] text-[9px] font-bold uppercase">{patient.shoeStatus}</Text>
                                                </View>
                                            )}
                                            {(patient.shoeStatus === 'Monitoring' || !patient.shoeStatus) && (
                                                <View className="bg-orange-100 flex-row items-center px-2 py-1 rounded">
                                                    <Stethoscope color="#f97316" size={10} className="mr-1" />
                                                    <Text className="text-[#f97316] text-[9px] font-bold uppercase">{patient.shoeStatus || 'Monitoring'}</Text>
                                                </View>
                                            )}
                                            {patient.shoeStatus === 'Stable' && (
                                                <View className="bg-green-100 flex-row items-center px-2 py-1 rounded">
                                                    <CheckCircle2 color="#10b981" size={10} className="mr-1" />
                                                    <Text className="text-[#10b981] text-[9px] font-bold uppercase">{patient.shoeStatus}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <ChevronRight color="#94a3b8" size={20} className="ml-2" />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

            </ScrollView>
        </View>
    );
}
