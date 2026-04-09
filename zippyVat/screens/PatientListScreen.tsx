import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { ArrowLeft, Search, Filter, Stethoscope, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PatientListScreen() {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('All');

    const patients = [
        {
            id: 'ZE-7782',
            name: 'Copper Blaze',
            owner: 'Zippy Equestrian',
            status: 'Critical',
            condition: 'Post-operative eval',
            lastVisit: 'Today',
            image: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 'ZE-2299',
            name: 'Thunder Dash',
            owner: 'Sarah Connor',
            status: 'Monitoring',
            condition: 'Vaccine Due',
            lastVisit: '3 Days Ago',
            image: 'https://images.unsplash.com/photo-1594911874499-28c0c4a4f896?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 'ZE-1104',
            name: 'Midnight Rose',
            owner: 'Zippy Equestrian',
            status: 'Stable',
            condition: 'Routine Checkup',
            lastVisit: '1 Week Ago',
            image: 'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?q=80&w=200&auto=format&fit=crop'
        },
        {
            id: 'ZE-2901',
            name: 'Thunder Strike',
            owner: 'Mike Johnson',
            status: 'Stable',
            condition: 'Recovery (Lameness)',
            lastVisit: '2 Weeks Ago',
            image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop'
        }
    ];

    const filterTabs = ['All', 'Critical', 'Monitoring', 'Stable'];

    return (
        <View className="flex-1 bg-[#F5EDDF]">
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
                <View className="bg-white rounded-xl flex-row items-center px-4 py-3 border border-[#e2e8f0] shadow-sm">
                    <Search color="#94a3b8" size={20} className="mr-2" />
                    <TextInput
                        placeholder="Search patient, owner, or ID..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 text-[#1a202c] h-8"
                    />
                    <TouchableOpacity>
                        <Filter color="#8C4A28" size={20} className="ml-2" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="px-4 mb-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {filterTabs.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full mr-2 ${activeTab === tab ? 'bg-[#8C4A28]' : 'bg-transparent border border-[#8C4A28]/30'
                                }`}
                        >
                            <Text className={`font-bold text-xs ${activeTab === tab ? 'text-white' : 'text-[#8C4A28]'
                                }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {patients.map((patient, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => navigation.navigate("PatientDetail")}
                        className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4 flex-row items-center"
                    >
                        <Image
                            source={{ uri: patient.image }}
                            className="w-[70px] h-[70px] rounded-xl mr-4"
                        />
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="text-[#1a202c] font-bold text-base">{patient.name}</Text>
                            </View>

                            <Text className="text-[#64748b] text-[10px] font-semibold mb-2">ID: #{patient.id} • {patient.owner}</Text>

                            <View className="flex-row justify-between items-center">
                                <Text className="text-[#8C4A28] text-xs font-bold w-[65%]">{patient.condition}</Text>
                                <View>
                                    {patient.status === 'Critical' && (
                                        <View className="bg-red-100 flex-row items-center px-2 py-1 rounded">
                                            <AlertTriangle color="#ef4444" size={10} className="mr-1" />
                                            <Text className="text-[#ef4444] text-[9px] font-bold uppercase">{patient.status}</Text>
                                        </View>
                                    )}
                                    {patient.status === 'Monitoring' && (
                                        <View className="bg-orange-100 flex-row items-center px-2 py-1 rounded">
                                            <Stethoscope color="#f97316" size={10} className="mr-1" />
                                            <Text className="text-[#f97316] text-[9px] font-bold uppercase">{patient.status}</Text>
                                        </View>
                                    )}
                                    {patient.status === 'Stable' && (
                                        <View className="bg-green-100 flex-row items-center px-2 py-1 rounded">
                                            <CheckCircle2 color="#10b981" size={10} className="mr-1" />
                                            <Text className="text-[#10b981] text-[9px] font-bold uppercase">{patient.status}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                        <ChevronRight color="#94a3b8" size={20} className="ml-2" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
