const axios = require('axios');
async function run() {
  try {
    const res = await axios.put('http://localhost:3000/api/horse/1', {
      data: {
        imageUrl: '/uploads/test.jpg'
      }
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
