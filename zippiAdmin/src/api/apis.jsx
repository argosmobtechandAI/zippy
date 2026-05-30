// const baseUrl = "https://zippy-wg71.onrender.com/api"
const baseUrl = "https://api.zippyapp.online/api";
// const baseUrl = "http://localhost:3000/api";

export const getAllUsersApi = `${baseUrl}/users/all`;
export const getUserApi = `${baseUrl}/users`;
export const createUserApi = `${baseUrl}/users`;
export const loginApi = `${baseUrl}/users/login`;
export const updateUserApi = `${baseUrl}/users`;
export const deleteUserApi = `${baseUrl}/users`;
export const notifyUserApi = (userId) => `${baseUrl}/users/notify/${userId}`;
export const notifyAllUsersApi = `${baseUrl}/users/notify-all`;
export const updateUserLeaveApi = `${baseUrl}/users/userLeave`
export const markNotificationsAsReadApi = (userId) => `${baseUrl}/users/mark-as-read/${userId}`;

export const getAllStablesApi = `${baseUrl}/stable`;
export const createStableApi = `${baseUrl}/stable`;
export const updateStableApi = `${baseUrl}/stable`;
export const deleteStableApi = `${baseUrl}/stable`;
export const getAllSessionsApi = `${baseUrl}/session`;
export const createSessionApi = `${baseUrl}/session`;
export const updateSessionApi = `${baseUrl}/session`;
export const approveSessionApi = `${baseUrl}/session/status`
export const deleteSessionApi = `${baseUrl}/session`;

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
export const revenueStatsApi = `${baseUrl}/revenue/stats`;
export const updateTrainerApi = `${baseUrl}/trainer`;
export const uploadFileApi = `${baseUrl}/stable/uploadFile`;
export const deleteStableLogoApi = `${baseUrl}/stable/deleteLogo`;
