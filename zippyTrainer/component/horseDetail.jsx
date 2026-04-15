import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, HeartPulse, CalendarCheck, Activity, Zap, ShieldCheck, MapPin, MoreVertical } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const HorseDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { horse } = route.params || {};

    if (!horse) {
        return (
            <View className="flex-1 bg-[#F5EDDF] items-center justify-center">
                <Text className="text-lg font-bold">Horse data not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-[#8C4A28] px-6 py-2 rounded-xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                        source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=400&auto=format&fit=crop' }}
                        className="w-full h-48 rounded-2xl mb-4"
                    />
                    <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-2">
                            <Text className="text-2xl font-bold text-[#1a202c]">{horse.name}</Text>
                            <Text className="text-[#64748b] text-sm font-semibold uppercase">{horse.title || 'Standard Breed'}</Text>
                        </View>
                        <View className="bg-[#e6d0b3] px-3 py-1.5 rounded-lg">
                            <Text className="text-[#8C4A28] text-[12px] font-bold">AGE: {horse.age || '?'}</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center mt-2">
                        <MapPin color="#94a3b8" size={16} className="mr-1" />
                        <Text className="text-[#94a3b8] text-sm font-semibold">{horse.location || 'Stable Facility'}</Text>
                    </View>
                </View>

                {/* Health Status */}
                <View className="flex-row items-center mb-4">
                    <HeartPulse color="#8C4A28" size={24} className="mr-2" />
                    <Text className="text-xl font-bold text-[#1a202c]">Technical Stats</Text>
                </View>

                <View className="flex-row justify-between mb-6">
                    <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm border border-[#e2e8f0]">
                        <ShieldCheck color="#10b981" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1 uppercase">Shoe Status</Text>
                        <Text className="text-[#1a202c] font-bold text-lg">{horse.shoeStatus || 'Good'}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm border border-[#e2e8f0]">
                        <Zap color="#f59e0b" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1">SPEED</Text>
                        <Text className="text-[#1a202c] font-bold text-lg">{horse.speed || 40} <Text className="text-sm font-normal text-[#94a3b8]">km/h</Text></Text>
                    </View>
                    <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]">
                        <Activity color="#3b82f6" size={24} className="mb-2" />
                        <Text className="text-[#64748b] text-[10px] font-bold tracking-wider mb-1">WEIGHT</Text>
                        <Text className="text-[#1a202c] font-bold text-base">{horse.weight || 500} <Text className="text-sm font-normal text-[#94a3b8]">kg</Text></Text>
                    </View>
                </View>

                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-[#64748b] font-semibold text-sm">Last Registry Update</Text>
                        <Text className="text-[#1a202c] font-bold">{horse.lastVisit || "Recent"}</Text>
                    </View>
                    <View className="w-full h-[1px] bg-[#f1f5f9] mb-3"></View>
                    <View className="flex-row justify-between items-center border-b border-[#f1f5f9] pb-3 mb-3">
                        <Text className="text-[#64748b] font-semibold text-sm">Dietary Plan</Text>
                        <Text className="text-[#8C4A28] font-bold">{horse.diet || "Standard"}</Text>
                    </View>
                </View>

                {/* Availability */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <CalendarCheck color="#8C4A28" size={24} className="mr-2" />
                        <Text className="text-xl font-bold text-[#1a202c]">Registry Notes</Text>
                    </View>
                </View>

                <View className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] mb-4">
                    <Text className="text-[#64748b] text-sm">
                        This horse is registered at {horse.location}. All biological metrics are updated via the Admin panel. Use the Admin dashboard for medical logs or vaccination updates.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
};

export default HorseDetail;
