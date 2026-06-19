import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Tag, Wallet, CheckCircle2, ChevronRight, Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { apiFunction } from '../api/apifunction';
import { getCouponsApi, createOrderApi, verifyRazorPayOrderApi, createLevelOrderApi, verifyLevelOrderApi } from '../api/api';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    
    // Params passed from previous screen: { type: 'pack' | 'level', id: string, name: string, amount: number, pricingOption?: string }
    const { type, id, name, amount, pricingOption } = route.params || {};

    const { user, rider } = useSelector((state: any) => state.getData);
    const walletBalance = Number(rider?.wallet || user?.riderWallet || 0);

    const [loading, setLoading] = useState(false);
    const [fetchingCoupons, setFetchingCoupons] = useState(true);
    const [coupons, setCoupons] = useState([]);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [useWallet, setUseWallet] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await apiFunction(getCouponsApi, [], {}, "GET", true);
            if (res && res.success) {
                // Filter coupons valid for this user or generic
                const activeCoupons = res.coupons.filter(c => {
                    const isValid = c.status === 'ACTIVE' && (!c.expiry_date || new Date(c.expiry_date) > new Date());
                    const isForUser = !c.target_users?.length || c.target_users.includes(user?.id);
                    return isValid && isForUser;
                });
                setCoupons(activeCoupons);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setFetchingCoupons(false);
        }
    };

    // Calculate dynamic totals
    const discountAmount = appliedCoupon 
        ? (appliedCoupon.discount_type === 'percentage' 
            ? (amount * appliedCoupon.discount_value) / 100 
            : appliedCoupon.discount_value) 
        : 0;
        
    const priceAfterDiscount = Math.max(0, amount - discountAmount);
    const walletDeduction = useWallet ? Math.min(walletBalance, priceAfterDiscount) : 0;
    const finalAmount = Math.max(0, priceAfterDiscount - walletDeduction);

    const handleApplyCoupon = (code) => {
        const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
        if (!coupon) {
            Toast.show({ type: 'error', text1: 'Invalid or expired coupon' });
            return;
        }
        setAppliedCoupon(coupon);
        setCouponInput('');
        Toast.show({ type: 'success', text1: 'Coupon applied!' });
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        Toast.show({ type: 'info', text1: 'Coupon removed' });
    };

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const apiToCall = type === 'pack' ? createOrderApi : createLevelOrderApi;
            const payload = type === 'pack' 
                ? { planId: id, couponCode: appliedCoupon?.code, useWallet }
                : { levelId: id, pricingOption, couponCode: appliedCoupon?.code, useWallet };

            const orderRes = await apiFunction(apiToCall, [], payload, "POST", true);
            
            if (!orderRes || !orderRes.success) {
                setLoading(false);
                return Toast.show({ type: 'error', text1: orderRes?.message || "Checkout failed" });
            }

            // If final amount is 0, backend bypassed Razorpay and completed the payment
            if (orderRes.bypassedRazorpay) {
                const verifyApiToCall = type === 'pack' ? verifyRazorPayOrderApi : verifyLevelOrderApi;
                const verifyPayload = {
                    orderId: `bypassed_${Date.now()}`,
                    paymentId: `wallet_${Date.now()}`,
                    signature: 'bypassed',
                    couponCode: appliedCoupon?.code,
                    useWallet,
                    ...(type === 'pack' ? { planId: id } : { levelId: id, pricingOption })
                };

                const verifyRes = await apiFunction(verifyApiToCall, [], verifyPayload, "POST", true);
                if (verifyRes && verifyRes.success) {
                    dispatch(fetchRider());
                    dispatch(fetchUser());
                    setShowSuccessModal(true);
                } else {
                    Toast.show({ type: 'error', text1: verifyRes?.message || "Verification failed" });
                }
                setLoading(false);
                return;
            }

            // Normal Razorpay flow
            const { order } = orderRes;
            const options = {
                description: `${type === 'pack' ? 'Plan' : 'Level'} Purchase: ${name}`,
                image: 'https://zippy-equestrian.com/logo.png',
                currency: order.currency,
                key: order.razorpayKeyId,
                amount: order.amount, // already multiplied by 100 in backend
                name: 'Zippy Equestrian',
                order_id: order.id,
                prefill: {
                    email: order.userEmail || '',
                    contact: order.userPhone || '',
                    name: order.userName || ''
                },
                theme: { color: '#8C4A28' }
            };

            RazorpayCheckout.open(options).then(async (data) => {
                const verifyApiToCall = type === 'pack' ? verifyRazorPayOrderApi : verifyLevelOrderApi;
                const verifyPayload = {
                    orderId: data.razorpay_order_id,
                    paymentId: data.razorpay_payment_id,
                    signature: data.razorpay_signature,
                    couponCode: appliedCoupon?.code,
                    useWallet,
                    ...(type === 'pack' ? { planId: id } : { levelId: id, pricingOption })
                };

                const verifyRes = await apiFunction(verifyApiToCall, [], verifyPayload, "POST", true);

                if (verifyRes && verifyRes.success) {
                    dispatch(fetchRider());
                    dispatch(fetchUser());
                    setShowSuccessModal(true);
                } else {
                    Toast.show({ type: 'error', text1: verifyRes?.message || "Verification failed" });
                }
            }).catch((error) => {
                console.log(error);
                Toast.show({ type: 'error', text1: "Payment cancelled or failed" });
            }).finally(() => {
                setLoading(false);
            });

        } catch (error) {
            console.error("Checkout error:", error);
            Toast.show({ type: 'error', text1: "An error occurred during checkout." });
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#fcfaf8]">
            <View className="px-5 py-4 flex-row items-center border-b border-[#8C4A28]/10 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 rounded-full hover:bg-gray-50">
                    <ArrowLeft size={24} color="#8C4A28" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-[#2C1810] ml-3 font-display">Checkout</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6 pb-20">
                {/* Order Summary */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C4A28]/10 mb-6">
                    <Text className="text-[11px] font-bold text-[#8C4A28]/60 uppercase tracking-widest mb-3">Order Summary</Text>
                    <View className="flex-row justify-between items-center">
                        <View className="flex-1 pr-4">
                            <Text className="text-lg font-bold text-[#2C1810] font-display">{name}</Text>
                            <Text className="text-sm text-[#8C4A28]/80 mt-1 capitalize">{type} Subscription</Text>
                        </View>
                        <Text className="text-xl font-black text-[#8C4A28]">₹{amount.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Coupons Section */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C4A28]/10 mb-6">
                    <Text className="text-[11px] font-bold text-[#8C4A28]/60 uppercase tracking-widest mb-4">Offers & Benefits</Text>
                    
                    {appliedCoupon ? (
                        <View className="bg-[#E8F5E9] border border-[#4CAF50]/30 rounded-xl p-4 flex-row justify-between items-center">
                            <View className="flex-row items-center gap-3">
                                <View className="w-8 h-8 rounded-full bg-[#4CAF50]/20 items-center justify-center">
                                    <Tag size={16} color="#4CAF50" />
                                </View>
                                <View>
                                    <Text className="font-bold text-[#2E7D32]">{appliedCoupon.code}</Text>
                                    <Text className="text-xs text-[#2E7D32]/80 mt-0.5">Coupon applied successfully</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleRemoveCoupon} className="px-3 py-1.5 bg-white/60 rounded-lg">
                                <Text className="text-xs font-bold text-red-500">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View className="flex-row items-center gap-3 mb-4">
                                <TextInput 
                                    placeholder="Enter coupon code"
                                    value={couponInput}
                                    onChangeText={setCouponInput}
                                    autoCapitalize="characters"
                                    className="flex-1 bg-[#F9F7F5] border border-[#8C4A28]/10 rounded-xl px-4 py-3.5 text-[#2C1810] font-bold"
                                />
                                <TouchableOpacity 
                                    onPress={() => handleApplyCoupon(couponInput)}
                                    disabled={!couponInput}
                                    className={`px-5 py-3.5 rounded-xl ${couponInput ? 'bg-[#8C4A28]' : 'bg-[#8C4A28]/40'}`}
                                >
                                    <Text className="text-white font-bold">Apply</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Available Coupons */}
                            {coupons.length > 0 && (
                                <View>
                                    <Text className="text-xs font-semibold text-[#8C4A28]/70 mb-3">Available Coupons</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
                                        {coupons.map(coupon => (
                                            <TouchableOpacity 
                                                key={coupon.id} 
                                                onPress={() => handleApplyCoupon(coupon.code)}
                                                className="bg-[#F9F7F5] border border-[#8C4A28]/20 border-dashed rounded-xl p-3 mr-3 w-[200px]"
                                            >
                                                <Text className="font-black text-[#8C4A28] mb-1">{coupon.code}</Text>
                                                <Text className="text-xs text-[#8C4A28]/80 leading-relaxed">
                                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `Flat ₹${coupon.discount_value} OFF`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Wallet Section */}
                <TouchableOpacity 
                    onPress={() => walletBalance > 0 && setUseWallet(!useWallet)}
                    activeOpacity={0.8}
                    className={`bg-white p-5 rounded-2xl shadow-sm border ${useWallet ? 'border-[#8C4A28] bg-[#FFF8F5]' : 'border-[#8C4A28]/10'} mb-6`}
                >
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center gap-4">
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${useWallet ? 'bg-[#8C4A28]' : 'bg-[#F9F7F5]'}`}>
                                <Wallet size={20} color={useWallet ? 'white' : '#8C4A28'} />
                            </View>
                            <View>
                                <Text className={`font-bold text-base ${useWallet ? 'text-[#8C4A28]' : 'text-[#2C1810]'}`}>Zippy Wallet</Text>
                                <Text className="text-xs text-[#8C4A28]/70 mt-1">Available Balance: <Text className="font-bold">₹{walletBalance.toLocaleString()}</Text></Text>
                            </View>
                        </View>
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${useWallet ? 'bg-[#8C4A28] border-[#8C4A28]' : 'border-[#8C4A28]/30'}`}>
                            {useWallet && <Check size={14} color="white" strokeWidth={3} />}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Payment Breakdown */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-[#8C4A28]/10 mb-8">
                    <Text className="text-[11px] font-bold text-[#8C4A28]/60 uppercase tracking-widest mb-4">Payment Details</Text>
                    
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-sm text-[#2C1810]/70">Subtotal</Text>
                        <Text className="text-sm font-semibold text-[#2C1810]">₹{amount.toLocaleString()}</Text>
                    </View>

                    {discountAmount > 0 && (
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-sm text-[#4CAF50]">Coupon Discount ({appliedCoupon?.code})</Text>
                            <Text className="text-sm font-bold text-[#4CAF50]">- ₹{discountAmount.toLocaleString()}</Text>
                        </View>
                    )}

                    {walletDeduction > 0 && (
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-sm text-[#8C4A28]">Wallet Applied</Text>
                            <Text className="text-sm font-bold text-[#8C4A28]">- ₹{walletDeduction.toLocaleString()}</Text>
                        </View>
                    )}

                    <View className="h-px bg-[#8C4A28]/10 my-3" />
                    
                    <View className="flex-row justify-between items-center">
                        <Text className="text-base font-bold text-[#2C1810]">Total to Pay</Text>
                        <Text className="text-2xl font-black text-[#8C4A28]">₹{finalAmount.toLocaleString()}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Floating Bar */}
            <View className="absolute bottom-0 w-full bg-white border-t border-[#8C4A28]/10 p-5 pb-8 flex-row items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                <View>
                    <Text className="text-xs font-semibold text-[#8C4A28]/70">Total Amount</Text>
                    <Text className="text-2xl font-black text-[#2C1810] font-display mt-0.5">₹{finalAmount.toLocaleString()}</Text>
                </View>
                <TouchableOpacity 
                    onPress={handleCheckout}
                    disabled={loading}
                    className="bg-[#8C4A28] px-8 py-4 rounded-xl flex-row items-center gap-2 shadow-[0_8px_20px_rgba(140,74,40,0.3)]"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-base">Pay Now</Text>
                            <ChevronRight size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-5">
                    <View className="bg-white rounded-3xl w-full max-w-sm p-8 items-center shadow-xl">
                        <View className="w-20 h-20 bg-[#DCFCE7] rounded-full justify-center items-center mb-6">
                            <CheckCircle2 size={48} color="#166534" />
                        </View>
                        <Text className="text-2xl font-black text-[#1e2330] mb-2 text-center">Payment Successful!</Text>
                        <Text className="text-[13px] text-gray-500 text-center mb-8 font-semibold">
                            Your {type === 'pack' ? 'plan' : 'level'} purchase was successful. You can now start booking your sessions.
                        </Text>
                        <TouchableOpacity
                            className="w-full bg-[#8C4A28] py-4 rounded-2xl items-center shadow-sm"
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text className="text-white font-black text-[15px] tracking-wide">Back to Plans</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
