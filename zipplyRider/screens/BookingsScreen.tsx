import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Info, ArrowUpRight, Calendar, User as UserIcon, Clock, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const pendingSessions = [
  { title: 'Advanced Show Jumping', date: 'Saturday, Oct 28 • 09:30 AM', trainer: 'Sarah Jenkins' },
  { title: 'Dressage Basics I', date: 'Monday, Oct 30 • 02:00 PM', trainer: 'Michael Thorne' },
  { title: 'Stable Management 101', date: 'Thursday, Nov 02 • 11:00 AM', trainer: 'Elena Rodriguez' },
];

const pastSessions = [
  { title: 'Beginner Trail Ride', date: 'Sunday, Sep 15 • 10:00 AM', trainer: 'Sarah Jenkins', horse: 'Thunderbolt', rating: 5 },
  { title: 'Dressage Intro', date: 'Friday, Sep 05 • 03:00 PM', trainer: 'Elena Rodriguez', horse: 'Apollo', rating: 4 },
  { title: 'Stable Orientation', date: 'Wednesday, Aug 20 • 09:00 AM', trainer: 'Michael Thorne', horse: 'N/A', rating: 5 },
];

export default function BookingsScreen() {
  const [tab, setTab] = useState('PENDING');
  const navigation = useNavigation()

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Header */}
      <View className="flex-row items-center px-10 py-4 bg-white">

        <Text className="text-[#8C4A28] font-bold text-lg">MY BOOKINGS</Text>
      </View>

      {/* Top Tabs */}
      <View className="flex-row bg-white border-b border-[#e2e8f0]">
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === 'PENDING' ? 'border-[#8C4A28]' : 'border-transparent'}`}
          onPress={() => setTab('PENDING')}
        >
          <Text className={`font-bold text-xs ${tab === 'PENDING' ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>PENDING APPROVAL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center justify-center py-4 border-b-2 ${tab === 'PAST' ? 'border-[#8C4A28]' : 'border-transparent'}`}
          onPress={() => setTab('PAST')}
        >
          <Text className={`font-bold text-xs ${tab === 'PAST' ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>PAST SESSIONS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {tab === 'PENDING' ? (
          <>
            {/* Cancellation Policy Alert */}
            <View className="bg-[#fceddf] border border-[#eabba4] rounded-2xl p-4 mb-6">
              <View className="flex-row items-center mb-2">
                <View className="mr-2">
                  <Info color="#8C4A28" size={16} />
                </View>
                <Text className="text-[#8C4A28] font-bold text-sm">Cancellation Policy</Text>
              </View>
              <Text className="text-[#64748b] text-xs leading-relaxed mb-2">
                Cancellations made within 24 hours of the session start time are non-refundable. Please contact support for emergencies or specific inquiries.
              </Text>
              <TouchableOpacity className="flex-row items-center text-[#8C4A28]">
                <Text className="text-[#8C4A28] font-bold text-xs mr-1">Full Policy</Text>
                <ArrowUpRight color="#8C4A28" size={12} />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="w-1 h-5 bg-[#8C4A28] rounded mr-2" />
              <Text className="text-[#1a202c] font-bold text-lg">Scheduled Sessions</Text>
            </View>

            <View className="space-y-4">
              {pendingSessions.map((session, idx) => (
                <View key={idx} className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-sm mb-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="bg-[#fceddf] px-2 py-1 rounded">
                      <Text className="text-[#8C4A28] font-bold text-[8px] tracking-widest uppercase">PENDING</Text>
                    </View>
                    <View className="bg-[#fceddf] p-1.5 rounded-lg">
                      <Calendar color="#8C4A28" size={16} />
                    </View>
                  </View>

                  <Text className="text-[#1a202c] font-bold text-lg mb-3">{session.title}</Text>

                  <View className="space-y-2 mb-4 mt-2">
                    <View className="flex-row items-center">
                      <View className="w-6 items-center border border-transparent mr-1">
                        <Calendar color="#8C4A28" size={14} />
                      </View>
                      <Text className="text-[#64748b] text-xs">{session.date}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                      <View className="w-6 items-center border border-transparent mr-1">
                        <UserIcon color="#8C4A28" size={14} />
                      </View>
                      <Text className="text-[#64748b] text-xs">Trainer: {session.trainer}</Text>
                    </View>
                  </View>

                  <View className="h-[1px] bg-[#f1f5f9] mb-4" />

                  <View className="flex-row justify-between items-center mt-2">
                    <TouchableOpacity>
                      <Text className="text-[#94a3b8] font-bold text-xs tracking-wider uppercase">✕ Cancel Request</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("Sessions", { screen: "SessionDetail" })} className="bg-[#8C4A28] py-2 px-4 rounded-lg">
                      <Text className="text-white font-bold text-xs">View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="flex-1 bg-[#F5EDDF]">


            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>

              <View className="flex-row items-center mb-6 mt-2">

                <View>
                  <Text className="text-[#1a202c] font-bold text-xl">Past Sessions</Text>
                  <Text className="text-[#64748b] text-sm">Review your previous rides and ratings.</Text>
                </View>
              </View>

              <View className="space-y-4">
                {pastSessions.map((session, idx) => (
                  <View key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4">
                    <View className="flex-row justify-between items-start mb-3">
                      <Text className="text-[#1a202c] font-bold text-lg flex-1 mr-2">{session.title}</Text>
                      <View className="bg-[#fceddf] px-2 py-1 rounded-lg">
                        <Text className="text-[#8C4A28] font-bold text-[8px] uppercase tracking-widest">COMPLETED</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-2 mb-4">
                      <Calendar color="#64748b" size={16} />
                      <Text className="text-[#64748b] text-sm ml-2">{session.date}</Text>
                    </View>

                    <View className="flex-row justify-between items-center bg-[#f8fafc] p-3 rounded-2xl mb-4">
                      <View className="flex-1 border-r border-[#e2e8f0]">
                        <Text className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider mb-1">Trainer</Text>
                        <Text className="text-[#1a202c] font-semibold text-sm">{session.trainer}</Text>
                      </View>
                      <View className="flex-1 pl-4">
                        <Text className="text-[#94a3b8] text-[10px] uppercase font-bold tracking-wider mb-1">Horse</Text>
                        <Text className="text-[#1a202c] font-semibold text-sm">{session.horse}</Text>
                      </View>
                    </View>

                    <View className="flex-row justify-between items-center border-t border-[#f1f5f9] pt-4">
                      <View className="flex-row items-center">
                        <Text className="text-xs text-[#64748b] mr-2">Your Rating:</Text>
                        <View className="flex-row">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} color={i < session.rating ? '#f59e0b' : '#cbd5e1'} fill={i < session.rating ? '#f59e0b' : 'transparent'} />
                          ))}
                        </View>
                      </View>
                      <TouchableOpacity>
                        <Text className="text-[#8C4A28] font-bold text-sm">View Notes →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
