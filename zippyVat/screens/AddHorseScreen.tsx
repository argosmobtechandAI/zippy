import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, User, MapPin, Tag, Hash, Activity, Shield, Info } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi } from '../api/api';

export default function AddHorseScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        location: '',
        title: 'Elite Stallion',
        weight: '500',
        speed: '40',
        shoeStatus: 'Standard',
        diet: 'Balanced Mix',
        age: '',
        status: 'Available'
    });

    const updateForm = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleAddHorse = async () => {
        if (!form.name || !form.location || !form.age) {
            Alert.alert("Error", "Please fill in Name, Location, and Age.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiFunction(getAllHorsesApi, [], {
                ...form,
                age: parseInt(form.age),
                weight: parseInt(form.weight),
                speed: parseInt(form.speed),
                imageUrl: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a' // Default placeholder
            }, "POST", true);

            if (res && res.success) {
                Alert.alert("Success", "Horse added to registry successfully.");
                navigation.goBack();
            } else {
                Alert.alert("Error", res?.message || "Failed to add horse.");
            }
        } catch (error) {
            console.error("Add horse error:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (icon: any, label: string, value: string, key: string, keyboardType: any = 'default', placeholder: string = "") => {
        const IconComponent = icon;
        return (
            <View className="mb-6">
                <Text className="text-[#64748b] text-[10px] font-black tracking-[2px] uppercase mb-2 ml-1">{label}</Text>
                <View className="flex-row items-center bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] shadow-sm">
                    <IconComponent color="#8C4A28" size={18} className="mr-3" opacity={0.6} />
                    <TextInput
                        value={value}
                        onChangeText={(text) => updateForm(key, text)}
                        keyboardType={keyboardType}
                        className="flex-1 text-[#1a202c] font-bold py-3 text-sm"
                        placeholder={placeholder}
                        placeholderTextColor="#cbd5e1"
                    />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-4 mb-2 mt-2">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                        <ArrowLeft color="#8C4A28" size={20} />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#8C4A28] ml-4">Register New Patient</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <View className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200 border border-white mb-8">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-[#FAF7F2] rounded-2xl items-center justify-center mr-4 border border-[#8C4A28]/10">
                                <Activity color="#8C4A28" size={24} />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-[#1a202c]">Basic Profile</Text>
                                <Text className="text-[#94a3b8] text-[9px] font-black uppercase tracking-wider">Patient Information</Text>
                            </View>
                        </View>

                        {renderInput(User, 'Horse Name', form.name, 'name', 'default', 'Enter name (e.g. Midnight Star)')}
                        {renderInput(MapPin, 'Stable Location', form.location, 'location', 'default', 'Enter location')}
                        {renderInput(Hash, 'Age', form.age, 'age', 'numeric', 'Enter age in years')}
                        {renderInput(Tag, 'Category / Title', form.title, 'title', 'default', 'e.g. Show Jumping')}
                    </View>

                    <View className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200 border border-white mb-8">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-[#FAF7F2] rounded-2xl items-center justify-center mr-4 border border-[#8C4A28]/10">
                                <Info color="#8C4A28" size={24} />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-[#1a202c]">Vital Specs</Text>
                                <Text className="text-[#94a3b8] text-[9px] font-black uppercase tracking-wider">Technical Details</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">{renderInput(Activity, 'Weight (KG)', form.weight, 'weight', 'numeric')}</View>
                            <View className="flex-1">{renderInput(Activity, 'Speed (KM/H)', form.speed, 'speed', 'numeric')}</View>
                        </View>

                        {renderInput(Shield, 'Shoe Status', form.shoeStatus, 'shoeStatus', 'default')}
                        {renderInput(Info, 'Diet Plan', form.diet, 'diet', 'default')}
                    </View>

                    <TouchableOpacity 
                        disabled={loading}
                        onPress={handleAddHorse}
                        className="bg-[#8C4A28] py-4 rounded-2xl items-center shadow-lg shadow-[#8C4A28]/30 mb-8"
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black uppercase tracking-[2px] text-xs">Initialize Registry</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
