import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React, { useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, ChevronUp, FileText, ShieldAlert, PenTool, Check, Calendar, CreditCard, AlertTriangle, Activity, Shield } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import Signature from "react-native-signature-canvas"
import {apiFunction} from "../api/apifunction"
import {createUserApi} from "../api/api"
import Toast from 'react-native-toast-message';

export default function DeclarationScreen({route}) {
    const navigation = useNavigation()
    const signRef = useRef()
    const [agreed, setAgreed] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
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
                    <Text className="text-[#64748b] text-center text-sm px-4 leading-relaxed font-normal">
                        Please read the following terms carefully before participating in any equestrian activities at zippy.
                    </Text>
                </View>

                {/* Policies Accordion */}
                {[
                    {
                        title: "Booking & Cancellation Policy",
                        icon: Calendar,
                        content: "1. Riders may book, modify, or cancel sessions until 8:00 PM on the previous day of the scheduled session.\n2. After 8:00 PM on the previous day, no booking, rescheduling, or cancellation requests will be accepted through the system.\n3. Failure to attend a booked session without prior cancellation within the permitted timeframe will be treated as a No-Show, and the session will be considered utilized.\n4. Zippy reserves the right to modify or cancel sessions due to weather conditions, horse welfare requirements, safety concerns, instructor availability, or unforeseen circumstances."
                    },
                    {
                        title: "Refund & Transfer Policy",
                        icon: CreditCard,
                        content: "1. All fees paid towards registration, memberships, riding programs, courses, training packages, camps, guest rides, and related services are non-refundable.\n2. Once enrolled in a program, riders are not entitled to any refund, whether partial or full, under any circumstances.\n3. Missed sessions, unused sessions, medical conditions, personal commitments, relocation, schedule conflicts, or discontinuation of training shall not qualify for a refund.\n4. Memberships or riding packages may be transferred to another individual only with prior written approval from Zippy and upon payment of applicable transfer charges.\n5. Zippy reserves the right to approve or reject any transfer request.\n6. No cash refund, credit refund, or adjustment against future services shall be provided unless expressly approved by management in writing."
                    },
                    {
                        title: "Indemnity & Assumption of Risk",
                        icon: AlertTriangle,
                        content: "1. Horse riding and equestrian activities involve inherent risks, including but not limited to falls, kicks, bites, collisions, unpredictable horse behavior, equipment failure, and other risks that may result in injury, disability, or death.\n2. Riders and their parents/guardians voluntarily participate in all equestrian activities with full knowledge of these risks.\n3. Riders and their parents/guardians agree to release, indemnify, and hold harmless Zippy Equestrian Center, its owners, directors, trainers, staff, volunteers, contractors, and affiliated parties from any claims, liabilities, losses, damages, injuries, costs, or expenses arising from participation in equestrian activities.\n4. Riders agree to follow all instructions provided by trainers and staff at all times.\n5. Zippy shall not be liable for injuries, accidents, loss of personal belongings, or damages arising from participation in any activity conducted at or through the center."
                    },
                    {
                        title: "Medical Authorization Policy",
                        icon: Activity,
                        content: "1. Riders and parents/guardians are responsible for disclosing any medical conditions, allergies, injuries, medications, or physical limitations that may affect participation.\n2. In the event of an accident, injury, illness, or medical emergency, Zippy is authorized to seek appropriate medical assistance, including transportation to a hospital or medical facility if deemed necessary.\n3. Any medical expenses incurred shall be the sole responsibility of the rider or parent/guardian.\n4. Zippy does not provide medical insurance coverage for riders and strongly recommends that participants maintain adequate personal medical and accident insurance."
                    },
                    {
                        title: "Protective Gear & Safety Policy",
                        icon: Shield,
                        content: "1. Approved riding helmets must be worn at all times while mounted on a horse.\n2. Riders must wear appropriate riding attire, including long pants and closed-toe footwear with a suitable heel.\n3. Trainers or management may prohibit participation if a rider is not dressed in appropriate safety gear.\n4. Additional protective equipment such as body protectors may be mandated for specific activities, training levels, competitions, or riding exercises.\n5. Riders must follow all safety instructions issued by trainers and staff.\n6. Failure to comply with safety requirements may result in denial of participation without refund or compensation."
                    }
                ].map((policy, index) => {
                    const isExpanded = expandedIndex === index;
                    const Icon = policy.icon;
                    return (
                        <TouchableOpacity 
                            key={index} 
                            activeOpacity={0.8}
                            onPress={() => setExpandedIndex(isExpanded ? null : index)}
                            className={`bg-white rounded-2xl p-5 shadow-sm border border-[#e2e8f0] ${index === 4 ? 'mb-8' : 'mb-4'}`}
                        >
                            <View className={`flex-row justify-between items-center ${isExpanded ? 'mb-3 border-b border-[#f1f5f9] pb-3' : ''}`}>
                                <View className="flex-row items-center flex-1 pr-2">
                                    <View className="mr-2">
                                        <Icon color="#8C4A28" size={20} />
                                    </View>
                                    <Text className="text-[#1a202c] font-bold text-base">{policy.title}</Text>
                                </View>
                                <ChevronUp color="#64748b" size={20} className={isExpanded ? '' : 'rotate-180'} />
                            </View>
                            {isExpanded && (
                                <Text className="text-[#64748b] text-sm leading-relaxed font-normal">
                                    {policy.content}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}

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