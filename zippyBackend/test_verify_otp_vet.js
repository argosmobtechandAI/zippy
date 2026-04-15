
async function testVerifyOTP() {
  const mobile = "9355033652";
  const otp = "478963";
  try {
    const response = await fetch('http://localhost:3000/api/users/verifyOTP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { mobile, otp } }),
    });
    
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Payload:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error Message:", error.message);
  }
}

testVerifyOTP();
