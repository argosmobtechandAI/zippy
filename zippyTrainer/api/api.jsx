import { Config } from './config';

export const baseURL = Config.API_BASE_URL;

export const getAllUsersApi = `${baseURL}/users`;
export const getUserApi = `${baseURL}/users`;
export const createUserApi = `${baseURL}/users`;
export const getOTPApi = `${baseURL}/users/getOTP`;
export const verifyOTPApi = `${baseURL}/users/verifyOTP`;
export const updateUserApi = `${baseURL}/users`;
export const deleteUserApi = `${baseURL}/users`;
export const markNotificationsAsReadApi = (userId) => `${baseURL}/users/mark-as-read/${userId}`;
export const getRiderApi = `${baseURL}/rider`;

export const getAllSessionsApi = `${baseURL}/session`;
export const getSessionsByTrainerApi = (trainerId) => `${baseURL}/session?trainerId=${trainerId}`;
export const updateSessionApi = `${baseURL}/session`;
export const getAllHorsesApi = `${baseURL}/horse`;
export const updateStatusApi = `${baseURL}/session/status`;
export const updateAttendanceApi = `${baseURL}/session/attendance`;
export const updateLeaveRequestApi = `${baseURL}/users/leave-request`;
export const updateLeaveApi = `${baseURL}/users/leave`;