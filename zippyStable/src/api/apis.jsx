
const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const getAllUsersApi = `${baseUrl}/users`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;

export const getAllStablesApi = `${baseUrl}/stable`;
export const createStableApi = `${baseUrl}/stable`;

export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;

export const getAllHorsesApi = `${baseUrl}/horse`;

export const getStableStatsApi = `${baseUrl}/stats/stable`;
export const inventoryApi = `${baseUrl}/inventory`;
export const createHorseApi = `${baseUrl}/horse`;