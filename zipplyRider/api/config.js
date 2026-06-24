import { Platform } from 'react-native';

const liveUrl = "https://api.zippyapp.online";
const localUrl = Platform.OS === 'android' ? "http://10.0.2.2:3000" : "http://localhost:3000";

export const Config = {
  API_BASE_URL: `${liveUrl}/api`
};
