

import axios from 'axios';

export const apiFunction = async (api, params = [], data = {}, method, withAuth) => {


    let headers = {}
    if (withAuth) {
        const token = localStorage.getItem('token');
        headers = {
            'Authorization': `Bearer ${token}`
        };
    }

    let response;

    const url = params.length > 0 ? `${api}/${params.join('/')}` : api;

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
            console.log('API Response:', response.data);
            return response.data;
        }
    } catch (error) {
        console.error('API Function Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'An unknown error occurred';
        return { success: false, message: errorMessage };
    }
    return null;

}