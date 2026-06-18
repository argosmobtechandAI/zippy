import { getHorseByVat } from './controllers/vatController.js';

async function run() {
  const req = { userId: '6fd20850-99e7-49a2-ac5f-29da07e51bff' };
  const res = {
    json: (data) => console.log("Response:", JSON.stringify(data, null, 2)),
    status: (code) => {
        console.log("Status:", code);
        return { json: (data) => console.log("Response:", JSON.stringify(data, null, 2)) };
    }
  };
  await getHorseByVat(req, res);
}
run();
