import axios from 'axios';

async function run() {
  try {
    const res = await axios.get('http://localhost:3000/api/vat/horse', {
       headers: { Authorization: 'Bearer 6fd20850-99e7-49a2-ac5f-29da07e51bff' } // Wait, how is vat/horse authenticated? By req.userId!
    });
    console.log("Horses in vat/horse:", JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.response?.data || e);
  }
}
run();
