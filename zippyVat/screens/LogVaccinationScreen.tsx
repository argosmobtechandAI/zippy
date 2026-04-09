import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { ArrowLeft, Syringe, Calendar, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function LogVaccinationScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 mb-2 mt-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <ArrowLeft color="#8C4A28" size={20} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[#1a202c]">Log Vaccination</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                
                {/* Horse Info */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6 flex-row items-center">
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=200&auto=format&fit=crop' }} 
                        className="w-16 h-16 rounded-xl mr-4"
                    />
                    <View className="flex-1">
                        <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-1 uppercase">Selected Patient</Text>
                        <Text className="text-[#1a202c] font-bold text-lg leading-tight">Thunder Dash</Text>
                        <Text className="text-[#64748b] text-xs font-semibold">ID: #ZE-2299</Text>
                    </View>
                </View>

                {/* Form Fields */}
                <Text className="text-[#1a202c] font-bold text-base mb-3">Vaccine Details</Text>

                <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Vaccine Name</Text>
                <View className="bg-white rounded-xl px-4 py-1 mb-4 border border-[#e2e8f0] shadow-sm flex-row items-center">
                    <Syringe color="#8C4A28" size={18} className="mr-2" />
                    <TextInput 
                        placeholder="e.g. Influenza + Tetanus"
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-[#1a202c] h-10 py-0"
                        defaultValue="Influenza + Tetanus Booster"
                    />
                </View>

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Date Administered</Text>
                        <View className="bg-white rounded-xl px-4 py-1 border border-[#e2e8f0] shadow-sm flex-row items-center">
                            <Calendar color="#8C4A28" size={18} className="mr-2" />
                            <TextInput 
                                placeholder="DD / MM / YYYY"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 text-[#1a202c] h-10 py-0"
                                defaultValue="02 / 10 / 2023"
                            />
                        </View>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Next Due Date</Text>
                        <View className="bg-white rounded-xl px-4 py-1 border border-[#e2e8f0] shadow-sm flex-row items-center">
                            <Calendar color="#94a3b8" size={18} className="mr-2" />
                            <TextInput 
                                placeholder="DD / MM / YYYY"
                                placeholderTextColor="#94a3b8"
                                className="flex-1 text-[#1a202c] h-10 py-0"
                            />
                        </View>
                    </View>
                </View>

                <Text className="text-[#1a202c] font-bold text-base mb-3 mt-2">Additional Information</Text>

                <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Manufacturer / Batch No.</Text>
                <View className="bg-white rounded-xl px-4 py-2 mb-4 border border-[#e2e8f0] shadow-sm">
                    <TextInput 
                        placeholder="Enter batch number"
                        placeholderTextColor="#94a3b8"
                        className="text-[#1a202c] h-10 py-0"
                    />
                </View>

                <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Clinical Notes</Text>
                <View className="bg-white rounded-xl px-4 py-3 mb-8 border border-[#e2e8f0] shadow-sm">
                    <TextInput 
                        placeholder="Add any observations, adverse reactions..."
                        placeholderTextColor="#94a3b8"
                        className="text-[#1a202c] h-24 py-0"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center shadow-lg border border-[#6b381e]"
                    onPress={() => navigation.goBack()}
                >
                    <CheckCircle2 color="white" size={20} className="mr-2" />
                    <Text className="text-white font-bold text-lg">Save Record</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
