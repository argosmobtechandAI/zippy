import axios from 'axios';
async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/horse');
    console.log(res.data.horses[0]);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
