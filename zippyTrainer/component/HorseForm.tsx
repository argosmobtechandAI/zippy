import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Camera } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { createHorseApi, updateHorseApi, updateUserApi } from '../api/api';

export default function HorseForm({ horse, user, onClose }: { horse: any, user: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: horse?.name || '',
    title: horse?.title || '',
    age: horse?.age ? String(horse.age) : '',
    weight: horse?.weight ? String(horse.weight) : '',
    imageUrl: horse?.imageUrl || '',
    location: horse?.location || 'Lexington Stables',
  });

  const handleSave = async () => {
    if (!form.name || !form.title) {
      Alert.alert("Required", "Please provide a name and breed.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...form,
        age: parseInt(form.age) || 0,
        weight: parseInt(form.weight) || 500,
        healthStatus: horse?.healthStatus || [],
        vaccinationRecords: horse?.vaccinationRecords || []
      };

      let res;
      if (horse) {
        res = await apiFunction(`${updateHorseApi}/${horse.id}`, [], data, "PUT", true);
      } else {
        res = await apiFunction(createHorseApi, [], data, "POST", true);
        if (res && res.success && res.horse?.id && user?.id) {
          await apiFunction(`${updateUserApi}/${user.id}`, [], { addHorseId: res.horse.id }, "PUT", true);
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsed = JSON.parse(userData);
            parsed.horseId = [...(parsed.horseId || []), res.horse.id];
            await AsyncStorage.setItem('user', JSON.stringify(parsed));
          }
        }
      }

      if (res && res.success) {
        Alert.alert("Success", horse ? "Horse details updated." : "New horse registered and assigned to you!");
        onClose();
      } else {
        Alert.alert("Error", res?.message || "Something went wrong.");
      }
    } catch (e) {
      Alert.alert("Error", "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, value: string, key: string, placeholder: string, keyboardType: any = 'default') => (
    <View className="mb-4">
      <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 ml-1">{label}</Text>
      <TextInput
        className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4 font-bold text-[#1a202c]"
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={(text) => setForm(prev => ({ ...prev, [key]: text }))}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <View className="pb-10">
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-white rounded-[2rem] border-2 border-[#8C4A28]/20 items-center justify-center overflow-hidden">
           {form.imageUrl ? (
             <Image source={{ uri: form.imageUrl }} className="w-full h-full" />
           ) : (
             <Camera color="#8C4A28" size={32} opacity={0.3} />
           )}
        </View>
        <Text className="mt-3 text-[#8C4A28] font-bold text-xs uppercase tracking-widest">Biological Profile</Text>
      </View>

      {renderInput("Name", form.name, "name", "e.g. Thunder")}
      {renderInput("Breed / Type", form.title, "title", "e.g. Arabian Gelding")}
      {renderInput("Image URL", form.imageUrl, "imageUrl", "Paste public image link...")}
      
      <View className="flex-row">
        <View className="flex-1 mr-2">
          {renderInput("Age", form.age, "age", "5", "numeric")}
        </View>
        <View className="flex-1 ml-2">
          {renderInput("Weight (KG)", form.weight, "weight", "500", "numeric")}
        </View>
      </View>

      <TouchableOpacity 
        disabled={loading}
        onPress={handleSave}
        className={`w-full py-5 rounded-[2rem] items-center shadow-xl shadow-[#8C4A28]/30 mt-6 ${loading ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black uppercase tracking-widest text-lg">
            {horse ? 'Update Bio' : 'Register Entry'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
