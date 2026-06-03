import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function PrivacySecurityScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-[#e2d5c3]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-[#fceddf] rounded-full">
          <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-[#8C4A28] font-bold text-xl">Privacy & Security</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="mb-8 items-center">
          <View className="w-20 h-20 bg-[#fceddf] rounded-full items-center justify-center mb-4">
            <Shield color="#8C4A28" size={40} />
          </View>
          <Text className="text-xl font-bold text-[#1a202c]">Your Data is Secure</Text>
          <Text className="text-[#64748b] text-center mt-2">
            We prioritize the security and privacy of your personal information.
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Lock color="#8C4A28" size={20} className="mr-2" />
            <Text className="text-[#1a202c] font-bold text-lg">Privacy Policy</Text>
          </View>
          <Text className="text-[#64748b] leading-6">
            Our privacy policy outlines how we collect, use, and protect your data. We do not sell your personal information to third parties. Your data is used exclusively to improve your experience within the zippy Equestrian platform and to communicate with you about your sessions and updates.
          </Text>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Shield color="#8C4A28" size={20} className="mr-2" />
            <Text className="text-[#1a202c] font-bold text-lg">Security Measures</Text>
          </View>
          <Text className="text-[#64748b] leading-6">
            We employ industry-standard encryption and security practices to ensure your account details and riding records are protected against unauthorized access.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
