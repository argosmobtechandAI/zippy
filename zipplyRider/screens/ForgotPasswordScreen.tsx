import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { apiFunction } from '../api/apifunction';
import { sendForgotPasswordOtpApi, verifyForgotPasswordOtpApi, resetPasswordApi } from '../api/api';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter your email address" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFunction(sendForgotPasswordOtpApi, [], { email }, "POST", false);
      if (res.success) {
        Toast.show({ type: "success", text1: "Success", text2: res.message });
        setStep(2);
      } else {
        Toast.show({ type: "error", text1: "Error", text2: res.message || "Failed to send OTP" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Toast.show({ type: "error", text1: "Error", text2: "Please enter a valid 6-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFunction(verifyForgotPasswordOtpApi, [], { email, otp }, "POST", false);
      if (res.success) {
        Toast.show({ type: "success", text1: "Success", text2: "OTP verified successfully" });
        setStep(3);
      } else {
        Toast.show({ type: "error", text1: "Error", text2: res.message || "Invalid OTP" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({ type: "error", text1: "Error", text2: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      const res = await apiFunction(resetPasswordApi, [], { email, otp, newPassword }, "POST", false);
      if (res.success) {
        Toast.show({ type: "success", text1: "Success", text2: "Password reset successfully!" });
        navigation.navigate("Login");
      } else {
        Toast.show({ type: "error", text1: "Error", text2: res.message || "Failed to reset password" });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
        <View className="flex-1 bg-white rounded-3xl p-6 shadow-sm">
          
          {/* Header */}
          <View className="flex-row items-center mb-8 mt-2">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <View className="w-8 h-8 bg-[#f8fafc] rounded-full items-center justify-center border border-[#e2e8f0]">
                <ArrowLeft color="#1a202c" size={16} />
              </View>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-[#1a202c]">
              Forgot <Text className="text-[#8C4A28]">Password</Text>
            </Text>
          </View>

          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Reset Password</Text>
              <Text className="text-[#64748b] mb-8 text-sm">
                Enter your registered email address to receive a 6-digit OTP.
              </Text>

              <Text className="text-[#1a202c] font-semibold text-xs mb-2">Email Address</Text>
              <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                <View className="mr-2 opacity-50">
                  <Mail color="#94a3b8" size={20} />
                </View>
                <TextInput
                  className="flex-1 text-[#1e293b]"
                  placeholder="email@example.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-4"
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Send OTP</Text>
                    <ArrowRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">Enter OTP</Text>
              <Text className="text-[#64748b] mb-8 text-sm">
                We've sent a 6-digit code to <Text className="font-semibold text-[#1a202c]">{email}</Text>.
              </Text>

              <Text className="text-[#1a202c] font-semibold text-xs mb-2">6-Digit Code</Text>
              <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                <View className="mr-2 opacity-50">
                  <ShieldCheck color="#94a3b8" size={20} />
                </View>
                <TextInput
                  className="flex-1 text-[#1e293b] text-lg tracking-widest font-semibold"
                  placeholder="------"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                />
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-4"
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Verify Code</Text>
                    <ArrowRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleSendOTP} disabled={loading} className="items-center mt-2">
                <Text className="text-[#8C4A28] font-semibold text-sm">Resend OTP</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="text-2xl font-bold text-[#1a202c] mb-2">New Password</Text>
              <Text className="text-[#64748b] mb-8 text-sm">
                Please enter your new secure password below.
              </Text>

              <Text className="text-[#1a202c] font-semibold text-xs mb-2">New Password</Text>
              <View className="flex-row items-center border border-[#e2e8f0] rounded-xl px-4 py-3 mb-6 bg-[#f8fafc]">
                <View className="mr-2 opacity-50">
                  <Lock color="#94a3b8" size={20} />
                </View>
                <TextInput
                  className="flex-1 text-[#1e293b]"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  {showPassword ? <EyeOff color="#94a3b8" size={20} /> : <Eye color="#94a3b8" size={20} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-4"
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Reset Password</Text>
                    <ArrowRight color="white" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
