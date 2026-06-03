const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('http://localhost:3000/api/upload-local', {
      base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      fileName: "test.png",
      mimeType: "image/png"
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
