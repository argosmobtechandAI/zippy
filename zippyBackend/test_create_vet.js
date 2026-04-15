
async function testCreateVet() {
  const formData = {
    name: "Test Vet",
    email: "testvet@example.com",
    mobile: "1234567890",
    dob: "1990-01-01",
    age: 33,
    weight: 70,
    type: "vet",
    emergencyContact: "0987654321",
    status: "ACTIVE"
  };

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: formData }),
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Payload:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error Message:", error.message);
  }
}

testCreateVet();
