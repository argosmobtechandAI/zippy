import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const apiFunction = async (api, params = [], data = {}, method, withAuth) => {

  let headers = {}
  if (withAuth) {
    const token = await AsyncStorage.getItem('token');
    headers = {
      'Authorization': `Bearer ${token}`
    };
  }

  let response;
  const fullURL = params.length > 0 ? `${api}/${params.join('/')}` : api;

  console.log(fullURL, "fullURL")

  try {
    switch (method) {
      case 'GET':
        response = await axios.get(fullURL, { headers });
        console.log(response, "hellowos")
        break;
      case 'POST':
        response = await axios.post(fullURL, { data }, { headers });
        break;
      case 'POST_FORM':
        response = await axios.post(fullURL, data, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' }
        });
        break;
      case 'PUT':
        response = await axios.put(fullURL, { data }, { headers });
        break;
      case 'DELETE':
        response = await axios.delete(fullURL, { headers });
        break;
      default:
        throw new Error('Invalid HTTP method');
    }

    if (response) {
      console.log('API Response:', response.data);
      return response.data;
    } else {
      console.log('API Error:', response);
      return null;
    }
  } catch (error) {
    console.log('API Function Error:', error?.response?.data || error);
    const errorMessage = error?.response?.data?.message || error.message || 'An unknown error occurred';
    return { success: false, message: errorMessage };
  }

}