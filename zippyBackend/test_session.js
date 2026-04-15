async function test() {
  try {
    const data = {
      title: "Test API Session",
      startTime: "09:00",
      endTime: "10:30",
      date: "2026-10-04",
      joiningAmount: 100,
      trainerId: "40d7c3d1-0f7b-4024-8eaa-c29cfce7c3f3", 
      horseId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      duration: "90 Min",
      location: "Lexington Stables",
      totalSeats: 10,
      timing: "09:00 - 10:30"
    };

    const res = await fetch('http://localhost:3000/api/session', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ data })
    });
    
    const json = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(json, null, 2));
  } catch (err) {
    console.log("Error:", err.message);
  }
}
test();
