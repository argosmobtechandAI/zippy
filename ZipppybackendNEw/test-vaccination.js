import axios from 'axios';

async function test() {
    try {
        const payload = {
            data: {
                horseId: '1c3e16ba-4202-44e1-8b05-41026af05f88', // using a sample horse ID
                name: 'Test Vaccine',
                date: '2026-06-03',
                nextDate: '2026-12-03',
                batchNumber: 'B123456',
                notes: 'Test notes'
            }
        };
        const res = await axios.post('http://localhost:3000/api/horse/vaccination', payload);
        console.log("Success:", res.data);
    } catch (error) {
        console.log("Error status:", error.response?.status);
        console.log("Error data:", error.response?.data);
        console.log("Error message:", error.message);
    }
}
test();
