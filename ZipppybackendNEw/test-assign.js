import axios from 'axios';
async function run() {
  try {
    const res = await axios.put('http://localhost:3000/api/users/update/6fd20850-99e7-49a2-ac5f-29da07e51bff', { 
      addHorseIds: ['d9d9b6ce-fb1d-4e02-b187-2d2f1e77bf0f'], 
      type: 'vet' 
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
