import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldAlert, Stethoscope, BarChart3, User, Horse as HorseIcon } from 'lucide-react-native';
import HomeScreen from './HomeScreen';
import HorsesScreen from './HorsesScreen';
import HealthScreen from './HealthScreen';
import RecordsScreen from './RecordsScreen';
import ProfileScreen from './ProfileScreen';

export default function MainTabs({ onNavigateGlobal }: { onNavigateGlobal: (screen: string) => void }) {
  const [activeTab, setActiveTab] = useState('Horses');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Horses':
        return <HorsesScreen />;
      case 'Health':
        return <HealthScreen />;
      case 'Training':
        return <RecordsScreen />; // Mapping Records to Training for now
      case 'Profile':
        return <ProfileScreen />;
      default:
        return <HorsesScreen />;
    }
  };

  const tabs = [
    { id: 'Horses', icon: HorseIcon, label: 'HORSES' },
    { id: 'Health', icon: Stethoscope, label: 'HEALTH' },
    { id: 'Training', icon: BarChart3, label: 'TRAINING' },
    { id: 'Profile', icon: User, label: 'PROFILE' },
  ];

  return (
    <View className="flex-1 bg-[#FDF5EA]">
      <View className="flex-1">
        {renderScreen()}
      </View>

      {/* Custom Bottom Tab Bar */}
      <View className="bg-white/80 backdrop-blur-md flex-row justify-around items-center pt-3 pb-8 border-t border-[#8C4A28]/10 shadow-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.7}
              className="items-center justify-center w-[22%]"
              onPress={() => setActiveTab(tab.id)}
            >
              <View className={`mb-1.5 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-40'}`}>
                <IconComponent color={isActive ? '#8C4A28' : '#64748b'} size={24} strokeWidth={isActive ? 2.5 : 2} />
              </View>
              <Text
                className={`text-[9px] font-black tracking-[1.5px] ${
                  isActive ? 'text-[#8C4A28]' : 'text-[#64748b] opacity-40'
                }`}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View className="absolute -bottom-1 w-1 h-1 bg-[#8C4A28] rounded-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
