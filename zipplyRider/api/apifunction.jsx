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
  const fullURL = params.length > 0 ? `${api}/${params.join('/')}` : api;

  switch (method) {
    case 'GET':
      response = await axios.get(fullURL, { headers });
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

}