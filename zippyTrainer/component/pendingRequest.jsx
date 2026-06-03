import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, XCircle, ArrowLeft, User, Clock, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { apiFunction } from "../api/apiFunction";
import { updateStatusApi } from "../api/api";

const PendingRequest = ({ route }) => {

    const navigation = useNavigation()

    const { sessions } = route.params || {};
    const [allRequests, setAllRequests] = useState([])

    useEffect(() => {
        if (sessions) {
            let participants = []
            sessions.forEach(session => {
                session.participants?.forEach(participant => {
                    if (participant?.status) {
                        participants.push({ 
                            ...participant, 
                            sessionId: session.id,
                            sessionTitle: session.title,
                            sessionTiming: session.timing,
                            sessionDate: session.date,
                            sessionLocation: session.location
                        })
                    }
                })
            })
            
            participants.sort((a, b) => {
                if (a.status?.toLowerCase() === 'pending' && b.status?.toLowerCase() !== 'pending') return -1;
                if (a.status?.toLowerCase() !== 'pending' && b.status?.toLowerCase() === 'pending') return 1;
                return 0;
            });

            setAllRequests(participants)
        }
    }, [sessions])

    const handleStatus = async (status, userId, sessionId) => {
        try {
            const res = await apiFunction(updateStatusApi, [userId, sessionId], { status }, "PUT", true)
            console.log(res, "res")
            
            setAllRequests(prev => prev.map(req => {
                if (req.riderId === userId && req.sessionId === sessionId) {
                    return { ...req, status: status };
                }
                return req;
            }));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    }

    const pendingCount = allRequests.filter(req => req.status?.toLowerCase() === "pending").length;

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            {/* Header */}
            <View className="flex-row items-center justify-start px-4 py-4 mb-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
                    <ArrowLeft color="#8C4A28" size={24} />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#1a202c]">Booking Requests</Text>
            </View>

            <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
                <View className="mb-6 flex-row justify-between items-end">
                    <View>
                        <Text className="text-3xl font-extrabold text-[#1a202c] mb-1">Requests</Text>
                        <Text className="text-[#64748b] text-base font-medium">You have {pendingCount} new request{pendingCount !== 1 ? 's' : ''} waiting.</Text>
                    </View>
                    {pendingCount > 0 && (
                        <View className="bg-[#8C4A281A] px-4 py-2 rounded-full">
                            <Text className="text-[#8C4A28] text-xs font-bold uppercase tracking-wider">{pendingCount} Actionable</Text>
                        </View>
                    )}
                </View>

                {allRequests?.map((request, index) => (
                    <View key={`${request?.riderId}-${request?.sessionId}-${index}`} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-5">
                        <View className="flex-row items-center mb-4">
                            <View className="w-16 h-16 rounded-2xl bg-gray-50 shadow-sm overflow-hidden mr-4 border border-[#e2e8f0]">
                                {request?.image ? (
                                    <Image source={{ uri: request?.image }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="flex-1 items-center justify-center bg-[#8C4A281A]">
                                        <User color="#8C4A28" size={24} />
                                    </View>
                                )}
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-xl font-bold text-[#1a202c] mb-1 capitalize">{request?.name || "Unknown User"}</Text>
                                <View className="flex-row items-center mt-1">
                                    <View className="bg-[#8C4A281A] px-2 py-1 rounded-md mr-2">
                                        <Text className="text-[#8C4A28] text-[10px] font-bold uppercase tracking-widest">{request?.type || "Rider"}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Session details */}
                        <View className="bg-[#F5EDDF]/40 rounded-2xl p-4 border border-[#e2e8f0] mb-4">
                            <Text className="text-[10px] font-black text-[#8C4A28] uppercase tracking-widest mb-1.5">SESSION BOOKING FOR</Text>
                            <Text className="text-[#1a202c] font-bold text-base mb-2">{request?.sessionTitle || "Training Slot"}</Text>
                            
                            <View className="flex-row items-center mb-1.5">
                                <Clock color="#64748b" size={13} className="mr-1.5" />
                                <Text className="text-[#64748b] text-xs font-semibold">
                                    {request?.sessionTiming} • {request?.sessionDate}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <MapPin color="#64748b" size={13} className="mr-1.5" />
                                <Text className="text-[#64748b] text-xs font-semibold">
                                    {request?.sessionLocation}
                                </Text>
                            </View>
                        </View>

                        {/* Actions */}
                        {request?.status?.toLowerCase() === "pending" && (
                            <View className="flex-row justify-between pt-2">
                                <TouchableOpacity
                                    onPress={() => handleStatus("rejected", request?.riderId, request?.sessionId)}
                                    className="flex-1 bg-white border border-red-500 py-3.5 rounded-2xl flex-row justify-center items-center mr-2 shadow-sm"
                                >
                                    <XCircle color="#ef4444" size={18} className="mr-1.5" />
                                    <Text className="text-[#ef4444] font-bold text-sm">Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleStatus("confirmed", request?.riderId, request?.sessionId)}
                                    className="flex-1 bg-[#8C4A28] py-3.5 rounded-2xl flex-row justify-center items-center ml-2 border border-[#8C4A28]"
                                >
                                    <CheckCircle2 color="white" size={18} className="mr-1.5" />
                                    <Text className="text-white font-bold text-sm">Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {(request?.status?.toLowerCase() === "approved" || request?.status?.toLowerCase() === "confirmed") && (
                            <View className="flex-row justify-center items-center py-3.5 bg-green-50 rounded-2xl border border-green-200">
                                <CheckCircle2 color="#16a34a" size={18} className="mr-1.5" />
                                <Text className="text-[#16a34a] font-bold text-sm">Request Approved</Text>
                            </View>
                        )}

                        {request?.status?.toLowerCase() === "rejected" && (
                            <View className="flex-row justify-center items-center py-3.5 bg-red-50 rounded-2xl border border-red-200">
                                <XCircle color="#dc2626" size={18} className="mr-1.5" />
                                <Text className="text-[#dc2626] font-bold text-sm">Request Rejected</Text>
                            </View>
                        )}
                    </View>
                ))}

                {allRequests?.length === 0 && (
                    <View className="items-center justify-center py-10 mt-10">
                        <View className="w-24 h-24 bg-[#8C4A281A] rounded-full items-center justify-center mb-6">
                            <CheckCircle2 color="#8C4A28" size={32} opacity={0.5} />
                        </View>
                        <Text className="text-xl font-bold text-[#1a202c] mb-2">No Requests Yet</Text>
                        <Text className="text-[#64748b] text-center text-sm px-6">You don't have any booking requests at the moment.</Text>
                    </View>
                )}

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    )
}

export default PendingRequest;