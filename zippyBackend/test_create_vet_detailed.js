
import { db } from "./db.js";
import { userTable } from "./schema.js";

async function testCreateVet() {
  const formData = {
    name: "Test Vet 2",
    email: "testvet2@example.com",
    mobile: "1122334455",
    dob: "1990-01-01",
    age: 33,
    weight: 70,
    type: "vet",
    emergencyContact: "0987654321",
    status: "ACTIVE"
  };

  try {
    const newUser = await db.insert(userTable).values({ 
        name: formData.name, 
        mobile: formData.mobile, 
        type: formData.type, 
        email: formData.email, 
        dob: formData.dob, 
        age: formData.age, 
        weight: formData.weight, 
        emergencyContact: formData.emergencyContact, 
        status: formData.status
    }).returning();
    console.log("Success:", newUser);
  } catch (error) {
    console.log("Error Detail:", error.detail);
    console.log("Error Code:", error.code);
    console.log("Error Message:", error.message);
    console.log("Full Error:", JSON.stringify(error, null, 2));
  } finally {
    process.exit();
  }
}

testCreateVet();
