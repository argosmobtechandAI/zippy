import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { ArrowLeft, ArrowRight, Smartphone, Mail, ScanLine } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
          {/* Header section with Logo */}
          <View className="flex-row items-center mb-1 mt-2">
            <View className="w-8 h-8 bg-[#2C5F43] rounded border border-[#8C4A28] items-center justify-center mr-3">
              <ArrowRight color="white" size={16} />
            </View>
            <View>
              <Text className="text-lg font-bold text-[#1a202c]">
                zippy <Text className="text-[#8C4A28]">Equestrian</Text>
              </Text>
              <Text className="text-xs text-[#64748b]">Veterinary Portal</Text>
            </View>
          </View>

          <View className="mb-8" />

          {step === 1 ? (
            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Vet Login</Text>
              <Text className="text-[#64748b] mb-8 text-sm">
                Enter your registered mobile number to access your portal.
              </Text>

              <Text className="text-[#1a202c] font-semibold text-xs mb-2">Mobile Number</Text>
              <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                <View className="mr-2 opacity-50">
                  <Smartphone color="#94a3b8" size={20} />
                </View>
                <TextInput
                  className="flex-1 text-[#1e293b]"
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-8"
                onPress={() => setStep(2)}
              >
                <Text className="text-white font-bold text-lg mr-2">Get OTP</Text>
                <ArrowRight color="white" size={20} />
              </TouchableOpacity>

              <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-[#e2e8f0]" />
                <Text className="px-4 text-xs font-semibold text-[#94a3b8]">ALTERNATIVE LOGIN</Text>
                <View className="flex-1 h-[1px] bg-[#e2e8f0]" />
              </View>

              <View className="flex-row justify-between mb-8">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-[#e2e8f0] py-3 rounded-xl mr-2">
                  <View className="mr-2 opacity-60">
                    <Mail color="#64748b" size={18} />
                  </View>
                  <Text className="text-[#1a202c] font-semibold text-sm">Email</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 flex-row items-center justify-center border border-[#e2e8f0] py-3 rounded-xl ml-2">
                  <View className="mr-2 opacity-60">
                    <ScanLine color="#64748b" size={18} />
                  </View>
                  <Text className="text-[#1a202c] font-semibold text-sm">Scan ID</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <TouchableOpacity className="flex-row items-center mb-6" onPress={() => setStep(1)}>
                <View className="mr-2">
                  <ArrowLeft color="#8C4A28" size={16} />
                </View>
                <Text className="text-[#8C4A28] text-xs font-bold mt-0.5">BACK TO LOGIN</Text>
              </TouchableOpacity>

              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Verify Code</Text>
              <Text className="text-[#64748b] mb-6 text-sm">
                Sent a 6-digit code to <Text className="font-bold text-[#1a202c]">+1 (555) *** **89</Text>
              </Text>

              <View className="flex-row justify-between mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <View key={i} className="w-12 h-14 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] justify-center items-center" />
                ))}
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center justify-center mb-6"
                onPress={() => navigation.navigate('Tabs')}
              >
                <Text className="text-white font-bold text-lg">Verify and Access Portal</Text>
              </TouchableOpacity>

              <Text className="text-center text-[#64748b] text-sm mb-6">
                Didn't receive code? <Text className="text-[#8C4A28] font-bold">Resend in 0:45</Text>
              </Text>
            </View>
          )}

          <View className="mt-auto pt-4 border-t border-dotted border-[#cbd5e1]">
            <Text className="text-center text-[#94a3b8] text-[10px] mt-4">
              By continuing, you acknowledge that you are an authorized veterinary partner for zippy Equestrian.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
