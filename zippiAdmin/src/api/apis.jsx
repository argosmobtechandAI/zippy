export const baseUrl = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "https://api.zippyapp.online/api";
// export const baseUrl = "http://localhost:3000/api";
export const getAllUsersApi = `${baseUrl}/users/all`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const loginApi = `${baseUrl}/users/login`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;
export const notifyUserApi = (userId) => `${baseUrl}/users/notify/${userId}`;
export const notifyAllUsersApi = `${baseUrl}/users/notify-all`;
export const getBroadcastsApi = `${baseUrl}/users/broadcasts`;
export const deleteBroadcastApi = (id) => `${baseUrl}/users/broadcasts/${id}`;
export const uploadNotificationImageApi = `${baseUrl}/users/upload-notification-image`;
export const updateUserLeaveApi = `${baseUrl}/users/userLeave`
export const markNotificationsAsReadApi = (userId) => `${baseUrl}/users/mark-as-read/${userId}`;
export const getAdminNotificationsApi = `${baseUrl}/admin-notifications`;
export const markAllAdminNotificationsAsReadApi = `${baseUrl}/admin-notifications`;
export const markAdminNotificationAsReadApi = (id) => `${baseUrl}/admin-notifications/${id}`;

export const getAllStablesApi = `${baseUrl}/stable/all`;
export const createStableApi = `${baseUrl}/stable`;
export const updateStableApi = `${baseUrl}/stable`;
export const deleteStableApi = `${baseUrl}/stable`;
export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;
export const updateSessionApi = `${baseUrl}/session`;
export const approveSessionApi = `${baseUrl}/session/updateStatus`
export const deleteSessionApi = `${baseUrl}/session`;
export const cancelFullSessionApi = `${baseUrl}/session/cancelFullSession`;

export const getAllHorsesApi = `${baseUrl}/horse`;
export const createHorseApi = `${baseUrl}/horse`;
export const updateHorseApi = `${baseUrl}/horse`;
export const deleteHorseApi = `${baseUrl}/horse`;
export const logHealthApi = `${baseUrl}/horse/health`;
export const logVaccinationApi = `${baseUrl}/horse/vaccination`;
export const getHealthRecordsByHorseApi = (horseId) => `${baseUrl}/horse/health?horseId=${horseId}`;
export const getVaccinationRecordsByHorseApi = (horseId) => `${baseUrl}/horse/vaccination?horseId=${horseId}`;

export const getGlobalStatsApi = `${baseUrl}/stats/global`;
export const getRevenueStatsApi = `${baseUrl}/stats/revenue`;
export const getAllInventoryApi = `${baseUrl}/inventory`;
export const createInventoryApi = `${baseUrl}/inventory`;
export const updateInventoryApi = `${baseUrl}/inventory`;
export const deleteInventoryApi = `${baseUrl}/inventory`;
export const seedInventoryApi = `${baseUrl}/inventory/seed`;
export const getAllTrainersApi = `${baseUrl}/users/trainers`;
export const plansApi = `${baseUrl}/plan`;
export const assignPlanApi = `${baseUrl}/plan/assign`;
export const revenueStatsApi = `${baseUrl}/revenue/stats`;
export const updateTrainerApi = `${baseUrl}/trainer`;
export const uploadFileApi = `${baseUrl}/stable/uploadFile`;
export const deleteStableLogoApi = `${baseUrl}/stable/deleteLogo`;
export const getHelpCenterApi = `${baseUrl}/help-center`;
export const updateHelpCenterApi = `${baseUrl}/help-center`;
export const deleteHelpCenterApi = `${baseUrl}/help-center`;

export const getCategoriesApi = `${baseUrl}/categories`;
export const createCategoryApi = `${baseUrl}/categories`;
export const deleteCategoryApi = `${baseUrl}/categories`;
