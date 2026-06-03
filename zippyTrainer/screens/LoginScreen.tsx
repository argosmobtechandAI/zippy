import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Smartphone, Mail, ScanLine, Lock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from "../api/apiFunction"
import { getOTPApi, verifyOTPApi, loginApi } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const navigation = useNavigation()
  const [loginMode, setLoginMode] = useState('mobile'); // 'mobile' or 'email'
  const [mobileNumber, setMobileNumber] = useState("")
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.navigate("Tabs");
      }
    }
    checkToken();
  }, [])


  const handleLogin = async () => {
    if (loginMode === 'mobile') {
      if (!mobileNumber) {
        Alert.alert("Error", "Please enter your mobile number");
        return;
      }
    } else {
      if (!email) {
        Alert.alert("Error", "Please enter your email address");
        return;
      }
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const payload = loginMode === 'mobile' 
        ? { mobile: mobileNumber, password, type: 'trainer' } 
        : { email, password, type: 'trainer' };

      const res = await apiFunction(
        loginApi,
        [],
        payload,
        "POST",
        false
      );

      console.log(res);

      if (res.success) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.user));
        console.log("Token saved:", res.token);
        navigation.navigate("Tabs");
      } else {
        Alert.alert("Error", res.message);
      }
    } catch (error) {
      console.log("Trainer login error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


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
              <Text className="text-xs text-[#64748b]">Trainer Dashboard</Text>
            </View>
          </View>

          <View className="mb-8" />

          <View>
            <Text className="text-2xl font-bold text-[#1a202c] mb-2">Trainer Login</Text>
            <Text className="text-[#64748b] mb-8 text-sm">
              Enter your registered credentials to access your dashboard.
            </Text>

            {/* Tab Selector */}
            <View className="flex-row bg-[#FDF8F2] border border-brand-brown/5 rounded-2xl p-1 mb-6">
              <TouchableOpacity 
                onPress={() => setLoginMode('mobile')}
                className={`flex-1 py-3 rounded-xl items-center ${loginMode === 'mobile' ? 'bg-[#8C4A28]' : ''}`}
              >
                <Text className={`font-bold text-sm ${loginMode === 'mobile' ? 'text-white' : 'text-[#64748b]'}`}>Mobile Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setLoginMode('email')}
                className={`flex-1 py-3 rounded-xl items-center ${loginMode === 'email' ? 'bg-[#8C4A28]' : ''}`}
              >
                <Text className={`font-bold text-sm ${loginMode === 'email' ? 'text-white' : 'text-[#64748b]'}`}>Email Login</Text>
              </TouchableOpacity>
            </View>

            {loginMode === 'mobile' ? (
              <>
                <Text className="text-[#1a202c] font-semibold text-xs mb-2">Mobile Number</Text>
                <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                  <View className="mr-2 opacity-50">
                    <Smartphone color="#94a3b8" size={20} />
                  </View>
                  <TextInput
                    className="flex-1 text-[#1e293b]"
                    placeholder="9540441958"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={mobileNumber}
                    onChangeText={(Text) => {
                      if(Text.length > 1){
                        if (Text.length > 10) {
                          Alert.alert("Error", "Mobile number should be 10 digits")
                          return
                        }
                        if (!/^[0-9]+$/.test(Text)) {
                          Alert.alert("Error", "Mobile number should be only digits")
                          return
                        }
                      }
                      setMobileNumber(Text)
                    }}
                  />
                </View>
              </>
            ) : (
              <>
                <Text className="text-[#1a202c] font-semibold text-xs mb-2">Email Address</Text>
                <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                  <View className="mr-2 opacity-50">
                    <Mail color="#94a3b8" size={20} />
                  </View>
                  <TextInput
                    className="flex-1 text-[#1e293b]"
                    placeholder="trainer@zippy.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(Text) => setEmail(Text)}
                  />
                </View>
              </>
            )}

            <Text className="text-[#1a202c] font-semibold text-xs mb-2">Password</Text>
            <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
              <View className="mr-2 opacity-50">
                <Lock color="#94a3b8" size={20} />
              </View>
              <TextInput
                className="flex-1 text-[#1e293b]"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={true}
                value={password}
                onChangeText={(Text) => setPassword(Text)}
              />
            </View>

            <TouchableOpacity
              className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-6 mt-2"
              onPress={handleLogin}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">Log In</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-6" />

          <View className="mt-auto pt-4 border-t border-dotted border-[#cbd5e1]">
            <Text className="text-center text-[#94a3b8] text-[10px] mt-4">
              By continuing, you acknowledge that you are an authorized trainer for zippy Equestrian.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
