import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator, Modal, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ArrowLeft, Calendar, Syringe, X, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { logVaccinationApi, getAllHorsesApi } from '../api/api';

// Custom Simple JS Date Picker Component
const CustomDatePicker = ({ visible, onClose, onSelect, initialDate }: any) => {
    const [viewDate, setViewDate] = useState(initialDate || new Date());
    
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const days = [];
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white w-full rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <View className="bg-[#8C4A28] p-6 flex-row justify-between items-center">
                        <View>
                            <Text className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Select Date</Text>
                            <Text className="text-white text-xl font-bold">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="p-6">
                        <View className="flex-row mb-4">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                                <Text key={idx} className="flex-1 text-center text-[#94a3b8] text-[10px] font-bold">{d}</Text>
                            ))}
                        </View>
                        
                        <View className="flex-row flex-wrap">
                            {days.map((day, idx) => (
                                <TouchableOpacity 
                                    key={idx}
                                    disabled={!day}
                                    onPress={() => {
                                        if (day) {
                                            const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                            onSelect(selected);
                                        }
                                    }}
                                    className={`w-[14.28%] h-10 items-center justify-center rounded-xl ${day && day === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() ? 'bg-[#8C4A28]/10' : ''}`}
                                >
                                    <Text className={`font-bold text-xs ${day ? 'text-[#1a202c]' : 'text-transparent'}`}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity 
                                onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
                                className="px-4 py-2 bg-[#f8fafc] rounded-xl"
                            >
                                <Text className="text-[#8C4A28] font-bold text-xs">Previous</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
                                className="px-4 py-2 bg-[#f8fafc] rounded-xl"
                            >
                                <Text className="text-[#8C4A28] font-bold text-xs">Next Month</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function LogVaccinationScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { horse, horseId } = (route.params as any) || {};
    
    // Safely extract the ID whether we got a full object or just a string ID
    const targetHorseId = horse?.id || horseId || (typeof horse === 'string' ? horse : null);

    const [vaccineName, setVaccineName] = useState("");
    const [dateAdministered, setDateAdministered] = useState(new Date());
    const [nextDueDate, setNextDueDate] = useState(new Date());
    const [showAdminPicker, setShowAdminPicker] = useState(false);
    const [showNextPicker, setShowNextPicker] = useState(false);
    const [batchNo, setBatchNo] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    const [horses, setHorses] = useState<any[]>([]);
    const [selectedHorseId, setSelectedHorseId] = useState(targetHorseId);
    const [showHorsePicker, setShowHorsePicker] = useState(false);

    useEffect(() => {
        if (!targetHorseId) {
            fetchHorses();
        }
    }, [targetHorseId]);

    const fetchHorses = async () => {
        try {
            const res = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
            if (res && res.success) {
                setHorses(res.horses || []);
            }
        } catch (e) {
            console.error("Failed to fetch horses for dropdown", e);
        }
    };

    const handleSave = async () => {
        if (!selectedHorseId) {
            Alert.alert("Error", "No horse selected.");
            return;
        }

        if (!vaccineName || !dateAdministered) {
            Alert.alert("Error", "Please enter vaccine name and date.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                horseId: selectedHorseId,
                name: vaccineName,
                date: dateAdministered.toISOString().split('T')[0],
                nextDate: nextDueDate.toISOString().split('T')[0],
                batchNumber: batchNo || `B${Date.now().toString().slice(-6)}`,
                notes: notes
            };
            console.log('Vaccination payload:', JSON.stringify(payload));

            const res = await apiFunction(logVaccinationApi, [], payload, "POST", true);
            console.log('Vaccination response:', JSON.stringify(res));

            if (res && res.success) {
                Alert.alert("Success", "Vaccination record saved successfully.");
                navigation.goBack();
            } else {
                Alert.alert("Error", res?.message || "Server rejected the request. Please try again.");
            }
        } catch (error: any) {
            console.error('Vaccination save error:', error?.response?.data || error?.message || error);
            const serverMsg = error?.response?.data?.message;
            Alert.alert("Error", serverMsg || "Network error. Please check your connection.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="flex-row items-center px-4 py-4 mb-2 mt-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-[#e2e8f0]">
                    <ArrowLeft color="#8C4A28" size={20} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[#8C4A28] ml-4">Log Vaccination</Text>
            </View>

            <CustomDatePicker 
                visible={showAdminPicker} 
                onClose={() => setShowAdminPicker(false)}
                initialDate={dateAdministered}
                onSelect={(date: Date) => {
                    setDateAdministered(date);
                    setShowAdminPicker(false);
                }}
            />
            <CustomDatePicker 
                visible={showNextPicker} 
                onClose={() => setShowNextPicker(false)}
                initialDate={nextDueDate}
                onSelect={(date: Date) => {
                    setNextDueDate(date);
                    setShowNextPicker(false);
                }}
            />

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                
                {/* Form Fields */}
                <Text className="text-[#1a202c] font-bold text-base mb-3">Vaccine Details</Text>

                {!targetHorseId && (
                    <>
                        <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Patient (Horse)</Text>
                        <TouchableOpacity 
                            onPress={() => setShowHorsePicker(true)}
                            className="bg-white rounded-xl px-4 py-1 mb-4 border border-[#e2e8f0] shadow-sm flex-row items-center h-11"
                        >
                            <Text className={`flex-1 ${selectedHorseId ? 'text-[#1a202c]' : 'text-[#94a3b8]'}`}>
                                {selectedHorseId ? horses.find((h: any) => h.id === selectedHorseId)?.name || 'Select Horse' : 'Select Horse'}
                            </Text>
                        </TouchableOpacity>

                        <Modal visible={showHorsePicker} transparent animationType="fade">
                            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                                <View className="bg-white w-full rounded-3xl max-h-[60%] overflow-hidden shadow-2xl">
                                    <View className="bg-[#8C4A28] p-4 flex-row justify-between items-center">
                                        <Text className="text-white font-bold text-lg">Select Patient</Text>
                                        <TouchableOpacity onPress={() => setShowHorsePicker(false)}>
                                            <X color="white" size={20} />
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView className="p-4 mb-2">
                                        {horses.map((h: any) => (
                                            <TouchableOpacity 
                                                key={h.id} 
                                                onPress={() => {
                                                    setSelectedHorseId(h.id);
                                                    setShowHorsePicker(false);
                                                }}
                                                className="py-4 border-b border-gray-100"
                                            >
                                                <Text className="text-[#1a202c] font-bold">{h.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </Modal>
                    </>
                )}

                <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Vaccine Name</Text>
                <View className="bg-white rounded-xl px-4 py-1 mb-4 border border-[#e2e8f0] shadow-sm flex-row items-center">
                    <Syringe color="#8C4A28" size={18} className="mr-2" />
                    <TextInput 
                        placeholder="e.g. Influenza + Tetanus"
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-[#1a202c] h-10 py-0"
                        value={vaccineName}
                        onChangeText={setVaccineName}
                    />
                </View>

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Date Administered</Text>
                        <TouchableOpacity 
                            onPress={() => setShowAdminPicker(true)}
                            className="bg-white h-11 rounded-xl px-4 border border-[#e2e8f0] shadow-sm flex-row items-center"
                        >
                            <Calendar color="#8C4A28" size={18} className="mr-2" />
                            <Text className="text-[#1a202c] flex-1">{dateAdministered.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showAdminPicker && (
                            <DateTimePicker
                                value={dateAdministered}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowAdminPicker(false);
                                    if (selectedDate) setDateAdministered(selectedDate);
                                }}
                            />
                        )}
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Next Due Date</Text>
                        <TouchableOpacity 
                            onPress={() => setShowNextPicker(true)}
                            className="bg-white h-11 rounded-xl px-4 border border-[#e2e8f0] shadow-sm flex-row items-center"
                        >
                            <Calendar color="#94a3b8" size={18} className="mr-2" />
                            <Text className="text-[#1a202c] flex-1">{nextDueDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showNextPicker && (
                            <DateTimePicker
                                value={nextDueDate}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowNextPicker(false);
                                    if (selectedDate) setNextDueDate(selectedDate);
                                }}
                            />
                        )}
                    </View>
                </View>

                <Text className="text-[#1a202c] font-bold text-base mb-3 mt-2">Additional Information</Text>

                <Text className="text-[#1a202c] font-semibold text-xs mb-1 ml-1">Manufacturer / Batch No.</Text>
                <View className="bg-white rounded-xl px-4 py-2 mb-4 border border-[#e2e8f0] shadow-sm">
                    <TextInput 
                        placeholder="Enter batch number"
                        placeholderTextColor="#94a3b8"
                        className="text-[#1a202c] h-10 py-0"
                        value={batchNo}
                        onChangeText={setBatchNo}
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
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    disabled={saving}
                    className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center shadow-lg border border-[#6b381e]"
                    onPress={handleSave}
                >
                    {saving ? <ActivityIndicator color="white" /> : (
                        <>
                            <CheckCircle2 color="white" size={20} className="mr-2" />
                            <Text className="text-white font-bold text-lg ml-2">Save Record</Text>
                        </>
                    )}
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}
