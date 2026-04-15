import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, Filter, Plus, Edit, Trash2, X, ChevronRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { getAllHorsesApi, deleteHorseApi } from '../api/api';
import HorseForm from '../component/HorseForm';
import { RefreshControl } from 'react-native';

export default function HorsesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [horses, setHorses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [horseToEdit, setHorseToEdit] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchHorses();
  }, []);

  const fetchHorses = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const userData = await AsyncStorage.getItem('user');
      const parsedUser = userData ? JSON.parse(userData) : null;
      setUser(parsedUser);

      const res = await apiFunction(getAllHorsesApi, [], {}, "GET", true);
      if (res && res.success) {
        const allHorses = res.horses || [];
        // Filter horses assigned to this trainer via direct trainerId link
        const filtered = allHorses.filter((h: any) => h.trainerId === parsedUser?.id);
        setHorses(filtered);
      }
    } catch (error) {
      console.error("Fetch trainer horses error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Horse",
      "Are you sure you want to remove this horse from the registry?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiFunction(`${deleteHorseApi}/${id}`, [], {}, "DELETE", true);
              if (res && res.success) {
                fetchHorses();
              }
            } catch (e) {
              Alert.alert("Error", "Failed to delete horse.");
            }
          }
        }
      ]
    );
  };

  const filteredHorses = horses.filter(h => 
    h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#F5EDDF]">
      <View className="px-4 py-4 mb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-[#1a202c]">My Horses</Text>
          <Text className="text-xs font-semibold text-[#64748b]">{horses.length} Stable Residents</Text>
        </View>
        <TouchableOpacity 
          onPress={() => { setHorseToEdit(null); setShowModal(true); }}
          className="bg-[#8C4A28] w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-[#8C4A28]/40"
        >
          <Plus color="white" size={24} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <View className="px-4 flex-row items-center mb-6">
        <View className="flex-1 flex-row items-center bg-white border border-[#e2e8f0] rounded-2xl px-4 py-3 mr-3 shadow-sm">
          <Search color="#94a3b8" size={20} className="mr-2" />
          <TextInput 
            className="flex-1 text-[#1a202c] font-semibold"
            placeholder="Search your fleet..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity className="bg-white border border-[#e2e8f0] p-3.5 rounded-2xl shadow-sm">
          <Filter color="#8C4A28" size={20} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#8C4A28" />
            <Text className="mt-4 text-[#8C4A28] font-bold">Accessing Stables...</Text>
        </View>
      ) : (
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchHorses(true)} colors={["#8C4A28"]} />
        }
      >
        <View className="flex-row flex-wrap justify-between">
          {filteredHorses.length === 0 ? (
              <View className="w-full py-20 items-center justify-center">
                  <View className="bg-white p-6 rounded-full mb-4 border border-[#e2e8f0]">
                    <Search color="#cbd5e1" size={40} />
                  </View>
                  <Text className="text-[#1a202c] font-bold text-lg">No assigned horses found</Text>
                  <Text className="text-[#64748b] text-center px-10 mt-2">You haven't been assigned any horses yet or none match your search.</Text>
              </View>
          ) : filteredHorses.map((horse) => (
            <TouchableOpacity 
              onPress={() => navigation.navigate("HorseDetail", { horse })} 
              key={horse.id} 
              activeOpacity={0.9} 
              className="bg-white rounded-[2.5rem] p-3 shadow-sm border border-[#e2e8f0] w-[48%] mb-5"
            >
              <View className="relative">
                <Image
                  source={{ uri: horse.imageUrl || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=300&auto=format&fit=crop' }}
                  className="w-full h-40 rounded-[2rem] mb-3"
                />
                <View className="absolute top-2 right-2 flex-row">
                   <TouchableOpacity 
                    onPress={() => { setHorseToEdit(horse); setShowModal(true); }}
                    className="bg-white/90 p-2 rounded-full shadow-sm mr-1"
                   >
                     <Edit color="#8C4A28" size={14} />
                   </TouchableOpacity>
                   <TouchableOpacity 
                    onPress={() => handleDelete(horse.id)}
                    className="bg-white/90 p-2 rounded-full shadow-sm"
                   >
                     <Trash2 color="#ef4444" size={14} />
                   </TouchableOpacity>
                </View>
              </View>
              
              <View className="px-1">
                <Text className="text-[#1a202c] font-bold text-base mb-1" numberOfLines={1}>{horse.name}</Text>
                <Text className="text-[#94a3b8] text-[9px] font-black tracking-widest uppercase mb-2">{horse.title || 'STANDARD BREED'}</Text>
                
                <View className="flex-row justify-between items-center pt-2 border-t border-[#f1f5f9]">
                  <View className="flex-row items-center">
                    <Text className="text-[#8C4A28] text-[10px] font-black tracking-wider">{horse.age || '?'} YRS</Text>
                  </View>
                  <ChevronRight color="#e2e8f0" size={16} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-[#F5EDDF] rounded-t-[3rem] p-6 max-h-[90%]">
             <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-2xl font-bold text-[#1a202c]">{horseToEdit ? 'Update Horse' : 'Register Horse'}</Text>
                  <Text className="text-xs font-semibold text-[#64748b]">Maintain consistent fleet records</Text>
                </View>
                <TouchableOpacity onPress={() => setShowModal(false)} className="bg-white p-2 rounded-full border border-[#e2e8f0]">
                   <X color="#1a202c" size={24} />
                </TouchableOpacity>
             </View>

             <ScrollView showsVerticalScrollIndicator={false}>
                <HorseForm horse={horseToEdit} user={user} onClose={() => { setShowModal(false); fetchHorses(); }} />
             </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
