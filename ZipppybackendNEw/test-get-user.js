import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/users/all');
    const user = res.data.users.find(u => u.type === 'vet' || u.type === 'VET');
    console.log("Found Vet:", user);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
