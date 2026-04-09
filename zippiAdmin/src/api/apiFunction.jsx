

import axios from 'axios';

export const apiFunction = async (api, params = [], data = {}, method, withAuth) => {

    console.log(api)

    let headers = {}
    if (withAuth) {
        const token = localStorage.getItem('token');
        headers = {
            'Authorization': `Bearer ${token}`
        };
    }

    let response;

    switch (method) {
        case 'GET':
            response = await axios.get(`${api}/${params.join('/')}`, { headers });
            break;
        case 'POST':
            response = await axios.post(`${api}/${params.join('/')}`, { data }, { headers });
            break;

        case 'PUT':
            response = await axios.put(`${api}/${params.join('/')}`, { data }, { headers });
            break;
        case 'DELETE':
            response = await axios.delete(`${api}/${params.join('/')}`, { headers });
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