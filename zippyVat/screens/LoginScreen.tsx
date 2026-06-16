import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ArrowRight, Smartphone, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apiFunction';
import { loginApi } from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [identifierType, setIdentifierType] = useState('mobile'); // 'mobile' or 'email'
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        navigation.replace('Tabs');
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setCheckingAuth(false);
    }
  };

  if (checkingAuth) {
    return (
      <View className="flex-1 bg-[#F5EDDF] items-center justify-center">
        <ActivityIndicator color="#8C4A28" size="large" />
      </View>
    );
  }

  const handleLogin = async () => {
    if (identifierType === 'mobile' && !mobileNumber) {
      Alert.alert("Error", "Please enter your mobile number.");
      return;
    }
    if (identifierType === 'email' && !emailAddress) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        password,
        type: 'vet'
      };
      
      if (identifierType === 'email') {
        payload.email = emailAddress.trim().toLowerCase();
      } else {
        payload.mobile = mobileNumber.trim();
      }

      const res = await apiFunction(loginApi, [], payload, 'POST', false);
      
      if (res && res.success) {
        // Only allow Vets to access this portal
        if (res.user.type !== 'vet') {
          Alert.alert("Access Denied", "This portal is strictly for Veterinary partners.");
          return;
        }

        await AsyncStorage.setItem('token', res.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.user));
        navigation.replace('Tabs');
      } else {
        Alert.alert("Error", res?.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
          {/* Header section with Logo */}
          <View className="flex-row items-center mb-8 mt-2">
            <View className="w-8 h-8 bg-[#2C5F43] rounded border border-[#8C4A28] items-center justify-center mr-3">
              <ArrowRight color="white" size={16} />
            </View>
            <View>
              <Text className="text-lg font-bold text-[#1a202c]">
                zippy <Text className="text-[#8C4A28] font-normal">Equestrian</Text>
              </Text>
              <Text className="text-xs text-[#64748b]">Veterinary Portal</Text>
            </View>
          </View>

          <View>
            <Text className="text-2xl font-bold text-[#1a202c] mb-2">Welcome Back</Text>
            <Text className="text-[#64748b] mb-8 text-sm font-normal">
              Enter your {identifierType === 'mobile' ? 'mobile number' : 'email'} and password to sign in.
            </Text>

            <Text className="text-[#1a202c] font-semibold text-xs mb-2">
              {identifierType === 'mobile' ? 'Mobile Number' : 'Email Address'}
            </Text>
            <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
              <View className="mr-2 opacity-50">
                {identifierType === 'mobile' ? <Smartphone color="#94a3b8" size={20} /> : <Mail color="#94a3b8" size={20} />}
              </View>
              {identifierType === 'mobile' ? (
                <TextInput
                  className="flex-1 text-[#1e293b] font-normal"
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setMobileNumber(numericValue);
                  }}
                />
              ) : (
                <TextInput
                  className="flex-1 text-[#1e293b] font-normal"
                  placeholder="email@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />
              )}
            </View>

            <Text className="text-[#1a202c] font-semibold text-xs mb-2">Password</Text>
            <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-8 bg-[#f8fafc]">
              <View className="mr-2 opacity-50">
                <Lock color="#94a3b8" size={20} />
              </View>
              <TextInput
                className="flex-1 text-[#1e293b] font-normal"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#8C4A28]'} py-4 rounded-xl items-center flex-row justify-center mb-8`}
              onPress={handleLogin}
              disabled={loading}
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

            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#e2e8f0]" />
              <Text className="px-4 text-xs font-semibold text-[#94a3b8]">QUICK ACCESS</Text>
              <View className="flex-1 h-[1px] bg-[#e2e8f0]" />
            </View>

            <View className="flex-row justify-between mb-8">
              <TouchableOpacity onPress={() => setIdentifierType('mobile')} className={`flex-1 flex-row items-center justify-center border ${identifierType === 'mobile' ? 'border-[#8C4A28] bg-[#faeadd]' : 'border-[#e2e8f0] bg-white'} py-3 rounded-xl mr-2`}>
                <View className="mr-2 opacity-60">
                  <Smartphone color={identifierType === 'mobile' ? "#8C4A28" : "#64748b"} size={18} />
                </View>
                <Text className={`font-semibold text-sm ${identifierType === 'mobile' ? 'text-[#8C4A28]' : 'text-[#1a202c]'}`}>Mobile Login</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIdentifierType('email')} className={`flex-1 flex-row items-center justify-center border ${identifierType === 'email' ? 'border-[#8C4A28] bg-[#faeadd]' : 'border-[#e2e8f0] bg-white'} py-3 rounded-xl ml-2`}>
                <View className="mr-2 opacity-60">
                  <Mail color={identifierType === 'email' ? "#8C4A28" : "#64748b"} size={18} />
                </View>
                <Text className={`font-semibold text-sm ${identifierType === 'email' ? 'text-[#8C4A28]' : 'text-[#1a202c]'}`}>Email Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-auto pt-4 border-t border-dotted border-[#cbd5e1]">
            <Text className="text-center text-[#94a3b8] text-[10px] mt-4 font-normal">
              By continuing, you acknowledge that you are an authorized veterinary partner for zippy Equestrian.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

