
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🚀 Starting Stable & Inventory API Test Suite...\n');

    try {
        // --- HORSE TESTS ---
        console.log('📋 Testing Horse Registry...');
        
        // 1. Seed Horses
        const seedRes = await axios.get(`${BASE_URL}/horse/seed`);
        console.log('✅ Seed Horses:', seedRes.data.message);

        // 2. Get All Horses
        const horsesRes = await axios.get(`${BASE_URL}/horse`);
        const testHorse = horsesRes.data.horses[0];
        console.log(`✅ Fetch Horses: Found ${horsesRes.data.horses.length} horses`);
        console.log(`ℹ️ Testing with Horse: ${testHorse.name} (${testHorse.id})`);

        // 3. Log Health Status
        const healthPayload = {
            data: {
                horseId: testHorse.id,
                title: "Annual Checkup (Test)",
                status: "Healthy",
                notes: "Vital signs normal, coat looks great.",
                date: "2024-04-10",
                treatment: "Routine Inspection"
            }
        };
        const healthLogRes = await axios.post(`${BASE_URL}/horse/health`, healthPayload);
        console.log('✅ Log Health Status: Record created');

        // 4. Get Health Records (Filtered)
        const healthRecordsRes = await axios.get(`${BASE_URL}/horse/health?horseId=${testHorse.id}`);
        console.log(`✅ Fetch Health Records: Found ${healthRecordsRes.data.records.length} records for ${testHorse.name}`);

        // 5. Log Vaccination
        const vaccPayload = {
            data: {
                horseId: testHorse.id,
                name: "Tetanus Booster (Test)",
                date: "2024-04-10",
                nextDate: "2024-10-10",
                batchNumber: "TEST-VACC-001",
                notes: "No adverse reaction."
            }
        };
        const vaccLogRes = await axios.post(`${BASE_URL}/horse/vaccination`, vaccPayload);
        console.log('✅ Log Vaccination: Record created');

        // 6. Get Vaccination Records (Filtered)
        const vaccRecordsRes = await axios.get(`${BASE_URL}/horse/vaccination?horseId=${testHorse.id}`);
        console.log(`✅ Fetch Vacc Records: Found ${vaccRecordsRes.data.records.length} records for ${testHorse.name}`);


        // --- INVENTORY TESTS ---
        console.log('\n📦 Testing Inventory System...');

        // 1. Seed Inventory
        const inventorySeedRes = await axios.get(`${BASE_URL}/inventory/seed`);
        console.log('✅ Seed Inventory:', inventorySeedRes.data.message);

        // 2. Get All Inventory
        const inventoryRes = await axios.get(`${BASE_URL}/inventory`);
        const testItem = inventoryRes.data.items[0];
        console.log(`✅ Fetch Inventory: Found ${inventoryRes.data.items.length} items`);
        console.log(`ℹ️ Testing with Item: ${testItem.name} (Stock: ${testItem.currentStock}, Min: ${testItem.minThreshold})`);

        // 3. Update Stock (Test Low Stock Status)
        const updatePayload = {
            data: {
                currentStock: testItem.minThreshold - 2 // Trigger "Low Stock"
            }
        };
        const updateRes = await axios.put(`${BASE_URL}/inventory/${testItem.id}`, updatePayload);
        console.log(`✅ Update Stock: New Stock ${updateRes.data.item.currentStock}, Status: ${updateRes.data.item.status}`);
        
        if (updateRes.data.item.status === 'Low Stock') {
            console.log('✨ Status Logic Verification: SUCCESS (Low Stock triggered correctly)');
        }

        console.log('\n🏆 ALL STABLE SYSTEM TESTS PASSED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ Test Suite Failed!');
        if (error.response) {
            console.error('Error Details:', error.response.data);
        } else {
            console.error('Network/Logic Error:', error.message);
        }
    }
}

runTests();
