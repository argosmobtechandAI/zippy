import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Smartphone, Mail, ScanLine, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import Toast from 'react-native-toast-message';
import { loginApi } from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierType, setIdentifierType] = useState('mobile'); // 'mobile' or 'email'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.navigate("Tabs");
      }
    }

    const deleteToken = async () => {
      await AsyncStorage.removeItem("token");
    }
    checkToken();
    // deleteToken();
  }, [])



  const handlePasswordLogin = async () => {
    if (identifierType === 'mobile' && !mobileNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your mobile number"
      });
      return;
    }
    if (identifierType === 'email' && !emailAddress) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your email address"
      });
      return;
    }
    if (!password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your password"
      });
      return;
    }
    setLoading(true);
    try {
      const payload = identifierType === 'mobile' 
        ? { mobile: mobileNumber, password, type: 'rider' }
        : { email: emailAddress, password, type: 'rider' };
      
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
        if (res.user) {
          await AsyncStorage.setItem("user", JSON.stringify(res.user));
        }
        console.log("Token saved:", res.token);
        navigation.navigate("Tabs");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res.message
        });
      }
    } catch (error) {
      console.log("Password login error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong"
      });
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
            <Text className="text-lg font-bold text-[#1a202c]">
              zippy <Text className="text-[#8C4A28] font-normal">Equestrian</Text>
            </Text>
          </View>

            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Welcome Back</Text>
              <Text className="text-[#64748b] mb-8 text-sm font-normal">
                Enter your mobile number and password to sign in.
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
                    value={mobileNumber}
                    onChangeText={(Text) => {
                      if(Text.length > 1){
                        if (Text.length > 10) {
                          Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "Mobile number should be 10 digits"
                          })
                          return
                        }
                        if (!/^[0-9]+$/.test(Text)) {
                          Toast.show({
                            type: "error",
                            text1: "Error",
                            text2: "Mobile number should be only digits"
                          })
                          return
                        }
                      }
                      setMobileNumber(Text)
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
                    onChangeText={(Text) => setEmailAddress(Text)}
                  />
                )}
              </View>

              <Text className="text-[#1a202c] font-semibold text-xs mb-2">Password</Text>
              <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-2 bg-[#f8fafc]">
                <View className="mr-2 opacity-50">
                  <Lock color="#94a3b8" size={20} />
                </View>
                <TextInput
                  className="flex-1 text-[#1e293b] font-normal"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(Text) => setPassword(Text)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => navigation.navigate("ForgotPassword")}
                className="self-end mb-6"
              >
                <Text className="text-[#8C4A28] font-semibold text-xs">Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-4"
                onPress={handlePasswordLogin}
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

              <TouchableOpacity onPress={() => navigation.navigate("Profile")} className="flex-row w-full justify-center items-center mb-6">
                <Text className="px-4 text-lg font-semibold text-[#8C4A28] border border-[#8C4A28] rounded-xl py-2">Create Profile</Text>
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
              By continuing, you agree to zippy Equestrian's{' '}
              <Text className="underline font-normal">Terms of Service</Text> and <Text className="underline font-normal">Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
