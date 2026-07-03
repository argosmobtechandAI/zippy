import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Gavel, Calendar, CalendarClock, Ban, Clock, Wallet, ShoppingCart } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { addToCart } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFunction } from '../api/apifunction';
import { getAllPlansApi, enrollPackApi, getLevelsApi, createOrderApi, verifyRazorPayOrderApi, createLevelOrderApi, verifyLevelOrderApi } from '../api/api';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';
import { Modal } from 'react-native';

export default function CompetitiveRiderPacksScreen() {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [plans, setPlans] = useState([]);
    const [levels, setLevels] = useState([]);
    const [activeTab, setActiveTab] = useState('Membership Plan');
    const [enrolling, setEnrolling] = useState(null);
    const [levelEnrolling, setLevelEnrolling] = useState(null);
    const [pricingModalVisible, setPricingModalVisible] = useState(false);
    const [selectedLevelForPricing, setSelectedLevelForPricing] = useState(null);
    const dispatch = useDispatch();
    const cartItems: any[] = useSelector((state: any) => state.cart?.items ?? []);
    const cartCount = cartItems.length;

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchPlans(true),
            fetchLevelsData(),
            dispatch(fetchUser()),
            dispatch(fetchRider())
        ]);
        setRefreshing(false);
    }, []);
    const { user, rider } = useSelector((state: any) => state.getData);
    const walletBalance = (rider?.wallet || user?.riderWallet || 0).toLocaleString();
    const activePlanObj = rider?.plan || user?.plan;
    let activePlanName = '';
    const planEndDateStr = rider?.plan_end_date || user?.plan_end_date;
    const isPlanExpired = planEndDateStr ? new Date(planEndDateStr) < new Date() : true;

    if (!isPlanExpired) {
        if (Array.isArray(activePlanObj) && activePlanObj.length > 0) {
            activePlanName = activePlanObj[activePlanObj.length - 1].name;
        } else if (activePlanObj && typeof activePlanObj === 'object') {
            activePlanName = activePlanObj.name;
        } else if (typeof activePlanObj === 'string') {
            activePlanName = activePlanObj;
        }
    }

    const isPackActive = (packName) => {
        if (!activePlanObj || isPlanExpired) return false;
        if (Array.isArray(activePlanObj)) {
            return activePlanObj.some(p => p.name === packName);
        } else if (typeof activePlanObj === 'object') {
            return activePlanObj.name === packName;
        } else if (typeof activePlanObj === 'string') {
            return activePlanObj === packName;
        }
        return false;
    };

    useEffect(() => {
        fetchPlans();
        fetchLevelsData();
        dispatch(fetchUser());
        dispatch(fetchRider());
    }, []);

    const fetchPlans = async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        try {
            const res = await apiFunction(getAllPlansApi, [], {}, "GET", true);
            if (res && res.success) {
                setPlans(res.plans || []);
            }
        } catch (error) {
            console.error("Fetch plans error:", error);
        } finally {
            if (!isRefreshing) setLoading(false);
        }
    };

    const fetchLevelsData = async () => {
        try {
            const res = await apiFunction(getLevelsApi, [], {}, "GET", true);
            if (res && res.success) {
                setLevels(res.levels || []);
            }
        } catch (error) {
            console.error("Fetch levels error:", error);
        }
    };

    const isPackInCart = (packId: string) => cartItems.some(i => i.type === 'pack' && i.id === packId);
    const isLevelInCart = (levelId: string) => cartItems.some(i => i.type === 'level' && i.id === levelId);

    const handleEnrollment = (packId: string, name: string, amount: number, gst?: number) => {
        dispatch(addToCart({ key: 'pack', type: 'pack', id: packId, name, amount, gst }));
        Toast.show({ type: 'success', text1: 'Added to Cart', text2: name });
    };

    const handleLevelClick = (level: any) => {
        if (level.weekdays_price && level.weekend_price) {
            setSelectedLevelForPricing(level);
            setPricingModalVisible(true);
        } else if (level.monthly_price) {
            handleLevelEnrollment(level, 'monthlyPrice');
        } else {
            Toast.show({ type: 'error', text1: "No valid pricing found for this level." });
        }
    };

    const handleLevelEnrollment = (level: any, pricingOption: string) => {
        setPricingModalVisible(false);
        let amount = 0;
        if (pricingOption === 'monthlyPrice') amount = level.monthly_price;
        else if (pricingOption === 'weekdaysPrice') amount = level.weekdays_price;
        else if (pricingOption === 'weekendPrice') amount = level.weekend_price;

        dispatch(addToCart({ key: 'level', type: 'level', id: level.id, name: level.name, amount, gst: level.gst ?? undefined, pricingOption }));
        Toast.show({ type: 'success', text1: 'Added to Cart', text2: level.name });
    };

    const isEligibleForPackRenewal = (pack) => {
        if (!activePlanObj) return false;
        const sessionsCount = pack.sessionsCount || pack.sessions_count || 0;
        const currentSessions = rider?.session_count || 0;
        
        // Condition 1: 20% sessions left
        const isLowSessions = sessionsCount > 0 && currentSessions <= (0.2 * sessionsCount);
        
        // Condition 2: 10 days left
        let isExpiringSoon = false;
        if (planEndDateStr) {
            const endDate = new Date(planEndDateStr);
            const today = new Date();
            const diffTime = endDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays <= 10) {
                isExpiringSoon = true;
            }
        }
        
        return isLowSessions || isExpiringSoon;
    };

    const isEligibleForLevelRenewal = () => {
        const currentSessions = rider?.session_count || 0;
        return currentSessions <= 3;
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            <View className="px-6 pt-6 pb-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-[#1a202c] text-[24px] font-black">Programs</Text>
                    {/* Cart Icon with Badge */}
                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('Cart')}
                        className="relative w-11 h-11 rounded-full bg-[#e2d5c3] items-center justify-center"
                    >
                        <ShoppingCart size={20} color="#8C4A28" />
                        {cartCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8C4A28] items-center justify-center">
                                <Text className="text-white text-[10px] font-black">{cartCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                
                {/* Custom Tabs */}
                <View className="flex-row mt-4 bg-[#e2d5c3]/50 p-1 rounded-2xl">
                    <TouchableOpacity 
                        className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'Membership Plan' ? 'bg-white' : ''}`}
                        style={activeTab === 'Membership Plan' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 } : {}}
                        onPress={() => setActiveTab('Membership Plan')}
                    >
                        <Text className={`text-[13px] font-black ${activeTab === 'Membership Plan' ? 'text-[#8C4A28]' : 'text-gray-500'}`}>Membership Plan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'Rider Level' ? 'bg-white' : ''}`}
                        style={activeTab === 'Rider Level' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 } : {}}
                        onPress={() => setActiveTab('Rider Level')}
                    >
                        <Text className={`text-[13px] font-black ${activeTab === 'Rider Level' ? 'text-[#8C4A28]' : 'text-gray-500'}`}>Rider Level</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#8C4A28" />
                </View>
            ) : (
                <ScrollView 
                    className="flex-1 px-5" 
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8C4A28" colors={['#8C4A28']} />
                    }
                >
                    {activeTab === 'Membership Plan' ? (
                        <>
                            {/* Hero Banner */}
                            <View className="w-full h-[150px] rounded-[24px] overflow-hidden mt-3 shadow-md bg-[#8C4A28]">
                        {/* Decorative background elements */}
                        <View className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
                        <View className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full" />
                        
                        <View className="p-5 z-10 w-full h-full flex-col justify-between">
                            {/* Top Info */}
                            <View className="flex-row justify-between items-start">
                                {activePlanName ? (
                                    <View className="bg-[#4ade80] px-3 py-1.5 rounded-full shadow-sm">
                                        <Text className="text-[#064e3b] text-[10px] font-black uppercase tracking-widest">{activePlanName} Active</Text>
                                    </View>
                                ) : (
                                    <View />
                                )}
                                <View className="bg-white/20 px-4 py-1.5 rounded-full flex-row items-center border border-white/20">
                                    <Wallet color="#fff" size={14} />
                                    <Text className="text-white text-xs font-black ml-2 tracking-wide">₹{walletBalance}</Text>
                                </View>
                            </View>
                            
                            {/* Bottom Text */}
                            <View>
                                <Text className="text-white text-[26px] font-black mb-1 tracking-wider">Zippy Equestrian</Text>
                                <Text className="text-white/80 text-[12px] font-bold tracking-wide">Master the art of competitive riding</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section Title */}
                    <View className="mt-6 mb-4">
                        <Text className="text-[#1a202c] text-lg font-black mb-[2px]">Select Your Pack</Text>
                        <Text className="text-[#64748b] text-[11px] font-semibold">Monthly subscription plans for every level</Text>
                    </View>

                    {/* Packs List */}
                    <View className="pb-4">
                        {plans.length === 0 ? (
                            <View className="py-10 items-center">
                                <Text className="text-[#64748b] font-bold">No active packs available.</Text>
                            </View>
                        ) : plans.map((pack) => {
                            const isActive = isPackActive(pack.name);
                            const sessionsCount = pack.sessionsCount || pack.sessions_count || 0;
                            return (
                            <View
                                key={pack.id}
                                className={`bg-white rounded-[20px] p-5 mb-4 shadow-sm border ${isActive ? 'border-[#4ade80] border-2 bg-[#f0fdf4]' : pack.level === 'Intermediate' ? 'border-[#8C4A28] pb-6 pt-6' : 'border-[#e2d5c3]'}`}
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <Text className="text-[#1a202c] text-[16px] font-black flex-1 pr-2">{pack.name}</Text>
                                    <View className={`bg-[#8C4A28] px-3 py-1 rounded shadow-sm max-w-[55%]`}>
                                        <Text className={`text-white text-[8px] font-black uppercase tracking-widest text-center`}>{pack.level}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-baseline mb-5">
                                    {sessionsCount > 0 ? (
                                        <>
                                            <Text className="text-[#1a202c] text-[38px] font-black leading-10">{sessionsCount}</Text>
                                            <Text className="text-[#64748b] text-[12px] font-bold ml-1">sessions / {pack.validity} months</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text className="text-[#1a202c] text-[38px] font-black leading-10">{pack.validity}</Text>
                                            <Text className="text-[#64748b] text-[12px] font-bold ml-1">months</Text>
                                        </>
                                    )}
                                </View>

                                {isActive ? (
                                    <>
                                        <View className={`w-full py-4 rounded-xl items-center justify-center bg-[#4ade80]/20 border border-[#4ade80] ${isEligibleForPackRenewal(pack) ? 'mb-3' : 'mb-6'}`}>
                                            <Text className="font-black text-[13px] text-[#064e3b] uppercase tracking-widest">Currently Active</Text>
                                        </View>
                                        {isEligibleForPackRenewal(pack) && (
                                            <TouchableOpacity
                                                className={`w-full py-4 rounded-xl items-center justify-center mb-6 shadow-sm ${isPackInCart(pack.id) ? 'bg-[#4ade80]/20 border border-[#4ade80]' : 'bg-[#8C4A28]'}`}
                                                onPress={() => handleEnrollment(pack.id, pack.name, pack.amount, pack.gst)}
                                            >
                                                <Text className={`font-black text-[13px] ${isPackInCart(pack.id) ? 'text-[#064e3b]' : 'text-white'}`}>
                                                    {isPackInCart(pack.id) ? '✓ In Cart' : `Renew — Add to Cart`}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                ) : (
                                    <TouchableOpacity
                                        className={`w-full py-4 rounded-xl items-center justify-center mb-6 shadow-sm ${isPackInCart(pack.id) ? 'bg-[#4ade80]/20 border border-[#4ade80]' : 'bg-[#8C4A28]'}`}
                                        onPress={() => handleEnrollment(pack.id, pack.name, pack.amount, pack.gst)}
                                    >
                                        <Text className={`font-black text-[13px] ${isPackInCart(pack.id) ? 'text-[#064e3b]' : 'text-white'}`}>
                                            {isPackInCart(pack.id) ? '✓ In Cart' : (pack.amount > 0 ? `Add to Cart — ₹${pack.amount.toLocaleString()}` : 'Add to Cart')}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                <View>
                                    {(pack.rules || ['Professional training', 'Stable access', 'Competition prep']).map((feature: string, idx: number) => (
                                        <View key={idx} className="flex-row items-start mb-[10px]">
                                            <View className="mt-[2px] mr-2">
                                                <CheckCircle2 color="#8C4A28" size={14} />
                                            </View>
                                            <Text className="text-[#475569] text-[11px] font-semibold flex-1 leading-tight">{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )})}
                    </View>

                    {/* Rules & Terms */}
                    <View className="bg-[#e2d5c3]/60 rounded-2xl p-6 mb-8 mt-2">
                        <View className="flex-row items-center mb-5">
                            <Gavel color="#1a202c" size={16} />
                            <Text className="text-[#1a202c] text-[12px] font-black ml-2 uppercase tracking-widest">Pack Rules & Terms</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <CalendarClock color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Sessions auto-created on enrollment</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Calendar color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Valid for selected month only</Text>
                        </View>

                        <View className="flex-row items-center mb-4">
                            <Ban color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">No carry forward of unused sessions</Text>
                        </View>

                        <View className="flex-row items-center">
                            <Clock color="#8C4A28" size={14} />
                            <Text className="text-[#475569] text-[10px] font-bold ml-3">Sessions auto-expire at month end</Text>
                        </View>
                    </View>
                        </>
                    ) : (
                        <View className="pb-8 mt-3">
                            <View className="mb-4">
                                <Text className="text-[#1a202c] text-lg font-black mb-[2px]">Explore Rider Levels</Text>
                                <Text className="text-[#64748b] text-[11px] font-semibold">Structured programs designed for your growth</Text>
                            </View>

                            {levels.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-[#64748b] font-bold">No levels available right now.</Text>
                                </View>
                            ) : levels.map((l) => {
                                const currentLevel = rider?.level || user?.level || '';
                                const isLevelActive = currentLevel?.toLowerCase().trim() === (l.name || '')?.toLowerCase().trim();
                                return (
                                <View 
                                    key={l.id} 
                                    className={`bg-white rounded-[20px] p-5 mb-4 border ${isLevelActive ? 'border-[#4ade80] border-2 bg-[#f0fdf4]' : 'border-[#e2d5c3]'}`}
                                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-1 pr-2">
                                            <Text className="text-[#1a202c] text-[18px] font-black">{l.name}</Text>
                                            <Text className="text-[#8C4A28] text-[10px] font-black uppercase tracking-widest mt-1">{l.category || 'Level'}</Text>
                                        </View>
                                    </View>

                                    {l.description ? (
                                        <Text className="text-[#64748b] text-[13px] font-semibold mb-4 leading-snug">{l.description}</Text>
                                    ) : null}

                                    <View className="bg-[#fcfaf8] rounded-xl p-4 border border-gray-100 mb-2">
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Pricing & Details</Text>
                                        
                                        {l.monthly_price ? (
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="text-[#1a202c] font-bold text-[13px]">Monthly Fee</Text>
                                                <Text className="text-[#8C4A28] font-black text-[15px]">₹{l.monthly_price.toLocaleString()}</Text>
                                            </View>
                                        ) : (
                                            <>
                                                {l.weekdays_price ? (
                                                    <View className="flex-row justify-between items-center mb-2">
                                                        <Text className="text-[#1a202c] font-bold text-[13px]">Weekdays Price</Text>
                                                        <Text className="text-[#8C4A28] font-black text-[15px]">₹{l.weekdays_price.toLocaleString()}</Text>
                                                    </View>
                                                ) : null}
                                                {l.weekend_price ? (
                                                    <View className="flex-row justify-between items-center mb-2">
                                                        <Text className="text-[#1a202c] font-bold text-[13px]">Weekend Price</Text>
                                                        <Text className="text-[#8C4A28] font-black text-[15px]">₹{l.weekend_price.toLocaleString()}</Text>
                                                    </View>
                                                ) : null}
                                            </>
                                        )}

                                        {l.sessions ? (
                                            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                                <Text className="text-[#1a202c] font-bold text-[13px]">Sessions Included</Text>
                                                <Text className="text-[#1a202c] font-black text-[14px]">{l.sessions}</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    {isLevelActive ? (
                                        <>
                                            <View className={`w-full py-3 mt-2 rounded-xl items-center justify-center bg-[#4ade80]/20 border border-[#4ade80] ${isEligibleForLevelRenewal() ? 'mb-2' : ''}`}>
                                                <Text className="font-black text-[13px] text-[#064e3b] uppercase tracking-widest">Currently Active</Text>
                                            </View>
                                            {isEligibleForLevelRenewal() && (
                                                <TouchableOpacity
                                                    className={`w-full py-4 rounded-xl items-center justify-center mt-2 shadow-sm ${isLevelInCart(l.id) ? 'bg-[#4ade80]/20 border border-[#4ade80]' : 'bg-[#8C4A28]'}`}
                                                    onPress={() => handleLevelClick(l)}
                                                >
                                                    <Text className={`font-black text-[13px] ${isLevelInCart(l.id) ? 'text-[#064e3b]' : 'text-white'}`}>
                                                        {isLevelInCart(l.id) ? '✓ In Cart' : 'Renew — Add to Cart'}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    ) : (
                                        <TouchableOpacity
                                            className={`w-full py-4 rounded-xl items-center justify-center mt-2 shadow-sm ${isLevelInCart(l.id) ? 'bg-[#4ade80]/20 border border-[#4ade80]' : 'bg-[#8C4A28]'}`}
                                            onPress={() => handleLevelClick(l)}
                                        >
                                            <Text className={`font-black text-[13px] ${isLevelInCart(l.id) ? 'text-[#064e3b]' : 'text-white'}`}>
                                                {isLevelInCart(l.id) ? '✓ In Cart' : 'Add to Cart'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )})}
                        </View>
                    )}
                </ScrollView>
            )}

            {/* Pricing Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={pricingModalVisible}
                onRequestClose={() => setPricingModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <Text className="text-[#1a202c] text-xl font-black mb-2">Select Pricing Option</Text>
                        <Text className="text-[#64748b] text-[13px] mb-6">Choose how you want to purchase {selectedLevelForPricing?.name}</Text>
                        
                        {selectedLevelForPricing?.weekdays_price ? (
                            <TouchableOpacity
                                className="bg-[#fcfaf8] border border-[#e2d5c3] p-4 rounded-2xl mb-4 flex-row justify-between items-center shadow-sm"
                                onPress={() => handleLevelEnrollment(selectedLevelForPricing, 'weekdaysPrice')}
                            >
                                <View>
                                    <Text className="text-[#1a202c] font-black text-[16px]">Weekdays</Text>
                                    <Text className="text-[#64748b] text-[12px] font-semibold mt-1">Access to weekday sessions</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[#8C4A28] font-black text-[18px]">₹{selectedLevelForPricing.weekdays_price.toLocaleString()}</Text>
                                    <Text className="text-[#64748b] text-[10px] font-semibold mt-0.5">Tap to add to cart</Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        {selectedLevelForPricing?.weekend_price ? (
                            <TouchableOpacity
                                className="bg-[#fcfaf8] border border-[#e2d5c3] p-4 rounded-2xl mb-6 flex-row justify-between items-center shadow-sm"
                                onPress={() => handleLevelEnrollment(selectedLevelForPricing, 'weekendPrice')}
                            >
                                <View>
                                    <Text className="text-[#1a202c] font-black text-[16px]">Weekends</Text>
                                    <Text className="text-[#64748b] text-[12px] font-semibold mt-1">Access to weekend sessions</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-[#8C4A28] font-black text-[18px]">₹{selectedLevelForPricing.weekend_price.toLocaleString()}</Text>
                                    <Text className="text-[#64748b] text-[10px] font-semibold mt-0.5">Tap to add to cart</Text>
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        <TouchableOpacity
                            className="w-full py-4 rounded-xl items-center justify-center bg-gray-100"
                            onPress={() => setPricingModalVisible(false)}
                        >
                            <Text className="font-black text-[14px] text-[#64748b]">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
