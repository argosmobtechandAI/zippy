import axios from 'axios';

async function testUpdate() {
  const horseData = {
    name: "ssdsd",
    location: "Lexington Stables",
    title: "Show Jumping",
    weight: 222,
    speed: 40,
    status: "Available",
    imageUrl: "http://localhost:3000/uploads/test-absolute-url.jpg",
    shoeStatus: "Regular",
    diet: "Standard Alfalfa Mix",
    trainerId: "ac9368bf-b422-4bab-b8b3-1d3bf5245af2",
    age: 111,
    sessions: ["9975f99b-33df-4814-b9bd-5b56a544b282","4d9da0af-c43d-48fa-8d34-32d9d579070d"],
    vaccinationSummary: "sd",
    dewormingRecord: "sdsd",
    healthRemarks: "dsd"
  };

  try {
    const res = await axios.put('http://localhost:3000/api/horse/1c3e16ba-4202-44e1-8b05-41026af05f88', {
      data: horseData
    });
    console.log("Success:", res.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

testUpdate();
