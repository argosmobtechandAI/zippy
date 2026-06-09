export const baseUrl = "https://api.zippyapp.online/api";

export const loginApi = `${baseUrl}/users/login`;
export const logoutApi = `${baseUrl}/auth/logout`;

export const getAllUsersApi = `${baseUrl}/users/all`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;

export const getAllVatsApi = `${baseUrl}/vat`;
export const assignVetApi = `${baseUrl}/horse/assign-vet`;

export const getAllTrainersApi = `${baseUrl}/users/trainers`;


export const getAllStablesApi = `${baseUrl}/stable`;
export const getStableApi = `${baseUrl}/stable`;
export const createStableApi = `${baseUrl}/stable`;

export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;

export const getAllHorsesApi = `${baseUrl}/horse`;

export const getStableStatsApi = `${baseUrl}/stats/stable`;
export const inventoryApi = `${baseUrl}/inventory`;
export const getInventoryByStableApi = `${baseUrl}/inventory/stable`;
export const createHorseApi = `${baseUrl}/horse`;
export const getHorsesByStableApi = `${baseUrl}/horse/stable`;
export const assignTrainerApi = `${baseUrl}/horse/assign-trainer`;

export const updateTrainerApi = `${baseUrl}/trainer`;


export const deleteSessionApi = `${baseUrl}/session`;
export const updateSessionApi = `${baseUrl}/session`;
export const approveSessionApi = `${baseUrl}/session/status`;  