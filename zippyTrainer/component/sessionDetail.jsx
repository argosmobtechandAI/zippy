import React from 'react';
import { View, Text,  ScrollView, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Clock, MapPin, Calendar, User, MoreVertical, FileText, CheckCircle2, XCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const SessionDetail = () => {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#F5EDDF]">
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
                        <Text className="text-white text-[12px] font-bold">Dressage</Text>
                    </View>
                    <TouchableOpacity onPress={()=> navigation.navigate("Schedule")} className="bg-[#e6d0b3] px-3 py-1.5 rounded-lg">
                        <Text className="text-[#8C4A28] text-[12px] font-bold">Upcoming</Text>
                    </TouchableOpacity>
                </View>

                {/* Date & Time Info */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
                    <Text className="text-[#1a202c] text-xl font-bold mb-4">Dressage Training</Text>
                    
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <Calendar color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Date</Text>
                            <Text className="text-[#1a202c] font-bold">Wednesday, Oct 18, 2026</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <Clock color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Time</Text>
                            <Text className="text-[#1a202c] font-bold">08:00 AM - 09:30 AM (1.5 hrs)</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center mr-3">
                            <MapPin color="#8C4A28" size={20} />
                        </View>
                        <View>
                            <Text className="text-[#64748b] text-xs font-semibold">Location</Text>
                            <Text className="text-[#1a202c] font-bold">Arena B, Main Facility</Text>
                        </View>
                    </View>
                </View>

                {/* Rider Info */}
                <Text className="text-lg font-bold text-[#1a202c] mb-3">Rider Information</Text>
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] flex-row items-center mb-6">
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                        className="w-14 h-14 rounded-full mr-4"
                    />
                    <View className="flex-1">
                        <Text className="text-[#1a202c] font-bold text-lg">Emma Wilson</Text>
                        <Text className="text-[#64748b] text-sm font-semibold">Intermediate Level</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-[#F5EDDF] rounded-full items-center justify-center">
                        <User color="#8C4A28" size={20} />
                    </TouchableOpacity>
                </View>

                {/* Horse Info */}
                <Text className="text-lg font-bold text-[#1a202c] mb-3">Assigned Horse</Text>
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] flex-row items-center mb-6">
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                        className="w-16 h-16 rounded-2xl mr-4"
                    />
                    <View className="flex-1">
                        <Text className="text-[#1a202c] font-bold text-lg">Bella</Text>
                        <Text className="text-[#64748b] text-sm font-semibold mb-1">Mare • 8 Years</Text>
                        <View className="bg-[#F5EDDF] self-start px-2 py-1 rounded-md">
                            <Text className="text-[#8C4A28] text-[10px] font-bold">Stall B04</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
                    <View className="flex-row items-center mb-3">
                        <FileText color="#8C4A28" size={20} className="mr-2" />
                        <Text className="text-[#1a202c] font-bold text-lg">Training Notes</Text>
                    </View>
                    <Text className="text-[#64748b] leading-relaxed">
                        Focus on transition from trot to canter. Bella has been a bit stiff on the left rein, so start with loose bending exercises. Emma needs to work on her posture during downward transitions.
                    </Text>
                </View>

                {/* Actions */}
                <View className="flex-row justify-between mb-4">
                    <TouchableOpacity onPress={()=> navigation.goBack()} className="flex-1 bg-white border border-[#e2e8f0] py-4 rounded-2xl flex-row justify-center items-center mr-2 shadow-sm">
                        <XCircle color="#ef4444" size={20} className="mr-2" />
                        <Text className="text-[#ef4444] font-bold text-base">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-[#8C4A28] py-4 rounded-2xl flex-row justify-center items-center ml-2 shadow-sm">
                        <CheckCircle2 color="white" size={20} className="mr-2" />
                        <Text className="text-white font-bold text-base">Complete</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default SessionDetail;
