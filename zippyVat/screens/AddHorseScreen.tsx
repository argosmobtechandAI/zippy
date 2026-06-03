import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { ArrowLeft, User, Tag, Hash, Activity, Shield, Info, MapPin, ChevronDown, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, getAllStablesApi, getCategoriesApi } from '../api/api';

// Simple custom dropdown component
const Dropdown = ({ label, icon: IconComp, value, options, onChange, placeholder }: any) => {
    const [open, setOpen] = useState(false);
    const selected = options.find((o: any) => o.value === value);
    return (
        <View className="mb-6">
            <Text className="text-[#64748b] text-[10px] font-black tracking-[2px] uppercase mb-2 ml-1">{label}</Text>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-[#e2e8f0] shadow-sm"
            >
                <IconComp color="#8C4A28" size={18} opacity={0.6} />
                <Text className={`flex-1 text-sm font-bold ml-3 ${value ? 'text-[#1a202c]' : 'text-[#cbd5e1]'}`}>
                    {selected?.label || placeholder}
                </Text>
                <ChevronDown color="#94a3b8" size={16} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                    className="flex-1 bg-black/40 justify-end"
                >
                    <View className="bg-white rounded-t-[2rem] max-h-[70%]">
                        <View className="px-6 pt-5 pb-3 border-b border-[#f1f5f9]">
                            <Text className="text-[#1a202c] font-black text-base">{label}</Text>
                        </View>
                        <ScrollView>
                            {options.map((opt: any) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => { onChange(opt.value); setOpen(false); }}
                                    className={`flex-row items-center px-6 py-4 border-b border-[#f8fafc] ${value === opt.value ? 'bg-[#FDF7F2]' : ''}`}
                                >
                                    <Text className={`flex-1 text-sm font-bold ${value === opt.value ? 'text-[#8C4A28]' : 'text-[#1a202c]'}`}>
                                        {opt.label}
                                    </Text>
                                    {value === opt.value && <Check color="#8C4A28" size={16} />}
                                </TouchableOpacity>
                            ))}
                            {options.length === 0 && (
                                <View className="py-10 items-center">
                                    <Text className="text-[#94a3b8] text-sm">No options available</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default function AddHorseScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [stables, setStables] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [allHorses, setAllHorses] = useState<any[]>([]);

    const [form, setForm] = useState({
        name: '',
        location: '',
        stableId: '',
        title: '',
        weight: '500',
        speed: '40',
        shoeStatus: 'Standard',
        diet: 'Balanced Mix',
        age: '',
        status: 'Available'
    });

    useEffect(() => {
        loadDropdownData();
    }, []);

    const loadDropdownData = async () => {
        try {
            const [stableRes, catRes, horseRes] = await Promise.all([
                apiFunction(getAllStablesApi, [], {}, 'GET', true),
                apiFunction(getCategoriesApi, [], {}, 'GET', false),
                apiFunction(getAllHorsesApi, [], {}, 'GET', true),
            ]);
            if (stableRes?.success) setStables(stableRes.stables || []);
            if (catRes?.success) setCategories(catRes.categories || []);
            if (horseRes?.success) setAllHorses(horseRes.horses || []);
        } catch (e) {
            console.error('Failed to load dropdown data', e);
        } finally {
            setDataLoading(false);
        }
    };

    const updateForm = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleAddHorse = async () => {
        if (!form.name || !form.age) {
            Alert.alert("Error", "Please fill in Name and Age.");
            return;
        }
        if (!form.title) {
            Alert.alert("Error", "Please select a Category.");
            return;
        }
        if (!form.location && !form.stableId) {
            Alert.alert("Error", "Please select a Stable/Location.");
            return;
        }

        setLoading(true);
        try {
            const selectedStable = stables.find(s => s.id === form.stableId);
            const res = await apiFunction(getAllHorsesApi, [], {
                ...form,
                location: selectedStable ? selectedStable.name : form.location,
                stableId: form.stableId || undefined,
                age: parseInt(form.age),
                weight: parseInt(form.weight),
                speed: parseInt(form.speed),
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

    const stableOptions = stables.map(s => ({ value: s.id, label: `${s.name} — ${s.location}` }));
    const categoryOptions = categories.length > 0
        ? categories.map(c => ({ value: c.name, label: c.name }))
        : [
            { value: 'Show Jumping', label: 'Show Jumping' },
            { value: 'Beginner Friendly', label: 'Beginner Friendly' },
            { value: 'Dressage', label: 'Dressage' },
            { value: 'Eventing', label: 'Eventing' },
            { value: 'Training Only', label: 'Training Only' },
            { value: 'Elite Stallion', label: 'Elite Stallion' },
        ];

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

                {dataLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator color="#8C4A28" />
                        <Text className="mt-3 text-[#94a3b8] text-[10px] font-black uppercase tracking-widest">Loading options...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                        <View className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200 border border-white mb-8">
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-[#f1f5f9] mr-4">
                                    <Activity color="#8C4A28" size={24} />
                                </View>
                                <View>
                                    <Text className="text-[#1a202c] font-black text-lg">Basic Profile</Text>
                                    <Text className="text-[#94a3b8] text-[10px] font-bold tracking-widest uppercase">Patient Information</Text>
                                </View>
                            </View>

                            <Dropdown
                                label="Horse Name"
                                icon={User}
                                value={form.name}
                                options={allHorses.map(h => ({ label: h.name, value: h.name }))}
                                onChange={(val: string) => updateForm('name', val)}
                                placeholder="Select a horse..."
                            />
                            {renderInput(Hash, 'Age', form.age, 'age', 'numeric', 'Enter age in years')}

                            {/* Stable Dropdown */}
                            <Dropdown
                                label="Stable / Location"
                                icon={MapPin}
                                value={form.stableId}
                                options={stableOptions}
                                onChange={(val: string) => updateForm('stableId', val)}
                                placeholder={stableOptions.length > 0 ? "Select a stable..." : "No stables registered yet"}
                            />

                            {/* Category Dropdown */}
                            <Dropdown
                                label="Category / Title"
                                icon={Tag}
                                value={form.title}
                                options={categoryOptions}
                                onChange={(val: string) => updateForm('title', val)}
                                placeholder="Select a category..."
                            />
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
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
