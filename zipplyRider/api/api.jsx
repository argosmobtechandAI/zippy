import { Config } from './config';

export const baseURL = Config.API_BASE_URL;

export const getAllUsersApi = `${baseURL}/users/all`;
export const getUserApi = `${baseURL}/users`;
export const createUserApi = `${baseURL}/users`;
export const getOTPApi = `${baseURL}/users/getOTP`;
export const verifyOTPApi = `${baseURL}/users/verifyOTP`;
export const loginApi = `${baseURL}/users/login`;
export const updateUserApi = `${baseURL}/users`;
export const deleteUserApi = `${baseURL}/users`;
export const getRiderApi = `${baseURL}/rider`;
export const enrollPackApi = `${baseURL}/rider/enroll`;
export const updateLeaveApi = `${baseURL}/users/leave`;
export const createOrderApi = `${baseURL}/plan/createRazorPayOrder`;
export const verifyRazorPayOrderApi = `${baseURL}/plan/verifyRazorPayOrder`;
export const createLevelOrderApi = `${baseURL}/levels/createRazorPayOrder`;
export const verifyLevelOrderApi = `${baseURL}/levels/verifyRazorPayOrder`;
export const getUserPaymentsApi = `${baseURL}/payments/user`;
export const getAllStablesApi = `${baseURL}/stable/all`;
export const getAllSessionsApi = `${baseURL}/session`;
export const updateSessionApi = (id) => `${baseURL}/session/${id}`;
export const cancelBookingApi = (id) => `${baseURL}/session/cancelBooking/${id}`;
export const getSessionsByRiderApi = (riderId) => `${baseURL}/session?riderId=${riderId}`;
export const getAllPlansApi = `${baseURL}/plan`;
export const getLevelsApi = `${baseURL}/levels`;
export const uploadProfilePictureApi = (id) => `${baseURL}/users/profile-picture/${id}`;
export const clearNotificationsApi = (id) => `${baseURL}/users/clear-notifications/${id}`;
export const markNotificationsAsReadApi = (id) => `${baseURL}/users/mark-as-read/${id}`;
export const sendForgotPasswordOtpApi = `${baseURL}/users/forgot-password/send-otp`;
export const getCouponsApi = `${baseURL}/coupons`;
export const verifyForgotPasswordOtpApi = `${baseURL}/users/forgot-password/verify-otp`;
export const resetPasswordApi = `${baseURL}/users/forgot-password/reset-password`;
export const getBroadcastsApi = `${baseURL}/users/broadcasts`;
export const updateFcmTokenApi = `${baseURL}/users/update-fcm-token`;
export const getLeaderboardApi = `${baseURL}/rider/leaderboard`;

// Combined Cart APIs
export const createCombinedCartOrderApi = `${baseURL}/cart/createCombinedOrder`;
export const verifyCombinedCartOrderApi  = `${baseURL}/cart/verifyCombinedOrder`;