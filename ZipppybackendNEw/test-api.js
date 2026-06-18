import axios from 'axios';
async function run() {
  try {
    const horseRes = await axios.get('http://localhost:3000/api/horse');
    const horses = horseRes.data.horses;
    console.log("HORSES VAT IDs:", horses.map(h => ({id: h.id, vatId: h.vatId})));
  } catch (err) {
    console.error(err.message);
  }
}
run();
