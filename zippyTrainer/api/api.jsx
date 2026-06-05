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
export const markNotificationsAsReadApi = (userId) => `${baseURL}/users/mark-as-read/${userId}`;
export const clearNotificationsApi = (userId) => `${baseURL}/users/clear-notifications/${userId}`;
export const getRiderApi = `${baseURL}/rider`;
export const getAllTrainersApi = `${baseURL}/users/trainers`;
export const getAllSessionsApi = `${baseURL}/session`;
export const getSessionsByTrainerApi = (trainerId) => `${baseURL}/session?trainerId=${trainerId}`;
export const updateSessionApi = `${baseURL}/session`;
export const getAllHorsesApi = `${baseURL}/horse`;
export const createHorseApi = `${baseURL}/horse`;
export const updateHorseApi = `${baseURL}/horse`;
export const deleteHorseApi = `${baseURL}/horse`;
export const updateStatusApi = `${baseURL}/session/status`;
export const updateAttendanceApi = `${baseURL}/session/updateAttendance`;
export const updateLeaveRequestApi = `${baseURL}/users/leave-request`;
export const updateLeaveApi = `${baseURL}/users/leave`;
export const uploadProfilePictureApi = (id) => `${baseURL}/users/profile-picture/${id}`;
export const createSessionApi = `${baseURL}/session`;
export const deleteSessionApi = `${baseURL}/session`;
export const approveSessionApi = (sessionId, riderId) => `${baseURL}/session/updateStatus/${sessionId}/${riderId}`;
export const updateTrainerApi = `${baseURL}/trainer`;
export const getAllStablesApi = `${baseURL}/stable/all`;
export const uploadToVPSApi = `${baseURL}/upload-local`;

export const uploadToVPS = async (asset) => {
  try {
    const response = await fetch(uploadToVPSApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        base64: asset.base64,
        fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.type || 'image/jpeg'
      }),
    });

    const data = await response.json();
    if (response.ok && data.success) {
      return data.files[0].url; 
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error) {
    throw error;
  }
};