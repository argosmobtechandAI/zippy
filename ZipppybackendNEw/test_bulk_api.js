import dotenv from 'dotenv';
dotenv.config();
import { bulkCreateSessions } from './controllers/sessionController.js';

const mockReq = {
  body: {
    data: {
      startDate: '2026-07-06', // Monday, should be skipped
      endDate: '2026-07-12',   // Sunday
      trainerId: 'cc8b1a11-f685-48d1-baad-ba4ad9406fc5',
      horseId: ['7163f880-de30-468f-be99-338d44ff1eb3'],
      location: 'Zippy Equestrian Center',
      totalSeats: 7
    }
  }
};

const mockRes = {
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    this.data = data;
    console.log(`\n--- TEST COMPLETED with Status Code: ${this.statusCode} ---`);
    console.log("Message:", data.message || (data.success ? "Success" : "Failed"));
    if (data.sessions) {
      console.log(`Created ${data.sessions.length} sessions.`);
      const dates = [...new Set(data.sessions.map(s => s.date))].sort();
      console.log("Unique dates created:", dates);
      
      // Let's verify that July 6 (Monday) is NOT in the dates list
      if (dates.includes('2026-07-06')) {
        console.error("FAIL: Monday July 6 was not skipped!");
      } else {
        console.log("SUCCESS: Monday July 6 was correctly skipped.");
      }
    }
  }
};

async function test() {
  console.log("Starting bulk creation test for date range 2026-07-06 to 2026-07-12...");
  await bulkCreateSessions(mockReq, mockRes);
}

test();
