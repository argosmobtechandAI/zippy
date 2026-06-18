import axios from 'axios';
import jwt from 'jsonwebtoken';
async function run() {
  try {
    const token = jwt.sign({ id: 'd747d79b-0ab7-47b7-bdc1-ffcd2b47eaec', type: 'admin' }, 'zippy@admin', { expiresIn: '1d' });
    const { data } = await axios.get('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const vansh = data.users.find(u => u.email === 'vansh1@gmail.com');
    console.log("VANSH ID:", vansh.id, "VET ID:", vansh.vetId);
    const res = await axios.put(`http://localhost:3000/api/users/${vansh.id}`, 
        { addHorseIds: ['7163f880-de30-468f-be99-338d44ff1eb3'], type: 'vet' }, 
        { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log("ASSIGN RES:", res.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
