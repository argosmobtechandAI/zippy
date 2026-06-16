import { Config } from './config';

export const baseURL = Config.API_BASE_URL;

export const getAllUsersApi = `${baseURL}/users`;
export const getUserApi = `${baseURL}/users`;
export const createUserApi = `${baseURL}/users`;
export const getOTPApi = `${baseURL}/users/getOTP`;
export const verifyOTPApi = `${baseURL}/users/verifyOTP`;
export const loginApi = `${baseURL}/users/login`;
export const uploadProfilePictureApi = (id) => `${baseURL}/users/profile-picture/${id}`;


export const getAllHorsesApi = `${baseURL}/horse`;
export const getHorseApi = (id) => `${baseURL}/horse/${id}`;

export const logVaccinationApi = `${baseURL}/horse/vaccination`;
export const updateHealthStatusApi = `${baseURL}/horse/health`;
export const getVaccinationRecordsApi = `${baseURL}/horse/vaccination`;
export const getHealthRecordsApi = `${baseURL}/horse/health`;
export const getSessionsApi = `${baseURL}/session`;
export const getHorsesByVat = `${baseURL}/vat/horse`;
export const getAllStablesApi = `${baseURL}/stable/all`;
export const getCategoriesApi = `${baseURL}/categories`;