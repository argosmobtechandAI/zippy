const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('http://localhost:3000/api/horse', {
      data: {
        name: "Test Horse",
        location: "Test Location",
        title: "Test Title",
        weight: 500,
        speed: 40,
        age: 5,
        shoeStatus: "Regular",
        diet: "Test Diet",
        imageUrl: "/uploads/test.png"
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
