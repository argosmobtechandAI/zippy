import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, MapPin, Calendar, User, MoreVertical, FileText, CheckCircle2, XCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi } from '../api/api';

const SessionDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { session } = route.params || {};
    
    const [horse, setHorse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let hasHorse = false;
        let horseIdVal = session?.horseId;
        if (typeof horseIdVal === 'string' && horseIdVal.trim().startsWith('[')) {
            try {
                horseIdVal = JSON.parse(horseIdVal);
            } catch (e) {}
        }
        if (horseIdVal) {
            if (Array.isArray(horseIdVal)) {
                hasHorse = horseIdVal.some((id: any) => typeof id === 'string' && id.trim().length === 36);
            } else if (typeof horseIdVal === 'string' && horseIdVal.trim().length === 36) {
                hasHorse = true;
            }
        }
        if (!hasHorse && session?.horse) {
            hasHorse = true;
        }
        if (hasHorse) {
            fetchHorseDetails();
        } else {
            setLoading(false);
        }
    }, [session?.id]);

    const fetchHorseDetails = async () => {
        try {
            const res = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
            if (res && res.success) {
                let horseIdVal = null;
                let rawHorseId = session?.horseId;
                if (typeof rawHorseId === 'string' && rawHorseId.trim().startsWith('[')) {
                    try {
                        rawHorseId = JSON.parse(rawHorseId);
                    } catch (e) {}
                }
                if (rawHorseId) {
                    if (Array.isArray(rawHorseId)) {
                        horseIdVal = rawHorseId.find((id: any) => typeof id === 'string' && id.trim().length === 36);
                    } else if (typeof rawHorseId === 'string' && rawHorseId.trim().length === 36) {
                        horseIdVal = rawHorseId.trim();
                    }
                }
                if (!horseIdVal && session?.horse) {
                    if (typeof session.horse === 'object' && session.horse.id) {
                        horseIdVal = session.horse.id;
                    } else if (typeof session.horse === 'string' && session.horse.trim().length === 36) {
                        horseIdVal = session.horse.trim();
                    }
                }
                const found = (res.horses || []).find((h: any) => h.id === horseIdVal);
                setHorse(found);
            }
        } catch (e) {
            console.error("Error fetching horse for session:", e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#F5EDDF] justify-center items-center">
                <ActivityIndicator size="large" color="#8C4A28" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="flex-row justify-between items-center px-4 py-4 mb-2">
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]"
                >
                    <ArrowLeft color="#1a202c" size={20} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#1a202c]">Session Details</Text>
                <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <MoreVertical color="#1a202c" size={20} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Status & Type */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="bg-[#8C4A28] px-3 py-1.5 rounded-lg">
                        <Text className="text-white text-[12px] font-bold">{session?.title || 'Training'}</Text>
                    </View>
                    <View className="bg-[#e6d0b3] px-3 py-1.5 rounded-lg">
                        <Text className="text-[#8C4A28] text-[12px] font-bold">{session?.status || 'Upcoming'}</Text>
                    </View>
                </View>

                {/* Date & Time Info */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
                    <Text className="text-[#1a202c] text-xl font-bold mb-4">{session?.title || 'Session Details'}</Text>
                    
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <Calendar color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Date</Text>
                            <Text className="text-[#1a202c] font-bold">{session?.date || 'N/A'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <Clock color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Time</Text>
                            <Text className="text-[#1a202c] font-bold">{session?.timing || 'N/A'} ({session?.duration || '1 hr'})</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <MapPin color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Location</Text>
                            <Text className="text-[#1a202c] font-bold">{session?.location || 'Arena'}</Text>
                        </View>
                    </View>
                </View>

                {/* Horse Info */}
                <Text className="text-lg font-bold text-[#1a202c] mb-3">Assigned Horse</Text>
                {horse ? (
                    <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] flex-row items-center mb-6">
                        <Image 
                            source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                            className="w-16 h-16 rounded-2xl mr-4"
                        />
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold text-lg">{horse.name}</Text>
                            <Text className="text-[#64748b] text-sm font-semibold mb-1">{horse.title || 'Standard'}</Text>
                            <View className="bg-[#F5EDDF] self-start px-2 py-1 rounded-md">
                                <Text className="text-[#8C4A28] text-[10px] font-bold">{horse.age || '?'} Years Old</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] items-center justify-center mb-6">
                        <Text className="text-[#64748b]">No horse assigned to this session.</Text>
                    </View>
                )}

                {/* Notes */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
                    <View className="flex-row items-center mb-3">
                        <FileText color="#8C4A28" size={20} className="mr-2" />
                        <Text className="text-[#1a202c] font-bold text-lg">Training Notes</Text>
                    </View>
                    <Text className="text-[#64748b] leading-relaxed">
                        {session?.note || 'No specific notes recorded for this session yet.'}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SessionDetail;
