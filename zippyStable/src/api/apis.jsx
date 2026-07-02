export const baseUrl = "https://api.zippyapp.online/api";

export const loginApi = `${baseUrl}/users/login`;
export const logoutApi = `${baseUrl}/auth/logout`;

export const getAllUsersApi = `${baseUrl}/users/all`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;

export const getBroadcastsApi = `${baseUrl}/users/broadcasts`;
export const deleteBroadcastApi = (id) => `${baseUrl}/users/broadcasts/${id}`;
export const uploadNotificationImageApi = `${baseUrl}/users/upload-notification-image`;

export const getAllVatsApi = `${baseUrl}/vat`;
export const assignVetApi = `${baseUrl}/horse/assign-vet`;

export const getAllTrainersApi = `${baseUrl}/users/trainers`;


export const getAllStablesApi = `${baseUrl}/stable`;
export const getStableApi = `${baseUrl}/stable`;
export const createStableApi = `${baseUrl}/stable`;

export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;
export const bulkCreateSessionsApi = `${baseUrl}/session/bulk`;

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

export const cancelFullSessionApi = `${baseUrl}/session/cancelFullSession`;
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
export const plansApi = `${baseUrl}/plan`;
export const assignPlanApi = `${baseUrl}/plan/assign`;
export const revenueStatsApi = `${baseUrl}/revenue/stats`;
export const uploadFileApi = `${baseUrl}/stable/uploadFile`;
export const deleteStableLogoApi = `${baseUrl}/stable/deleteLogo`;
export const getHelpCenterApi = `${baseUrl}/help-center`;
export const updateHelpCenterApi = `${baseUrl}/help-center`;
export const deleteHelpCenterApi = `${baseUrl}/help-center`;
export const getCategoriesApi = `${baseUrl}/categories`;
export const createCategoryApi = `${baseUrl}/categories`;
export const deleteCategoryApi = `${baseUrl}/categories`;
export const getCouponsApi = `${baseUrl}/coupons`;
export const createCouponApi = `${baseUrl}/coupons`;
export const updateCouponApi = (id) => `${baseUrl}/coupons/${id}`;
export const deleteCouponApi = (id) => `${baseUrl}/coupons/${id}`;
export const getLevelsApi = `${baseUrl}/levels`;
export const createLevelApi = `${baseUrl}/levels`;
export const updateLevelApi = (id) => `${baseUrl}/levels/${id}`;
export const deleteLevelApi = (id) => `${baseUrl}/levels/${id}`;
export const getPaymentsApi = `${baseUrl}/payments`;
export const notifyUserApi = `${baseUrl}/users/notify`;
export const notifyAllUsersApi = `${baseUrl}/users/notifyAll`;
export const updateUserLeaveApi = `${baseUrl}/users/leave`;