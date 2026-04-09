import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, User, Mail, Phone, ShieldAlert } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PersonalInformationScreen() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    fullName: 'Alex Sterling',
    email: 'alex.sterling@example.com',
    phone: '+1 (555) 123-4567',
    emergencyContact: 'Sarah Sterling (+1 555-012-3456)',
  });

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const renderInput = (icon: any, label: string, value: string, key: string, keyboardType: any = 'default') => {
    const IconComponent = icon;
    return (
      <View className="mb-6">
        <Text className="text-[#64748b] text-xs font-bold tracking-widest uppercase mb-2 ml-1">{label}</Text>
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-1 border border-[#e2e8f0] shadow-sm">
          <IconComponent color="#94a3b8" size={20} className="mr-3" />
          <TextInput
            value={value}
            onChangeText={(text) => updateForm(key, text)}
            keyboardType={keyboardType}
            className="flex-1 text-[#1a202c] font-medium py-3 text-base"
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
        <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
            <ArrowLeft color="#8C4A28" size={24} />
          </TouchableOpacity>
          <Text className="text-[#8C4A28] font-bold text-xl">Personal Information</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8 mt-2">
            <View className="w-24 h-24 bg-[#eabba4] rounded-full items-center justify-center mb-4">
              <User color="#8C4A28" size={40} />
            </View>
            <TouchableOpacity>
              <Text className="text-[#8C4A28] font-bold text-sm underline">Change Profile Picture</Text>
            </TouchableOpacity>
          </View>

          {renderInput(User, 'Full Name', form.fullName, 'fullName')}
          {renderInput(Mail, 'Email Address', form.email, 'email', 'email-address')}
          {renderInput(Phone, 'Phone Number', form.phone, 'phone', 'phone-pad')}
          {renderInput(ShieldAlert, 'Emergency Contact', form.emergencyContact, 'emergencyContact')}

        </ScrollView>

        {/* Footer Action */}
        <View className="p-4 bg-white border-t border-[#e2e8f0]">
          <TouchableOpacity 
            className="bg-[#8C4A28] py-4 rounded-xl items-center shadow-sm"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-white font-bold text-base">Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
