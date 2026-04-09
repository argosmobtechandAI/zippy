import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, HeartPulse, CalendarCheck, Activity, Zap, ShieldCheck, MapPin, MoreVertical } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const HorseDetail = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 mb-2">
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
                        source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=400&auto=format&fit=crop' }}
                        className="w-full h-48 rounded-2xl mb-4"
                    />
                    <View className="flex-row justify-between items-start mb-2">
                        <View>
                            <Text className="text-2xl font-bold text-[#1a202c]">Thunder</Text>
                            <Text className="text-[#64748b] text-sm font-semibold">Thoroughbred Cross</Text>
                        </View>
                        <View className="bg-[#e6d0b3] px-3 py-1.5 rounded-lg">
                            <Text className="text-[#8C4A28] text-[12px] font-bold">GELDING</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center mt-2">
                        <MapPin color="#94a3b8" size={16} className="mr-1" />
                        <Text className="text-[#94a3b8] text-sm font-semibold">Stall A12 • Main Barn</Text>
                    </View>
                </View>

                {/* Health Status */}
                <View className="flex-row items-center mb-4">
                    <HeartPulse color="#8C4A28" size={24} className="mr-2" />
                    <Text className="text-xl font-bold text-[#1a202c]">Health Status</Text>
                </View>

                <View className="flex-row justify-between mb-6">
                    <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm border border-[#e2e8f0]">
                        <ShieldCheck color="#10b981" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1">SHOE STATUS</Text>
                        <Text className="text-[#1a202c] font-bold text-lg">Good</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm border border-[#e2e8f0]">
                        <Zap color="#f59e0b" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1">SPEED</Text>
                        <Text className="text-[#1a202c] font-bold text-lg">42 <Text className="text-sm font-normal text-[#94a3b8]">km/h</Text></Text>
                    </View>
                    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
                        <Activity color="#3b82f6" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1">WEIGHT</Text>
                        <Text className="text-[#1a202c] font-bold text-lg">1100 <Text className="text-sm font-normal text-[#94a3b8]">lbs</Text></Text>
                    </View>
                </View>

                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-[#64748b] font-semibold text-sm">Last Vet Visit</Text>
                        <Text className="text-[#1a202c] font-bold">Oct 02, 2026</Text>
                    </View>
                    <View className="w-full h-[1px] bg-[#f1f5f9] mb-3"></View>
                    <View className="flex-row justify-between items-center border-b border-[#f1f5f9] pb-3 mb-3">
                        <Text className="text-[#64748b] font-semibold text-sm">Next Vaccination</Text>
                        <Text className="text-[#8C4A28] font-bold">Nov 15, 2026</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-[#64748b] font-semibold text-sm">Diet</Text>
                        <Text className="text-[#1a202c] font-bold">Standard + Joint Suppl.</Text>
                    </View>
                </View>

                {/* Availability */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <CalendarCheck color="#8C4A28" size={24} className="mr-2" />
                        <Text className="text-xl font-bold text-[#1a202c]">Availability</Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-[#8C4A28] font-bold text-sm">View Calendar</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
                    <Text className="text-[#1a202c] font-bold text-base mb-3">Today's Schedule</Text>
                    
                    <View className="flex-row items-center mb-4">
                        <View className="w-14 items-center mr-3">
                            <Text className="text-[#1a202c] font-bold">08:00</Text>
                            <Text className="text-[#94a3b8] text-[10px] font-semibold">AM</Text>
                        </View>
                        <View className="w-[2px] h-8 bg-[#e2e8f0] mr-4"></View>
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold">Show Jumping</Text>
                            <Text className="text-[#64748b] text-xs">Rider: Sarah J. • Arena A</Text>
                        </View>
                        <View className="bg-[#f0fff4] px-2 py-1 rounded">
                            <Text className="text-[#2f855a] text-[10px] font-bold">DONE</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center border-t border-[#f1f5f9] pt-4">
                        <View className="w-14 items-center mr-3">
                            <Text className="text-[#1a202c] font-bold">02:30</Text>
                            <Text className="text-[#94a3b8] text-[10px] font-semibold">PM</Text>
                        </View>
                        <View className="w-[2px] h-8 bg-[#8C4A28] mr-4"></View>
                        <View className="flex-1">
                            <Text className="text-[#1a202c] font-bold">Dressage Practice</Text>
                            <Text className="text-[#64748b] text-xs">Rider: Emma W. • Arena B</Text>
                        </View>
                        <View className="bg-[#e6d0b3] px-2 py-1 rounded">
                            <Text className="text-[#8C4A28] text-[10px] font-bold">UPCOMING</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

export default HorseDetail;
