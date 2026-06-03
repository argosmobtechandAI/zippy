import axios from 'axios';

async function testUpdate() {
  try {
    const res = await axios.put('http://localhost:3000/api/horse/8213687d-643f-4216-a4d6-94b3966aa46b', {
      data: {
        imageUrl: '/uploads/test-image-update.jpg',
        sessions: ["9975f99b-33df-4814-b9bd-5b56a544b282"]
      }
    });
    console.log("Success:", res.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

testUpdate();
