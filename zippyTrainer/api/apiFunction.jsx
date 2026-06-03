import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const apiFunction = async (api, params = [], data = {}, method, withAuth) => {

  const url = params.length > 0 ? `${api}/${params.join('/')}` : api;

  // ====== REQUEST LOG ======
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 [${method}] ${url}`);
  if (params.length > 0) console.log('📦 Params:', JSON.stringify(params));
  if (data && Object.keys(data).length > 0) console.log('📝 Body Data:', JSON.stringify(data));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let headers = {};
  if (withAuth) {
    const token = await AsyncStorage.getItem('token');
    headers = {
      'Authorization': `Bearer ${token}`
    };
  }

  let response;

  try {
    switch (method) {
      case 'GET':
        response = await axios.get(url, { headers });
        break;
      case 'POST':
        response = await axios.post(url, { data }, { headers });
        break;
      case 'PUT':
        response = await axios.put(url, { data }, { headers });
        break;
      case 'DELETE':
        response = await axios.delete(url, { headers });
        break;
      default:
        throw new Error('Invalid HTTP method');
    }

    if (response) {
      // ====== RESPONSE LOG ======
      console.log(`✅ [${method}] ${url}`);
      console.log('📬 Response:', JSON.stringify(response.data));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      return response.data;
    } else {
      console.log(`⚠️ Empty response for [${method}] ${url}`);
      return { success: false, message: 'Empty response' };
    }
  } catch (error) {
    // ====== ERROR LOG ======
    const errData = error?.response?.data;
    const errStatus = error?.response?.status;
    console.error(`❌ [${method}] ${url}`);
    console.error(`   Status: ${errStatus || 'N/A'}`);
    console.error(`   Error:`, JSON.stringify(errData || error.message));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return errData || { success: false, message: 'Network error or unable to reach API' };
  }
}