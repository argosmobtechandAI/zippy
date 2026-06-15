import fs from 'fs';

// Configuration
const trainerId = 'cc8b1a11-f685-48d1-baad-ba4ad9406fc5'; // Vishwa Premlal
const horseId = '7163f880-de30-468f-be99-338d44ff1eb3'; // Barringo
const location = 'Zippy Equestrian Center';
const totalSeats = 7;
const duration = '45 Min';
const status = 'ACTIVE';

const morningSlots = [
  { title: 'Morning 6:00 AM', timing: '06:00 - 06:45' },
  { title: 'Morning 7:00 AM', timing: '07:00 - 07:45' },
  { title: 'Morning 8:00 AM', timing: '08:00 - 08:45' }
];

const eveningSlots = [
  { title: 'Evening 4:00 PM', timing: '16:00 - 16:45' },
  { title: 'Evening 5:00 PM', timing: '17:00 - 17:45' },
  { title: 'Evening 6:00 PM', timing: '18:00 - 18:45' }
];

const allSlots = [...morningSlots, ...eveningSlots];

// Week 1 (next week): June 22 to June 28, 2026
// Week 2 (week after): June 29 to July 5, 2026

function generateDates(tuesdayToFridayOnly) {
  const dates = [];
  const weekStartDates = ['2026-06-22', '2026-06-29'];
  
  for (const startDateStr of weekStartDates) {
    const start = new Date(startDateStr);
    // 0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday
    const daysToInclude = tuesdayToFridayOnly ? [1, 2, 3, 4] : [0, 1, 2, 3, 4];
    
    for (const offset of daysToInclude) {
      const d = new Date(start);
      d.setDate(start.getDate() + offset);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
  }
  return dates;
}

function generateSQL(tuesdayToFridayOnly) {
  const dates = generateDates(tuesdayToFridayOnly);
  let sql = `-- SQL Insert script for next two weeks (Tuesday-Friday only: ${tuesdayToFridayOnly})\n`;
  
  dates.forEach(date => {
    sql += `\n-- Slots for ${date}\n`;
    allSlots.forEach(slot => {
      sql += `INSERT INTO sessions (title, timing, date, joining_amount, trainers, horse, participants, duration, location, total_seats, status) VALUES ('${slot.title}', '${slot.timing}', '${date}', 0, '${trainerId}', '${horseId}', '[]'::jsonb, '${duration}', '${location}', ${totalSeats}, '${status}');\n`;
    });
  });
  return sql;
}

const sqlTueFri = generateSQL(true);
const sqlMonFri = generateSQL(false);

fs.writeFileSync('tuesday_friday_slots.sql', sqlTueFri);
fs.writeFileSync('monday_friday_slots.sql', sqlMonFri);

console.log("SQL script files successfully generated:");
console.log("- tuesday_friday_slots.sql (Tuesday-Friday only)");
console.log("- monday_friday_slots.sql (Monday-Friday)");
