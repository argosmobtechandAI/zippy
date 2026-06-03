
export const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "https://api.zippyapp.online/api";

export const loginApi = `${baseUrl}/users/login`;
export const logoutApi = `${baseUrl}/auth/logout`;

export const getAllUsersApi = `${baseUrl}/users/all`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;

export const getAllVatsApi = `${baseUrl}/vat/all`;
export const assignVetApi = `${baseUrl}/horse/assignVet`;

export const getAllTrainersApi = `${baseUrl}/users/trainers`;


export const getAllStablesApi = `${baseUrl}/stable`;
export const getStableApi = `${baseUrl}/stable/single`
export const createStableApi = `${baseUrl}/stable`;

export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;

export const getAllHorsesApi = `${baseUrl}/horse`;

export const getStableStatsApi = `${baseUrl}/stats/stable`;
export const inventoryApi = `${baseUrl}/inventory`;
export const createHorseApi = `${baseUrl}/horse`;
export const getHorsesByStableApi = `${baseUrl}/horse/stable`;
export const assignTrainerApi = `${baseUrl}/horse/assignTrainer`;

export const updateTrainerApi = `${baseUrl}/trainer`;


export const deleteSessionApi = `${baseUrl}/session`;
export const updateSessionApi = `${baseUrl}/session`;
export const approveSessionApi = `${baseUrl}/session/status`;  