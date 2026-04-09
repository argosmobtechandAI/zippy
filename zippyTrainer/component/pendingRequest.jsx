import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { MapPin, CheckCircle2, XCircle, ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const PendingRequest = () => {

    const navigation = useNavigation()
    return (
        <View className="flex p-4">
            {/* Title Section */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()}><ArrowLeft color="#1a202c" size={24} /></TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-[#1a202c] mb-1">Pending Bookings</Text>
                    <Text className="text-[#64748b] text-sm">You have 4 requests waiting for review</Text>
                </View>
                <View className="bg-[#8C4A28] px-3 py-1.5 rounded-lg">
                    <Text className="text-white text-[10px] font-bold">4 Actionable</Text>
                </View>
            </View>

            {/* Card 1 */}
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-2">SAT, OCT 14 • 10:00 AM</Text>
                        <Text className="text-[#1a202c] font-bold text-lg mb-1">Alice Thompson</Text>
                        <Text className="text-[#64748b] text-xs font-semibold mb-2">Intermediate • Show Jumping</Text>

                        <View className="flex-row items-center">
                            <MapPin color="#94a3b8" size={14} className="mr-1" />
                            <Text className="text-[#94a3b8] text-xs">Main Arena</Text>
                        </View>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1594911874499-28c0c4a4f896?q=80&w=200&auto=format&fit=crop' }}
                        className="w-20 h-20 rounded-2xl ml-3"
                    />
                </View>

                {/* Actions */}
                <View className="flex-row justify-between pt-4 border-t border-[#f1f5f9]">
                    <TouchableOpacity className="flex-1 bg-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center mr-2">
                        <CheckCircle2 color="white" size={18} className="mr-2" />
                        <Text className="text-white font-bold">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white border border-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center ml-2">
                        <XCircle color="#8C4A28" size={18} className="mr-2" />
                        <Text className="text-[#8C4A28] font-bold">Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Card 2 */}
            <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-2">SUN, OCT 15 • 09:30 AM</Text>
                        <Text className="text-[#1a202c] font-bold text-lg mb-1">James Miller</Text>
                        <Text className="text-[#64748b] text-xs font-semibold mb-2">Beginner • Dressage Foundation</Text>

                        <View className="flex-row items-center">
                            <MapPin color="#94a3b8" size={14} className="mr-1" />
                            <Text className="text-[#94a3b8] text-xs">Training Paddock</Text>
                        </View>
                    </View>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=200&auto=format&fit=crop' }}
                        className="w-20 h-20 rounded-2xl ml-3"
                    />
                </View>

                {/* Actions */}
                <View className="flex-row justify-between pt-4 border-t border-[#f1f5f9]">
                    <TouchableOpacity className="flex-1 bg-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center mr-2">
                        <CheckCircle2 color="white" size={18} className="mr-2" />
                        <Text className="text-white font-bold">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-white border border-[#8C4A28] py-3 rounded-xl flex-row justify-center items-center ml-2">
                        <XCircle color="#8C4A28" size={18} className="mr-2" />
                        <Text className="text-[#8C4A28] font-bold">Reject</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Weekly Schedule Bottom Section */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold text-[#1a202c]">Weekly Schedule</Text>
                <Text className="text-[#8C4A28] font-bold text-sm">Tue - Sun</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="bg-white rounded-2xl p-4 items-center mr-3 min-w-[70px] border border-[#e2e8f0]">
                    <Text className="text-[#94a3b8] text-[10px] font-bold mb-2">TUE</Text>
                    <Text className="text-[#1a202c] font-bold text-xl">17</Text>
                </View>
                <View className="bg-[#8C4A28] rounded-2xl p-4 items-center mr-3 min-w-[70px]">
                    <Text className="text-white opacity-80 text-[10px] font-bold mb-2">WED</Text>
                    <Text className="text-white font-bold text-xl">18</Text>
                </View>
                <View className="bg-white rounded-2xl p-4 items-center mr-3 min-w-[70px] border border-[#e2e8f0]">
                    <Text className="text-[#94a3b8] text-[10px] font-bold mb-2">THU</Text>
                    <Text className="text-[#1a202c] font-bold text-xl">19</Text>
                </View>
                <View className="bg-white rounded-2xl p-4 items-center mr-3 min-w-[70px] border border-[#e2e8f0]">
                    <Text className="text-[#94a3b8] text-[10px] font-bold mb-2">FRI</Text>
                    <Text className="text-[#1a202c] font-bold text-xl">20</Text>
                </View>
            </ScrollView>
        </View>

    )
}

export default PendingRequest