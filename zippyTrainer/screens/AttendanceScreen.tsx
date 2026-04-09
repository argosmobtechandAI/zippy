import React, { useState } from 'react';
import { View, Text,  ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, XCircle, AlertTriangle, CalendarOff, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function AttendanceScreen({ onBack }: { onBack?: () => void }) {
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'noshow' | null>>({
    '1': 'present',
    '2': 'noshow',
    '3': 'present',
  });

  const [activeTab, setActiveTab] = useState("Attendance");

  const riders = [
    {
      id: '1',
      name: 'Alex Rivers',
      horse: 'Starlight',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: '2',
      name: 'Jamie Smith',
      horse: 'Thunder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
    {
      id: '3',
      name: 'Sarah Chen',
      horse: 'Eclipse',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
    },
  ];

  const sessions = [
    {
      id: '1',
      title: 'Advanced Show Jumping',
      level: 'ADVANCED',
      time: 'Today, 10:00 AM - 11:30 AM',
      location: 'Main Arena - Zone B',
      image: 'https://images.unsplash.com/photo-1594911874499-28c0c4a4f896?q=80&w=600&auto=format&fit=crop',
      riders: riders,
    },
    {
      id: '2',
      title: 'Dressage Basics',
      level: 'BEGINNER',
      time: 'Today, 02:00 PM - 03:00 PM',
      location: 'Training Paddock',
      image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=600&auto=format&fit=crop',
      riders: [riders[0], riders[2]],
    },
    {
      id: '3',
      title: 'Trail Ride',
      level: 'INTERMEDIATE',
      time: 'Today, 04:00 PM - 05:30 PM',
      location: 'Forest Trail',
      image: 'https://images.unsplash.com/photo-1553026131-ab106511fa48?q=80&w=600&auto=format&fit=crop',
      riders: [riders[1]],
    }
  ];

  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0].id);
  const currentSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  const handleAttendance = (id: string, status: 'present' | 'noshow') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      {/* Custom Header */}
      <View className="flex-row items-center justify-start px-4 py-4 mb-2">
        <TouchableOpacity onPress={onBack} className="p-2">
           <ArrowLeft color="#8C4A28" size={24} />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-[#1a202c]">Session Attendance</Text>
      
      </View>

      <View className="flex-row border-b border-[#e2e8f0] mb-6">
         <TouchableOpacity 
           className={`flex-1 items-center pb-3 ${activeTab === 'Attendance' ? 'border-b-2 border-[#1a202c]' : ''}`}
           onPress={() => setActiveTab('Attendance')}
         >
           <Text className={`font-bold ${activeTab === 'Attendance' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
             Attendance
           </Text>
         </TouchableOpacity>
         <TouchableOpacity 
           className={`flex-1 items-center pb-3 ${activeTab === 'Leave Requests' ? 'border-b-2 border-[#1a202c]' : ''}`}
           onPress={() => setActiveTab('Leave Requests')}
         >
           <Text className={`font-bold ${activeTab === 'Leave Requests' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
             Leave Requests
           </Text>
         </TouchableOpacity>
         <TouchableOpacity 
           className={`flex-1 items-center pb-3 ${activeTab === 'Apply Leave' ? 'border-b-2 border-[#1a202c]' : ''}`}
           onPress={() => setActiveTab('Apply Leave')}
         >
           <Text className={`font-bold ${activeTab === 'Apply Leave' ? 'text-[#1a202c]' : 'text-[#64748b]'}`}>
             Apply Leave
           </Text>
         </TouchableOpacity>
      </View>

      {activeTab === "Attendance" && <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Session Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
           {sessions.map(session => (
              <TouchableOpacity
                 key={session.id}
                 onPress={() => setSelectedSessionId(session.id)}
                 className={`mr-3 px-4 py-3 rounded-2xl border ${
                    selectedSessionId === session.id ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2e8f0]'
                 }`}
              >
                 <Text className={`font-bold ${selectedSessionId === session.id ? 'text-white' : 'text-[#1a202c]'}`}>
                    {session.time.split(',')[1].split('-')[0].trim()}
                 </Text>
                 <Text className={`text-xs mt-1 ${selectedSessionId === session.id ? 'text-[#e6d0b3]' : 'text-[#64748b]'}`}>
                    {session.title}
                 </Text>
              </TouchableOpacity>
           ))}
        </ScrollView>

        {/* Session Details Card */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-6">
           <View className="flex-row items-center mb-3">
              <View className="bg-[#facc15]/20 px-2 py-1 rounded">
                 <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest">{currentSession.level}</Text>
              </View>
              <Text className="text-[#94a3b8] text-[10px] font-bold ml-2">SESSION DETAILS</Text>
           </View>
           <Text className="text-[#1a202c] text-xl font-bold mb-3">{currentSession.title}</Text>
           
           <View className="flex-row items-center mb-2">
              <View className="w-5 items-center mr-1">
                 <Clock color="#64748b" size={14} />
              </View>
              <Text className="text-[#64748b] text-sm">{currentSession.time}</Text>
           </View>
           <View className="flex-row items-center mb-4">
              <View className="w-5 items-center mr-1">
                 <MapPin color="#64748b" size={14} />
              </View>
              <Text className="text-[#64748b] text-sm">{currentSession.location}</Text>
           </View>

           <Image 
             source={{ uri: currentSession.image }} 
             className="w-full h-40 rounded-xl"
           />
        </View>

        {/* Rider List */}
        <View className="flex-row justify-between items-center mb-4">
           <Text className="text-lg font-bold text-[#1a202c]">Rider List</Text>
           <Text className="text-[#64748b] text-sm font-semibold">{currentSession.riders.length} Registered</Text>
        </View>

        <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
           {currentSession.riders.map((rider, index) => (
             <View key={rider.id} className={`flex-row items-center py-4 ${index !== currentSession.riders.length - 1 ? 'border-b border-[#e2e8f0]' : ''}`}>
               <Image source={{ uri: rider.image }} className="w-12 h-12 rounded-full mr-3" />
               <View className="flex-1">
                  <Text className="text-[#1a202c] font-bold text-[15px] mb-0.5">{rider.name}</Text>
                  <Text className="text-[#94a3b8] text-xs font-semibold">
                    Horse: <Text className="text-[#8C4A28]">{rider.horse}</Text>
                  </Text>
               </View>
               <View className="flex-row gap-2">
                 <TouchableOpacity 
                    className={`px-4 py-2 rounded-lg items-center justify-center border ${
                      attendance[rider.id] === 'present' 
                        ? 'bg-[#8C4A28] border-[#8C4A28]' 
                        : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                    onPress={() => handleAttendance(rider.id, 'present')}
                 >
                    <Text className={`text-xs font-bold ${
                      attendance[rider.id] === 'present' ? 'text-white' : 'text-[#64748b]'
                    }`}>Present</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    className={`px-4 py-2 rounded-lg items-center justify-center border ${
                      attendance[rider.id] === 'noshow' 
                        ? 'bg-red-500 border-red-500' 
                        : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}
                    onPress={() => handleAttendance(rider.id, 'noshow')}
                 >
                    <Text className={`text-xs font-bold ${
                      attendance[rider.id] === 'noshow' ? 'text-white' : 'text-[#64748b]'
                    }`}>No-Show</Text>
                 </TouchableOpacity>
               </View>
             </View>
           ))}
        </View>

        {/* Trainer Remarks */}
        <View className="mb-4">
           <Text className="text-lg font-bold text-[#1a202c] mb-4">Trainer Remarks</Text>
           
           <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
              <TextInput 
                 className="text-[#1a202c] min-h-[80px]"
                 placeholder="Enter session notes, performance feedback, or incidents..."
                 placeholderTextColor="#94a3b8"
                 multiline
                 textAlignVertical="top"
              />
           </View>

           <View className="flex-row flex-wrap mb-8">
              <View className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mr-2 mb-2">
                 <Text className="text-[#64748b] text-xs font-semibold">Good Progress</Text>
              </View>
              <View className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mr-2 mb-2">
                 <Text className="text-[#64748b] text-xs font-semibold">Needs Drill Practice</Text>
              </View>
              <View className="bg-white border border-[#e2e8f0] rounded-full px-4 py-2 mb-2">
                 <Text className="text-[#64748b] text-xs font-semibold">Equipment Check Required</Text>
              </View>
           </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-3">
           <CheckCircle2 color="white" size={20} className="mr-2" />
           <Text className="text-white font-bold text-lg">Complete & Save Session</Text>
        </TouchableOpacity>
        
        <Text className="text-center text-[#94a3b8] text-xs font-semibold mb-6">
           Saving will notify riders and update their training logs.
        </Text>

      </ScrollView>}


      {activeTab === "Apply Leave" && 
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity className="bg-[#8C4A28] flex-row justify-center items-center py-4 rounded-xl mb-6 shadow-sm">
              <CalendarRange color="white" size={20} className="mr-2" />
              <Text className="text-white font-bold text-lg">Request New Leave</Text>
          </TouchableOpacity>

          <Text className="text-lg font-bold text-[#1a202c] mb-4">Pending Requests</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-8 mt-1">
              <View className="flex-row justify-between items-start mb-3">
                 <View>
                    <Text className="text-[#1a202c] font-bold text-lg mb-1">Annual Vacation</Text>
                    <Text className="text-[#64748b] text-xs font-semibold">Nov 20, 2026 - Nov 25, 2026</Text>
                 </View>
                 <View className="bg-[#fef08a]/40 px-3 py-1.5 rounded-lg border border-[#fef08a]">
                    <Text className="text-[#ca8a04] text-[10px] font-bold tracking-wider">PENDING</Text>
                 </View>
              </View>
              <Text className="text-[#94a3b8] text-xs">Submitted on Oct 15, 2026</Text>
          </View>

          <Text className="text-lg font-bold text-[#1a202c] mb-4">Past Leaves</Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0] mb-4 mt-1">
              <View className="flex-row justify-between items-start mb-2">
                 <View>
                    <Text className="text-[#1a202c] font-bold text-lg mb-1">Medical Leave</Text>
                    <Text className="text-[#64748b] text-xs font-semibold">Sep 10, 2026</Text>
                 </View>
                 <View className="bg-[#f0fff4] px-3 py-1.5 rounded-lg border border-[#c6f6d5]">
                    <Text className="text-[#16a34a] text-[10px] font-bold tracking-wider">APPROVED</Text>
                 </View>
              </View>
          </View>
          
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-[#e2e8f0]">
              <View className="flex-row justify-between items-start mb-2">
                 <View>
                    <Text className="text-[#1a202c] font-bold text-lg mb-1">Personal Day</Text>
                    <Text className="text-[#64748b] text-xs font-semibold">Aug 05, 2026</Text>
                 </View>
                 <View className="bg-[#f0fff4] px-3 py-1.5 rounded-lg border border-[#c6f6d5]">
                    <Text className="text-[#16a34a] text-[10px] font-bold tracking-wider">APPROVED</Text>
                 </View>
              </View>
          </View>
      </ScrollView>
      }

      {activeTab === "Leave Requests" && 
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
         <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-[#1a202c]">Pending Requests</Text>
            <View className="bg-[#8C4A28] px-3 py-1.5 rounded-lg">
               <Text className="text-white text-[10px] font-bold">2 Actionable</Text>
            </View>
         </View>

         {/* Request 1 */}
         <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-4">
            <View className="flex-row justify-between mb-4">
               <View className="flex-1">
                  <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-2">NOV 10 - NOV 12</Text>
                  <Text className="text-[#1a202c] font-bold text-lg mb-1">Emma Wilson</Text>
                  <Text className="text-[#64748b] text-xs font-semibold mb-2">Reason: Family Vacation</Text>
               </View>
               <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }}
                  className="w-16 h-16 rounded-full ml-3"
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

         {/* Request 2 */}
         <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0] mb-8">
            <View className="flex-row justify-between mb-4">
               <View className="flex-1">
                  <Text className="text-[#8C4A28] text-[10px] font-bold tracking-widest mb-2">NOV 15 (Single Day)</Text>
                  <Text className="text-[#1a202c] font-bold text-lg mb-1">Leo Carter</Text>
                  <Text className="text-[#64748b] text-xs font-semibold mb-2">Reason: Medical Appointment</Text>
               </View>
               <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }}
                  className="w-16 h-16 rounded-full ml-3"
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

         <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-[#1a202c]">Recently Processed</Text>
         </View>

         {/* Processed Request */}
         <View className="bg-white rounded-3xl p-4 shadow-sm border border-[#e2e8f0]">
            <View className="flex-row justify-between mb-2">
               <View className="flex-1">
                  <Text className="text-[#1a202c] font-bold text-base mb-1">Sarah Chen</Text>
                  <Text className="text-[#64748b] text-xs font-semibold">NOV 05 - NOV 06 • School Exams</Text>
               </View>
               <View className="bg-[#f0fff4] px-3 py-1.5 rounded-lg border border-[#c6f6d5] self-start">
                  <Text className="text-[#16a34a] text-[10px] font-bold tracking-wider">APPROVED</Text>
               </View>
            </View>
         </View>
      </ScrollView>
      }

    </View>
  );
}
