import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, ChevronUp, FileText, ShieldAlert, PenTool, Check } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import Signature from "react-native-signature-canvas"
import {apiFunction} from "../api/apifunction"
import {createUserApi} from "../api/api"
import Toast from 'react-native-toast-message';

export default function DeclarationScreen({route}) {
    const navigation = useNavigation()
    const signRef = useRef()
    const [agreed, setAgreed] = useState(false);
    const {formData} = route.params;
    const [data, setData] = useState(null)
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const isSubmittingRef = useRef(false);

    console.log(formData)

    const registerUser = async (payload) => {
        const res = await apiFunction(createUserApi, [], payload, "POST", false)
        if(res.success){
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "User created successfully"
            })
            navigation.navigate("Login")
        }else{
            Toast.show({
                type: "error",
                text1: "Error",
                text2: `Error:${res.message}`
            })
            navigation.navigate("Profile")
        }
    };

    const handleOK = async (signature) => {
        const fullData = { ...formData, signature: signature };
        setData(fullData);
        if (isSubmittingRef.current) {
            isSubmittingRef.current = false;
            await registerUser(fullData);
        } else {
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Signature saved successfully"
            });
        }
    };

    const handleSubmit = async () => {
        if (data) {
            await registerUser(data);
        } else {
            isSubmittingRef.current = true;
            signRef.current.readSignature();
        }
    };


    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="bg-[#8C4A28] px-4 py-4 flex-row items-center justify-between shadow-md">
                <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center">
                    <View className="mr-2 pl-1">
                        <ArrowLeft color="white" size={24} />
                    </View>
                    <Text className="text-white font-bold text-lg">Back</Text>
                </TouchableOpacity>
                <Text className="text-[#fceddf] text-xs font-bold uppercase tracking-widest">Step 2 of 3</Text>
            </View>

            <ScrollView 
                scrollEnabled={scrollEnabled}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }} 
                showsVerticalScrollIndicator={false}
            >

                <View className="items-center mb-8 mt-4">
                    <View className="w-16 h-16 bg-[#e2d5c3] rounded-full items-center justify-center mb-4">
                        <FileText color="#8C4A28" size={32} />
                    </View>
                    <Text className="text-2xl font-bold text-[#1a202c] text-center mb-2">Digital Waiver &{'\n'}Indemnity Agreement</Text>
                    <Text className="text-[#64748b] text-center text-sm px-4 leading-relaxed">
                        Please read the following terms carefully before participating in any equestrian activities at zippy.
                    </Text>
                </View>

                {/* Accordion Item 1 */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                    <View className="flex-row justify-between items-center mb-3 border-b border-[#f1f5f9] pb-3">
                        <View className="flex-row items-center">
                            <View className="mr-2">
                                <ShieldAlert color="#8C4A28" size={20} />
                            </View>
                            <Text className="text-[#1a202c] font-bold text-base">Assumption of Risk</Text>
                        </View>
                        <ChevronUp color="#64748b" size={20} />
                    </View>
                    <Text className="text-[#64748b] text-sm leading-relaxed">
                        I understand and acknowledge that horse riding is a high-risk sport and that I am participating at my own risk.
                        I accept full responsibility for any injury, loss, or damage to myself or my property. zippy Equestrian Center,
                        its owners, trainers, and staff shall not be liable for any inherent risks associated with equine activities.
                    </Text>
                </View>

                {/* Accordion Item 2 - Collapsed */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-[#1a202c] font-bold text-base">Medical Authorization</Text>
                        <ChevronUp color="#64748b" size={20} className="rotate-180" />
                    </View>
                </View>

                {/* Accordion Item 3 - Collapsed */}
                <View className="bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] mb-8">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-[#1a202c] font-bold text-base">Protective Gear Policy</Text>
                        <ChevronUp color="#64748b" size={20} className="rotate-180" />
                    </View>
                </View>

                {/* Agreement Checkbox */}
                <TouchableOpacity
                    className="flex-row items-start bg-[#fceddf] p-4 rounded-xl border border-[#eabba4] mb-8"
                    onPress={() => setAgreed(!agreed)}
                >
                    <View className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center mt-0.5 ${agreed ? 'bg-[#8C4A28] border-[#8C4A28]' : 'border-[#8C4A28] bg-white'}`}>
                        {agreed && <Check color="white" size={16} />}
                    </View>
                    <Text className="flex-1 text-[#8C4A28] text-sm leading-relaxed font-semibold">
                        I have read, understood, and agree to be bound by the terms of this waiver and indemnity agreement.
                    </Text>
                </TouchableOpacity>

                {/* Signature Box (Simulated) */}
                <View className="mb-8">
                    <Text className="text-[#1a202c] font-bold text-sm mb-2">Digital Signature</Text>

                    <View className="bg-white flex justify-center items-center h-40 rounded-2xl border border-dashed border-[#8C4A28] overflow-hidden">
                        <Text className="text-[#cbd5e1] font-medium">Draw your signature here</Text>
                        <Signature
                            onOK={handleOK}
                            onBegin={() => setScrollEnabled(false)}
                            onEnd={() => setScrollEnabled(true)}
                            ref={signRef}
                            descriptionText=""
                            webStyle={
                                `.m - signature - pad { box - shadow: none; border: none; height: 100%; } .m-signature-pad--body {border: none; } .m-signature-pad--footer {display: flex; justify-content: space-between; } body,html {height: 100%; } `}
                        />
                    </View>

                    <View className="flex-row justify-between mt-3">

                        {/* CLEAR BUTTON */}
                        <TouchableOpacity
                            onPress={() => signRef.current.clearSignature()}
                        >
                            <Text className="text-[#64748b] text-xs underline font-bold">
                                Clear
                            </Text>
                        </TouchableOpacity>

                        {/* SAVE BUTTON */}
                        <TouchableOpacity
                            onPress={() => signRef.current.readSignature()}
                            className="bg-[#8C4A28] px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white text-xs font-bold">
                                Save Signature
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#e2e8f0]">
                <TouchableOpacity
                    className={`w-full py-4 rounded-xl items-center flex-row justify-center shadow-md ${agreed ? 'bg-[#8C4A28]' : 'bg-[#cbd5e1]'}`}
                    disabled={!agreed}
                    onPress={handleSubmit}
                
                >
                    <View className="mr-2">
                        <PenTool color="white" size={20} />
                    </View>
                    <Text className="text-white font-bold text-lg">Sign & Submit</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}