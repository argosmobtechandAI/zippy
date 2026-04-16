import { View, Text, TouchableOpacity, ScrollView, Image, SafeAreaView } from "react-native";
import { CheckCircle2, XCircle, ArrowLeft, User } from "lucide-react-native";
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
                    // Include all participants with a status
                    if (participant?.status) {
                        participants.push({ ...participant, sessionId: session.id })
                    }
                })
            })
            
            // Sort so pending requests are always at the top
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
            
            // Update the local state to instantly reflect the new status
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

    // Filter pending requests to show actionable count correctly based on local state updates
    const pendingCount = allRequests.filter(req => req.status?.toLowerCase() === "pending").length;

    return (
        <SafeAreaView className="flex-1 bg-[#F8FAFC]">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pt-6 pb-2">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100"
                >
                    <ArrowLeft color="#1a202c" size={20} strokeWidth={2.5} />
                </TouchableOpacity>
                <View className="items-center flex-1">
                    <Text className="text-lg font-bold text-[#1a202c]">Booking Requests</Text>
                </View>
                <View className="w-11 h-11"></View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
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
                    <View key={`${request?.riderId}-${request?.sessionId}-${index}`} className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 border border-gray-100 mb-5">
                        <View className="flex-row items-center mb-5">
                            <View className="w-16 h-16 rounded-2xl bg-gray-50 shadow-sm overflow-hidden mr-4 border border-gray-100">
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

                        {/* Actions */}
                        {request?.status?.toLowerCase() == "pending" && (
                            <View className="flex-row justify-between pt-4 border-t border-gray-100">
                                <TouchableOpacity
                                    onPress={() => handleStatus("rejected", request?.riderId, request?.sessionId)}
                                    className="flex-1 bg-white border-2 border-red-50 py-3.5 rounded-2xl flex-row justify-center items-center mr-2 shadow-sm shadow-red-100"
                                >
                                    <XCircle color="#ef4444" size={20} className="mr-2" />
                                    <Text className="text-red-500 font-bold text-base">Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleStatus("approved", request?.riderId, request?.sessionId)}
                                    className="flex-1 bg-[#8C4A28] shadow-md shadow-gray-300 py-3.5 rounded-2xl flex-row justify-center items-center ml-2 border border-[#8C4A28]"
                                >
                                    <CheckCircle2 color="white" size={20} className="mr-2" />
                                    <Text className="text-white font-bold text-base">Approve</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {request?.status?.toLowerCase() == "approved" && (
                            <View className="flex-row justify-center items-center pt-4 border-t border-gray-100 bg-green-50 rounded-b-3xl -mx-5 -mb-5 pb-5 mt-2">
                                <CheckCircle2 color="#10b981" size={20} className="mr-2" />
                                <Text className="text-[#10b981] font-bold text-base">Request Approved</Text>
                            </View>
                        )}

                        {request?.status?.toLowerCase() == "rejected" && (
                            <View className="flex-row justify-center items-center pt-4 border-t border-gray-100 bg-red-50 rounded-b-3xl -mx-5 -mb-5 pb-5 mt-2">
                                <XCircle color="#ef4444" size={20} className="mr-2" />
                                <Text className="text-[#ef4444] font-bold text-base">Request Rejected</Text>
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

export default PendingRequest