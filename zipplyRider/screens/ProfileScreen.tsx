import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ArrowLeft, ArrowRight, User, Users, Clipboard, Flag, Smile, Activity, Zap, Star } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from "react-native-toast-message"


export default function ProfileScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date())
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "", type: "rider", dob: "", age: "", weight: 0, parent_name: "", emergency_contact: "", allergies: "", medical: "", level: "Novice", instructions: "" })
  const [dateTimePicker, setDateTimePicker] = useState(false)


  const getExperienceIcon = (level: string, active: boolean) => {
    const color = active ? '#8C4A28' : '#64748b';
    switch (level) {
      case 'Novice': return <Smile color={color} size={24} />;
      case 'Beginner': return <Activity color={color} size={24} />;
      case 'Intermediate': return <Zap color={color} size={24} />;
      case 'Advanced': return <Star color={color} size={24} />;
      default: return <Smile color={color} size={24} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const onChange = (event, selectedDate) => {
    console.log(selectedDate)
    if (selectedDate) {
      setDate(selectedDate);
      setFormData((prev) => ({ ...prev, dob: formatDate(selectedDate) }))
      setDateTimePicker(false)
    }
  };




  const handleSubmit = () => {
    if (!formData.name || !formData.mobile || !formData.email || !formData.dob || !formData.age || !formData.weight || !formData.parent_name || !formData.emergency_contact || !formData.allergies || !formData.medical || !formData.level || !formData.instructions) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all the fields"
      })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email is not valid"
      })
      return
    }
    navigation.navigate("declaration", { formData })
  }


  return (
    <SafeAreaView className="flex-1 bg-[#F5EDDF]">


      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View className="mr-4">
              <ArrowLeft color="#8C4A28" size={24} />
            </View>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#1a202c] mt-1">Complete Rider Profile</Text>
        </View>

        <View className="flex-row justify-between mb-2">
          <Text className="text-[#8C4A28] font-bold text-[10px] uppercase">
            Step 1 of 3: Personal{'\n'}Details
          </Text>
          <Text className="text-[#8C4A28] font-bold text-[10px] text-right">
            33%{'\n'}Complete
          </Text>
        </View>
        <View className="w-full h-1 bg-[#e2d5c3] rounded-full mt-1">
          <View className="w-1/3 h-1 bg-[#8C4A28] rounded-full" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Personal Information */}
        <View className="mb-8">
          <View className="flex-row items-center mb-4">
            <View className="mr-2">
              <User color="#8C4A28" size={20} />
            </View>
            <Text className="text-[#1a202c] font-bold text-lg mt-1">Personal Information</Text>
          </View>

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Full Name</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="e.g. John Doe"
            placeholderTextColor="#94a3b8"
            value={formData.name}
            onChangeText={(Text) => setFormData((prev) => ({ ...prev, name: Text }))}
          />

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Mobile Number</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="Ex: 1234567890"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={formData.mobile}
            onChangeText={(Text) => {
              if (Text.length > 10) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Mobile number should be 10 digits"
                })
                return
              }
              if (!/^[0-9]+$/.test(Text)) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Mobile number should be only digits"
                })
                return
              }
              setFormData((prev) => ({ ...prev, mobile: Text }))
            }}
          />

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Email address</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="Ex: email@abc.com"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(Text) => {
              setFormData((prev) => ({ ...prev, email: Text }))
            }}
          />

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Date of Birth</Text>
          <TouchableOpacity
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            onPress={() => setDateTimePicker(true)}
          >
            <Text className={`${formData.dob ? "text-[#000]" : "text-[#94a3b8]"}  font-semibold`}>{formData.dob || "Please Choose"}</Text>
          </TouchableOpacity>

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Age</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="Years"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={formData.age}
            onChangeText={(Text) => {
              if (!/^[0-9]+$/.test(Text)) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Age should be only digits"
                })
                return
              }
              setFormData((prev) => ({ ...prev, age: Text }))
            }}
          />

          <Text className="text-[#1a202c] font-semibold text-xs mb-1">Weight (kg)</Text>
          <TextInput
            className="bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="0.0"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={formData.weight}
            onChangeText={Text => {
              if (!/^[0-9]+$/.test(Text)) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Weight should be only digits"
                })
                return
              }
              setFormData((prev) => ({ ...prev, weight: Text }))
            }}
          />
        </View>

        {dateTimePicker &&

          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={onChange}
          />
        }



        {/* Guardianship & Safety */}
        <View className="mb-8 items-start">
          <View className="flex-row items-center mb-4">
            <View className="mr-2">
              <Users color="#8C4A28" size={20} />
            </View>
            <Text className="text-[#1a202c] font-bold text-lg mt-1">Guardianship & Safety</Text>
          </View>

          <Text className="text-[#1a202c] w-full font-semibold text-xs mb-1">Parent/Guardian Name</Text>
          <TextInput
            className="w-full bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="Full name of guardian"
            placeholderTextColor="#94a3b8"
            value={formData.parent_name}
            onChangeText={(Text) => setFormData((prev) => ({ ...prev, parent_name: Text }))}
          />

          <Text className="text-[#1a202c] w-full font-semibold text-xs mb-1">Emergency Contact</Text>
          <TextInput
            className="w-full bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b]"
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={formData.emergency_contact}
            onChangeText={(Text) => {
              if (!/^[0-9]+$/.test(Text)) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Emergency contact should be only digits"
                })
                return
              }
              if (Text.length > 10) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Emergency contact should be 10 digits"
                })
                return
              }
              setFormData((prev) => ({ ...prev, emergency_contact: Text }))
            }}
          />
        </View>

        {/* Health Records */}
        <View className="mb-8 items-start">
          <View className="flex-row items-center mb-4">
            <View className="mr-2">
              <Clipboard color="#8C4A28" size={20} />
            </View>
            <Text className="text-[#1a202c] font-bold text-lg mt-1">Health Records</Text>
          </View>

          <Text className="text-[#1a202c] w-full font-semibold text-xs mb-1">Medical Conditions</Text>
          <TextInput
            className="w-full bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b] h-24"
            placeholder="List any chronic conditions or previous injuries..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={formData.medical}
            onChangeText={(Text) => setFormData((prev) => ({ ...prev, medical: Text }))}
          />

          <Text className="text-[#1a202c] w-full font-semibold text-xs mb-1">Allergies</Text>
          <TextInput
            className="w-full bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-4 text-[#1e293b] h-24"
            placeholder="Food, medicine, or environmental allergies..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={formData.allergies}
            onChangeText={(Text) => setFormData((prev) => ({ ...prev, allergies: Text }))}
          />
        </View>

        {/* Experience & Safety */}
        <View className="mb-8 items-start">
          <View className="flex-row items-center mb-4">
            <View className="mr-2">
              <Flag color="#8C4A28" size={20} />
            </View>
            <Text className="text-[#1a202c] font-bold text-lg mt-1">Experience & Safety</Text>
          </View>

          <Text className="text-[#1a202c] font-semibold text-xs mb-2">Riding Experience Level</Text>
          <View className="flex-row flex-wrap justify-between mb-4 w-full">
            {['Novice', 'Beginner', 'Intermediate', 'Advanced'].map((level) => {
              const isActive = formData?.level === level;
              return (
                <TouchableOpacity
                  key={level}
                  onPress={() => setFormData((prev) => ({ ...prev, level: level }))}
                  className={`w-[48%] py-4 rounded-xl items-center border mb-3 ${isActive ? 'bg-[#faeadd] border-[#8C4A28]' : 'bg-white border-[#e2d5c3]'}`}
                >
                  <View className="mb-2">
                    {getExperienceIcon(level, isActive)}
                  </View>
                  <Text className={`text-[10px] font-bold uppercase ${isActive ? 'text-[#8C4A28]' : 'text-[#64748b]'}`}>
                    {level}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          <Text className="text-[#1a202c] w-full font-semibold text-xs mb-1">Special Safety Instructions</Text>
          <TextInput
            className="w-full bg-white border border-[#e2d5c3] rounded-xl px-4 py-3 mb-8 text-[#1e293b] h-24"
            placeholder="Any specific instructions for instructors..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={formData.instructions}
            onChangeText={(Text) => setFormData((prev) => ({ ...prev, instructions: Text }))}
          />
        </View>

        <TouchableOpacity
          className="w-full bg-[#8C4A28] py-4 rounded-xl items-center flex-row justify-center mb-4 shadow"
          onPress={handleSubmit}
        >
          <Text className="text-white font-bold text-lg mr-2">Continue to Agreement</Text>
          <ArrowRight color="white" size={20} />
        </TouchableOpacity>

        <Text className="text-center text-[#64748b] text-xs">
          Step 1 of 3: You can edit these details later.
        </Text>
      </ScrollView>




    </SafeAreaView>

  )



}
