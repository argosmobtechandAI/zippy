import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const apiFunction = async (api, params = [], data = {}, method, withAuth) => {

  console.log(api)

  let headers = {}
  if (withAuth) {
    const token = await AsyncStorage.getItem('token');
    headers = {
      'Authorization': `Bearer ${token}`
    };
  }

  let response;

  try {
    const url = params.length > 0 ? `${api}/${params.join('/')}` : api;

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
      console.log('API Response:', response.data);
      return response.data;
    } else {
      console.log('API Error:', response);
      return { success: false, message: 'Empty response' };
    }
  } catch (error) {
    console.error('API Request Failed:', error?.response?.data || error.message);
    return error?.response?.data || { success: false, message: 'Network error or unable to reach API' };
  }
}