import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, ArrowRight, Smartphone, Mail, ScanLine } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { apiFunction } from '../api/apifunction';
import Toast from 'react-native-toast-message';
import { getOTPApi, verifyOTPApi } from '../api/api';
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [mobileNumber, setMobileNumber] = useState('1231231234');
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [gotOtp, setGotOtp] = useState(false);
  const otpRef = useRef([])

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



  const getOtp = async () => {
    setLoading(true)
    const res = await apiFunction(getOTPApi, [], { mobile: mobileNumber }, "POST", false)
    console.log(res)
    if (res.success) {
      setStep(2)
      setGotOtp(res.otp)
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: res.message
      })
    }
    setLoading(false)
  }

  const verifyOtp = async () => {
    if (!otp || otp.join("").length !== 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter 6 digit OTP"
      });
      return;
    }

    try {
      const res = await apiFunction(
        verifyOTPApi,
        [],
        { mobile: mobileNumber, otp: otp.join("") },
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
      console.log("AsyncStorage error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong"
      });
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
              zippy <Text className="text-[#8C4A28]">Equestrian</Text>
            </Text>
          </View>

          {step === 1 ? (
            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Welcome Back</Text>
              <Text className="text-[#64748b] mb-8 text-sm">
                Enter your mobile number to sign in or create an account.
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
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-8"
                onPress={getOtp}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Get OTP</Text>
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
                  <Text className="text-[#1a202c] font-semibold text-sm">Scan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <TouchableOpacity className="flex-row items-center mb-6" onPress={() => setStep(1)}>
                <View className="mr-2">
                  <ArrowLeft color="#8C4A28" size={16} />
                </View>
                <Text className="text-[#8C4A28] text-xs font-bold mt-0.5">VERIFICATION PHASE</Text>
              </TouchableOpacity>

              {gotOtp && (
                <>
                  <View className="bg-green-500 absolute top-0 p-4 rounded-xl"><Text className="text-white font-bold text-lg">Your otp is {gotOtp}</Text></View>
                </>
              )}

              <View className="flex-row justify-between mb-8">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => (otpRef.current[i] = ref)}
                    className="w-12 h-14 border border-[#e2e8f0] rounded-lg bg-[#f8fafc] text-center text-lg text-[#1e293b]"
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otp[i]}
                    onChangeText={(text) => {
                      const newOtp = [...otp];
                      newOtp[i] = text;
                      setOtp(newOtp);

                      // move forward
                      if (text && i < 5) {
                        otpRef.current[i + 1]?.focus();
                      }

                      // move backward
                      if (!text && i > 0) {
                        otpRef.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center justify-center mb-6"
                onPress={verifyOtp}
              >
                <Text className="text-white font-bold text-lg">Verify and Continue</Text>
              </TouchableOpacity>

              <Text className="text-center text-[#64748b] text-sm mb-6">
                Didn't receive code? <Text className="text-[#8C4A28] font-bold">Resend in 0:45</Text>
              </Text>
            </View>
          )}

          <View className="mt-auto pt-4 border-t border-dotted border-[#cbd5e1]">
            <Text className="text-center text-[#94a3b8] text-[10px] mt-4">
              By continuing, you agree to zippy Equestrian's{' '}
              <Text className="underline">Terms of Service</Text> and <Text className="underline">Privacy Policy</Text>.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
