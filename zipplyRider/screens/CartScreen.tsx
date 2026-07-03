import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    ShoppingCart,
    Trash2,
    Tag,
    Wallet,
    Check,
    CheckCircle2,
    ChevronRight,
    Package,
    Award,
    ShoppingBag,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import { fetchRider, fetchUser } from '../redux/getDataSlice';
import { apiFunction } from '../api/apifunction';
import {
    getCouponsApi,
    createCombinedCartOrderApi,
    verifyCombinedCartOrderApi,
} from '../api/api';
import Toast from 'react-native-toast-message';
import RazorpayCheckout from 'react-native-razorpay';

export default function CartScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { user, rider } = useSelector((state: any) => state.getData);
    const cartItems: any[] = useSelector((state: any) => state.cart?.items ?? []);
    const walletBalance = Number(rider?.wallet || user?.riderWallet || 0);

    const [loading, setLoading] = useState(false);
    const [fetchingCoupons, setFetchingCoupons] = useState(true);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [useWallet, setUseWallet] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const packItem = cartItems.find(i => i.type === 'pack');
    const levelItem = cartItems.find(i => i.type === 'level');

    // Base amounts (prices without GST)
    const subtotal = cartItems.reduce((sum, item) => sum + item.amount, 0);

    // GST per item — stored as gst % in item data
    const gstAmount = cartItems.reduce((sum, item) => {
        const gstPct = Number(item.gst) || 0;
        return sum + Math.round((item.amount * gstPct) / 100);
    }, 0);

    const subtotalWithGst = subtotal + gstAmount;

    const discountAmount = appliedCoupon
        ? appliedCoupon.discount_type === 'percentage'
            ? Math.round((subtotalWithGst * appliedCoupon.discount_value) / 100)
            : appliedCoupon.discount_value
        : 0;

    const afterCoupon = Math.max(0, subtotalWithGst - discountAmount);
    const walletDeduction = useWallet ? Math.min(walletBalance, afterCoupon) : 0;
    const finalAmount = Math.max(0, afterCoupon - walletDeduction);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await apiFunction(getCouponsApi, [], {}, 'GET', true);
            if (res && res.success) {
                const activeCoupons = res.coupons.filter((c: any) => {
                    const isValid =
                        c.status === 'ACTIVE' &&
                        (!c.expiry_date || new Date(c.expiry_date) > new Date());
                    const isForUser =
                        !c.target_users?.length || c.target_users.includes(user?.id);
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

    const handleApplyCoupon = (code: string) => {
        const coupon = coupons.find(
            (c: any) => c.code.toUpperCase() === code.toUpperCase(),
        );
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
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            const payload: any = {
                couponCode: appliedCoupon?.code,
                useWallet,
            };
            if (packItem) payload.planId = packItem.id;
            if (levelItem) {
                payload.levelId = levelItem.id;
                payload.pricingOption = levelItem.pricingOption;
            }

            const orderRes = await apiFunction(
                createCombinedCartOrderApi,
                [],
                payload,
                'POST',
                true,
            );

            if (!orderRes || !orderRes.success) {
                setLoading(false);
                return Toast.show({
                    type: 'error',
                    text1: orderRes?.message || 'Checkout failed',
                });
            }

            // Wallet-bypass flow
            if (orderRes.bypassedRazorpay) {
                const verifyPayload = {
                    orderId: `bypassed_${Date.now()}`,
                    paymentId: `wallet_${Date.now()}`,
                    signature: 'bypassed',
                    couponCode: appliedCoupon?.code,
                    useWallet,
                    ...(packItem ? { planId: packItem.id } : {}),
                    ...(levelItem
                        ? { levelId: levelItem.id, pricingOption: levelItem.pricingOption }
                        : {}),
                };
                const verifyRes = await apiFunction(
                    verifyCombinedCartOrderApi,
                    [],
                    verifyPayload,
                    'POST',
                    true,
                );
                if (verifyRes && verifyRes.success) {
                    dispatch(fetchRider() as any);
                    dispatch(fetchUser() as any);
                    dispatch(clearCart());
                    setShowSuccessModal(true);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: verifyRes?.message || 'Verification failed',
                    });
                }
                setLoading(false);
                return;
            }

            // Normal Razorpay flow
            const { order } = orderRes;
            const options = {
                description: 'Zippy Cart Purchase',
                image: 'https://zippy-equestrian.com/logo.png',
                currency: order.currency,
                key: order.razorpayKeyId,
                amount: order.amount,
                name: 'Zippy Equestrian',
                order_id: order.id,
                prefill: {
                    email: order.userEmail || '',
                    contact: order.userPhone || '',
                    name: order.userName || '',
                },
                theme: { color: '#8C4A28' },
            };

            RazorpayCheckout.open(options)
                .then(async (data: any) => {
                    const verifyPayload = {
                        orderId: data.razorpay_order_id,
                        paymentId: data.razorpay_payment_id,
                        signature: data.razorpay_signature,
                        couponCode: appliedCoupon?.code,
                        useWallet,
                        ...(packItem ? { planId: packItem.id } : {}),
                        ...(levelItem
                            ? { levelId: levelItem.id, pricingOption: levelItem.pricingOption }
                            : {}),
                    };
                    const verifyRes = await apiFunction(
                        verifyCombinedCartOrderApi,
                        [],
                        verifyPayload,
                        'POST',
                        true,
                    );
                    if (verifyRes && verifyRes.success) {
                        dispatch(fetchRider() as any);
                        dispatch(fetchUser() as any);
                        dispatch(clearCart());
                        setShowSuccessModal(true);
                    } else {
                        Toast.show({
                            type: 'error',
                            text1: verifyRes?.message || 'Verification failed',
                        });
                    }
                })
                .catch(() => {
                    Toast.show({ type: 'error', text1: 'Payment cancelled or failed' });
                })
                .finally(() => {
                    setLoading(false);
                });
        } catch (error) {
            console.error('Cart checkout error:', error);
            Toast.show({ type: 'error', text1: 'An error occurred during checkout.' });
            setLoading(false);
        }
    };

    /* ─────────────────────── UI HELPERS ─────────────────────── */

    const pricingLabel: Record<string, string> = {
        monthlyPrice: 'Monthly',
        weekdaysPrice: 'Weekdays',
        weekendPrice: 'Weekend',
    };

    const renderCartItem = (item: any) => {
        const isPack = item.type === 'pack';
        return (
            <View
                key={item.type}
                className="bg-white rounded-2xl mb-4 overflow-hidden"
                style={{ shadowColor: '#8C4A28', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
            >
                {/* Colored top strip */}
                <View className={`h-1 w-full ${isPack ? 'bg-[#8C4A28]' : 'bg-[#C97B4B]'}`} />

                <View className="p-5">
                    <View className="flex-row items-start justify-between">
                        {/* Icon + Info */}
                        <View className="flex-row items-start flex-1 pr-3">
                            <View
                                className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isPack ? 'bg-[#F5EDDF]' : 'bg-[#FDF3EA]'}`}
                            >
                                {isPack
                                    ? <Package size={20} color="#8C4A28" />
                                    : <Award size={20} color="#C97B4B" />}
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] font-black text-[#8C4A28]/60 uppercase tracking-widest mb-0.5">
                                    {isPack ? 'Membership Plan' : 'Rider Level'}
                                </Text>
                                <Text className="text-[#1a202c] text-[16px] font-black leading-tight">
                                    {item.name}
                                </Text>
                                {item.pricingOption && (
                                    <View className="bg-[#F5EDDF] rounded-md px-2 py-0.5 self-start mt-1.5">
                                        <Text className="text-[#8C4A28] text-[10px] font-black">
                                            {pricingLabel[item.pricingOption] || item.pricingOption}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Price + Remove */}
                        <View className="items-end">
                            <Text className="text-[#8C4A28] text-[18px] font-black">
                                ₹{item.amount.toLocaleString()}
                            </Text>
                            <TouchableOpacity
                                onPress={() => dispatch(removeFromCart(item.type))}
                                className="mt-2 flex-row items-center"
                            >
                                <Trash2 size={13} color="#ef4444" />
                                <Text className="text-red-500 text-[11px] font-bold ml-1">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center px-8 py-16">
            <View className="w-24 h-24 rounded-full bg-[#e2d5c3]/50 items-center justify-center mb-6">
                <ShoppingBag size={44} color="#8C4A28" strokeWidth={1.5} />
            </View>
            <Text className="text-[#1a202c] text-2xl font-black mb-2 text-center">
                Your cart is empty
            </Text>
            <Text className="text-[#64748b] text-sm font-semibold text-center leading-relaxed mb-8">
                Browse our membership plans and rider levels to get started on your equestrian journey.
            </Text>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="bg-[#8C4A28] px-8 py-4 rounded-2xl shadow-sm"
                style={{ shadowColor: '#8C4A28', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
            >
                <Text className="text-white font-black text-[15px]">Browse Plans</Text>
            </TouchableOpacity>
        </View>
    );

    /* ─────────────────────── RENDER ─────────────────────── */

    return (
        <SafeAreaView className="flex-1 bg-[#F5EDDF]">
            {/* ── Header ── */}
            <View className="px-5 py-4 flex-row items-center justify-between bg-[#F5EDDF]">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-[#e2d5c3] items-center justify-center mr-4"
                    >
                        <ArrowLeft size={22} color="#1a202c" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-[#1a202c] text-[18px] font-black">My Cart</Text>
                        <Text className="text-[#64748b] text-[10px] font-semibold mt-0.5">
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} selected
                        </Text>
                    </View>
                </View>
                <View className="bg-[#8C4A28] w-9 h-9 rounded-full items-center justify-center">
                    <ShoppingCart size={18} color="white" />
                </View>
            </View>

            {cartItems.length === 0 ? (
                renderEmptyState()
            ) : (
                <>
                    <ScrollView
                        className="flex-1 px-5 pt-3"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 140 }}
                    >
                        {/* ── Cart Items ── */}
                        <Text className="text-[11px] font-black text-[#8C4A28]/60 uppercase tracking-widest mb-3">
                            Selected Items
                        </Text>
                        {cartItems.map(renderCartItem)}

                        {/* ── Bundle Hint ── */}
                        {cartItems.length === 2 && (
                            <View className="bg-[#8C4A28]/10 border border-[#8C4A28]/20 rounded-2xl px-4 py-3 mb-6 flex-row items-center">
                                <CheckCircle2 size={16} color="#8C4A28" />
                                <Text className="text-[#8C4A28] text-[12px] font-bold ml-2 flex-1">
                                    Bundle purchase — Plan + Level added to a single order
                                </Text>
                            </View>
                        )}

                        {/* ── Coupon Section ── */}
                        <View
                            className="bg-white rounded-2xl p-5 mb-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-[11px] font-black text-[#8C4A28]/60 uppercase tracking-widest mb-4">
                                Offers & Benefits
                            </Text>

                            {appliedCoupon ? (
                                <View className="bg-[#E8F5E9] border border-[#4CAF50]/30 rounded-xl p-4 flex-row justify-between items-center">
                                    <View className="flex-row items-center gap-3">
                                        <View className="w-8 h-8 rounded-full bg-[#4CAF50]/20 items-center justify-center">
                                            <Tag size={16} color="#4CAF50" />
                                        </View>
                                        <View>
                                            <Text className="font-black text-[#2E7D32]">{appliedCoupon.code}</Text>
                                            <Text className="text-xs text-[#2E7D32]/80 mt-0.5">
                                                {appliedCoupon.discount_type === 'percentage'
                                                    ? `${appliedCoupon.discount_value}% OFF applied`
                                                    : `Flat ₹${appliedCoupon.discount_value} OFF applied`}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleRemoveCoupon}
                                        className="px-3 py-1.5 bg-white/60 rounded-lg"
                                    >
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
                                            placeholderTextColor="#a0aec0"
                                            className="flex-1 bg-[#F9F7F5] border border-[#8C4A28]/10 rounded-xl px-4 py-3.5 text-[#2C1810] font-bold"
                                        />
                                        <TouchableOpacity
                                            onPress={() => handleApplyCoupon(couponInput)}
                                            disabled={!couponInput}
                                            className={`px-5 py-3.5 rounded-xl ${couponInput ? 'bg-[#8C4A28]' : 'bg-[#8C4A28]/40'}`}
                                        >
                                            <Text className="text-white font-black text-[13px]">Apply</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {coupons.length > 0 && (
                                        <View>
                                            <Text className="text-xs font-bold text-[#8C4A28]/70 mb-3">
                                                Available Coupons
                                            </Text>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                className="-mx-5 px-5"
                                            >
                                                {coupons.map((coupon: any) => (
                                                    <TouchableOpacity
                                                        key={coupon.id}
                                                        onPress={() => handleApplyCoupon(coupon.code)}
                                                        className="bg-[#F9F7F5] border border-[#8C4A28]/20 border-dashed rounded-xl p-3 mr-3 w-[190px]"
                                                    >
                                                        <Text className="font-black text-[#8C4A28] mb-1">
                                                            {coupon.code}
                                                        </Text>
                                                        <Text className="text-xs text-[#8C4A28]/80">
                                                            {coupon.discount_type === 'percentage'
                                                                ? `${coupon.discount_value}% OFF`
                                                                : `Flat ₹${coupon.discount_value} OFF`}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* ── Wallet Section ── */}
                        <TouchableOpacity
                            onPress={() => walletBalance > 0 && setUseWallet(!useWallet)}
                            activeOpacity={0.8}
                            className={`bg-white p-5 rounded-2xl mb-4 ${useWallet ? 'border-2 border-[#8C4A28] bg-[#FFF8F5]' : 'border border-[#8C4A28]/10'}`}
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                        >
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center gap-4">
                                    <View
                                        className={`w-12 h-12 rounded-full items-center justify-center ${useWallet ? 'bg-[#8C4A28]' : 'bg-[#F9F7F5]'}`}
                                    >
                                        <Wallet size={20} color={useWallet ? 'white' : '#8C4A28'} />
                                    </View>
                                    <View>
                                        <Text className={`font-black text-base ${useWallet ? 'text-[#8C4A28]' : 'text-[#2C1810]'}`}>
                                            Zippy Wallet
                                        </Text>
                                        <Text className="text-xs text-[#8C4A28]/70 mt-0.5">
                                            Balance:{' '}
                                            <Text className="font-black">₹{walletBalance.toLocaleString()}</Text>
                                        </Text>
                                        {walletBalance === 0 && (
                                            <Text className="text-[10px] text-gray-400 font-semibold mt-0.5">
                                                No balance available
                                            </Text>
                                        )}
                                    </View>
                                </View>
                                <View
                                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${useWallet ? 'bg-[#8C4A28] border-[#8C4A28]' : 'border-[#8C4A28]/30'}`}
                                >
                                    {useWallet && <Check size={14} color="white" strokeWidth={3} />}
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* ── Payment Breakdown ── */}
                        <View
                            className="bg-white p-5 rounded-2xl mb-6"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                        >
                            <Text className="text-[11px] font-black text-[#8C4A28]/60 uppercase tracking-widest mb-4">
                                Payment Details
                            </Text>

                            {/* Per-item subtotals */}
                            {packItem && (
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm text-[#2C1810]/70" numberOfLines={1}>
                                        {packItem.name}
                                    </Text>
                                    <Text className="text-sm font-semibold text-[#2C1810]">
                                        ₹{packItem.amount.toLocaleString()}
                                    </Text>
                                </View>
                            )}
                            {levelItem && (
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm text-[#2C1810]/70" numberOfLines={1}>
                                        {levelItem.name}
                                        {levelItem.pricingOption
                                            ? ` (${pricingLabel[levelItem.pricingOption]})`
                                            : ''}
                                    </Text>
                                    <Text className="text-sm font-semibold text-[#2C1810]">
                                        ₹{levelItem.amount.toLocaleString()}
                                    </Text>
                                </View>
                            )}

                            <View className="h-px bg-[#8C4A28]/8 my-3" />

                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="text-sm text-[#2C1810]/70">Subtotal</Text>
                                <Text className="text-sm font-semibold text-[#2C1810]">
                                    ₹{subtotal.toLocaleString()}
                                </Text>
                            </View>

                            {gstAmount > 0 && (
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm text-orange-600">
                                        GST
                                    </Text>
                                    <Text className="text-sm font-bold text-orange-600">
                                        + ₹{gstAmount.toLocaleString()}
                                    </Text>
                                </View>
                            )}

                            {discountAmount > 0 && (
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm text-[#4CAF50]">
                                        Coupon ({appliedCoupon?.code})
                                    </Text>
                                    <Text className="text-sm font-bold text-[#4CAF50]">
                                        − ₹{discountAmount.toLocaleString()}
                                    </Text>
                                </View>
                            )}

                            {walletDeduction > 0 && (
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-sm text-[#8C4A28]">Wallet Applied</Text>
                                    <Text className="text-sm font-bold text-[#8C4A28]">
                                        − ₹{walletDeduction.toLocaleString()}
                                    </Text>
                                </View>
                            )}

                            <View className="h-px bg-[#8C4A28]/10 my-3" />

                            <View className="flex-row justify-between items-center">
                                <Text className="text-base font-black text-[#2C1810]">Total to Pay</Text>
                                <Text className="text-2xl font-black text-[#8C4A28]">
                                    ₹{finalAmount.toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* ── Bottom Sticky Bar ── */}
                    <View
                        className="absolute bottom-0 w-full bg-white border-t border-[#8C4A28]/10 px-5 pt-4 pb-8 flex-row items-center justify-between"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}
                    >
                        <View>
                            <Text className="text-xs font-semibold text-[#8C4A28]/60">Total Amount</Text>
                            <Text className="text-2xl font-black text-[#2C1810] mt-0.5">
                                ₹{finalAmount.toLocaleString()}
                            </Text>
                            {cartItems.length > 1 && (
                                <Text className="text-[10px] text-[#64748b] font-semibold">
                                    {cartItems.length} items
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleCheckout}
                            disabled={loading || cartItems.length === 0}
                            className={`px-8 py-4 rounded-2xl flex-row items-center gap-2 ${loading || cartItems.length === 0 ? 'bg-[#8C4A28]/50' : 'bg-[#8C4A28]'}`}
                            style={
                                !loading && cartItems.length > 0
                                    ? { shadowColor: '#8C4A28', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 }
                                    : {}
                            }
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-black text-[15px]">Proceed to Pay</Text>
                                    <ChevronRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* ── Success Modal ── */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center items-center px-5">
                    <View className="bg-white rounded-3xl w-full max-w-sm p-8 items-center shadow-2xl">
                        {/* Animated circle */}
                        <View className="w-24 h-24 bg-[#DCFCE7] rounded-full justify-center items-center mb-6">
                            <CheckCircle2 size={52} color="#166534" />
                        </View>
                        <Text className="text-2xl font-black text-[#1e2330] mb-2 text-center">
                            Payment Successful!
                        </Text>
                        <Text className="text-[13px] text-gray-500 text-center mb-2 font-semibold leading-relaxed">
                            {packItem && levelItem
                                ? 'Your membership plan and rider level have been activated.'
                                : packItem
                                    ? 'Your membership plan has been activated.'
                                    : 'Your rider level has been activated.'}
                        </Text>
                        <Text className="text-[12px] text-[#8C4A28] text-center mb-8 font-bold">
                            You can now start booking your sessions.
                        </Text>
                        <TouchableOpacity
                            className="w-full bg-[#8C4A28] py-4 rounded-2xl items-center"
                            style={{ shadowColor: '#8C4A28', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text className="text-white font-black text-[15px] tracking-wide">
                                Back to Programs
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
