import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import { Camera, Calendar, Dumbbell, Activity, HeartPulse, ChevronDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apiFunction';
import { createHorseApi, updateHorseApi, updateUserApi, getAllStablesApi } from '../api/api';
import RNDateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = ["Show Jumping", "Beginner Friendly", "Dressage", "Eventing", "Training Only"];
const STATUSES = ["Available", "Resting", "Competition", "Medical", "Training"];

export default function HorseForm({ horse, user, onClose }: { horse: any, user: any, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [stables, setStables] = useState<any[]>([]);
  const [showStablesDropdown, setShowStablesDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? new Date() : new Date(parsed);
  };

  useEffect(() => {
    const fetchStables = async () => {
      try {
        const res = await apiFunction(getAllStablesApi, [], {}, "GET", true);
        if (res && res.success) {
          setStables(res.stables || []);
        }
      } catch (err) {
        console.error("Fetch stables error:", err);
      }
    };
    fetchStables();
  }, []);

  const [form, setForm] = useState({
    name: horse?.name || '',
    title: horse?.title || '',
    age: horse?.age ? String(horse.age) : '',
    weight: horse?.weight ? String(horse.weight) : '',
    speed: horse?.speed ? String(horse.speed) : '',
    imageUrl: horse?.imageUrl || '',
    location: horse?.location || 'Lexington Stables',
    status: horse?.status || 'Available',
    diet: horse?.diet || 'Standard Alfalfa Mix',
    shoeStatus: horse?.shoeStatus || 'Regular',
    lastVisit: horse?.lastVisit || '',
    vaccinationSummary: horse?.vaccinationSummary || '',
    dewormingRecord: horse?.dewormingRecord || '',
    shoeingRemarks: horse?.shoeingRemarks || '',
    healthRemarks: horse?.healthRemarks || '',
  });

  const handleSave = async () => {
    if (!form.name) {
      Alert.alert("Required", "Please provide a name.");
      return;
    }
    if (!form.title) {
      Alert.alert("Required", "Please select a category.");
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...form,
        age: parseInt(form.age) || 0,
        weight: parseInt(form.weight) || 500,
        speed: parseInt(form.speed) || 40,
        trainerId: horse?.trainerId || user?.id || null,
        healthStatus: horse?.healthStatus || [],
        vaccinationRecords: horse?.vaccinationRecords || []
      };

      let res;
      if (horse) {
        res = await apiFunction(`${updateHorseApi}/${horse.id}`, [], data, "PUT", true);
      } else {
        res = await apiFunction(createHorseApi, [], data, "POST", true);
        if (res && res.success && res.horse?.id && user?.id) {
          // Assign to this trainer in users DB
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
        Alert.alert("Success", horse ? "Horse details updated." : "New horse registered successfully!");
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

  const renderInput = (label: string, value: string, key: string, placeholder: string, keyboardType: any = 'default', isMultiline = false) => (
    <View className="mb-4">
      <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 ml-1">{label}</Text>
      <TextInput
        className={`bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4 font-bold text-[#1a202c] ${isMultiline ? 'h-24' : ''}`}
        placeholder={placeholder}
        placeholderTextColor="#cbd5e1"
        value={value}
        onChangeText={(text) => setForm(prev => ({ ...prev, [key]: text }))}
        keyboardType={keyboardType}
        multiline={isMultiline}
        textAlignVertical={isMultiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <View className="pb-10">
      {/* Visual Image Banner & Pick */}
      <View className="items-center mb-6">
        <View className="w-28 h-28 bg-white rounded-[2.5rem] border-2 border-[#8C4A28]/20 items-center justify-center overflow-hidden shadow-sm">
           {form.imageUrl ? (
             <Image source={{ uri: form.imageUrl }} className="w-full h-full" />
           ) : (
             <Camera color="#8C4A28" size={32} opacity={0.3} />
           )}
        </View>
        <Text className="mt-3 text-[#8C4A28] font-bold text-xs uppercase tracking-widest">Biological Profile</Text>
      </View>

      {/* SECTION 1: Bio */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <Dumbbell color="#8C4A28" size={16} className="mr-2" />
          <Text className="text-[#8C4A28] font-black text-sm uppercase tracking-wider">Basic Registry</Text>
        </View>
        
        {renderInput("Name", form.name, "name", "e.g. Thunder")}
        {renderInput("Image URL", form.imageUrl, "imageUrl", "Paste public image link...")}
        <View className="mb-4">
          <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 ml-1">Stable Location</Text>
          <TouchableOpacity
            onPress={() => setShowStablesDropdown(!showStablesDropdown)}
            className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4 flex-row justify-between items-center"
          >
            <Text className="font-bold text-[#1a202c]">{form.location || 'Select Stable...'}</Text>
            <ChevronDown color="#8C4A28" size={16} />
          </TouchableOpacity>
          
          {showStablesDropdown && (
            <View className="mt-2 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-lg max-h-40">
              <ScrollView nestedScrollEnabled={true}>
                {stables.length === 0 ? (
                  <View className="px-5 py-4">
                    <Text className="text-gray-400 font-bold italic">No stables found</Text>
                  </View>
                ) : (
                  stables.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => {
                        setForm(prev => ({ ...prev, location: s.name }));
                        setShowStablesDropdown(false);
                      }}
                      className="px-5 py-4 border-b border-[#f1f5f9] active:bg-gray-100"
                    >
                      <Text className="font-bold text-[#1a202c]">{s.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* SECTION 2: Category Selector */}
      <View className="mb-6">
        <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2 ml-1">Category / Discipline</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
          {CATEGORIES.map(cat => {
            const isSelected = form.title === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm(prev => ({ ...prev, title: cat }))}
                className={`mr-2 px-4 py-3 rounded-full border ${isSelected ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2e8f0]'}`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#64748b]'}`}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* SECTION 3: Status Selector */}
      <View className="mb-6">
        <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-2 ml-1">Current Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
          {STATUSES.map(stat => {
            const isSelected = form.status === stat;
            return (
              <TouchableOpacity
                key={stat}
                onPress={() => setForm(prev => ({ ...prev, status: stat }))}
                className={`mr-2 px-4 py-3 rounded-full border ${isSelected ? 'bg-[#8C4A28] border-[#8C4A28]' : 'bg-white border-[#e2e8f0]'}`}
              >
                <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#64748b]'}`}>{stat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Numerical Stats */}
      <View className="flex-row mb-6">
        <View className="flex-1 mr-1">
          {renderInput("Age (Yrs)", form.age, "age", "5", "numeric")}
        </View>
        <View className="flex-1 mx-1">
          {renderInput("Weight (Kg)", form.weight, "weight", "500", "numeric")}
        </View>
        <View className="flex-1 ml-1">
          {renderInput("Speed (Km/h)", form.speed, "speed", "40", "numeric")}
        </View>
      </View>

      {/* SECTION 4: Dietary & Shoeing */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <Activity color="#8C4A28" size={16} className="mr-2" />
          <Text className="text-[#8C4A28] font-black text-sm uppercase tracking-wider">Diet & Gear</Text>
        </View>

        {renderInput("Dietary Plan", form.diet, "diet", "e.g. Alfalfa Mix + High Protein")}
        {renderInput("Shoeing Type", form.shoeStatus, "shoeStatus", "e.g. Aluminum Racing Shoes")}
      </View>

      {/* SECTION 5: Health Profile */}
      <View className="mb-6">
        <View className="flex-row items-center mb-4">
          <HeartPulse color="#8C4A28" size={16} className="mr-2" />
          <Text className="text-[#8C4A28] font-black text-sm uppercase tracking-wider">Health & Maintenance</Text>
        </View>

        <View className="mb-4">
          <Text className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mb-1.5 ml-1">Last Shoeing Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-white border border-[#e2e8f0] rounded-2xl px-5 py-4 flex-row justify-between items-center"
          >
            <Text className={`font-bold ${form.lastVisit ? 'text-[#1a202c]' : 'text-[#cbd5e1]'}`}>
              {form.lastVisit || 'YYYY-MM-DD'}
            </Text>
            <Calendar color="#8C4A28" size={16} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <RNDateTimePicker
            value={getSafeDate(form.lastVisit)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const formatted = selectedDate.toISOString().split('T')[0];
                setForm(prev => ({ ...prev, lastVisit: formatted }));
              }
            }}
          />
        )}
        {renderInput("Vaccination Record", form.vaccinationSummary, "vaccinationSummary", "e.g. Influenza Boost (Jan 2024)")}
        {renderInput("Deworming Record", form.dewormingRecord, "dewormingRecord", "e.g. Quest Gel (Mar 2024)")}
        
        {renderInput("Shoeing Remarks", form.shoeingRemarks, "shoeingRemarks", "Notes about gait or shoe configurations...", 'default', true)}
        {renderInput("General Health Remarks", form.healthRemarks, "healthRemarks", "Allergies, temperament, or chronic conditions...", 'default', true)}
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        disabled={loading}
        onPress={handleSave}
        className={`w-full py-4 rounded-2xl items-center shadow-lg mt-8 mb-12 ${loading ? 'bg-[#94a3b8]' : 'bg-[#8C4A28]'}`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-black uppercase tracking-widest text-[16px]">
            {horse ? 'Update Registry' : 'Save Registration'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
