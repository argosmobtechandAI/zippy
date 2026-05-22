import express from 'express';
import cors from 'cors';
import usersRoute from './routes/usersRoute.js';
import riderRoute from './routes/riderRoute.js';
import horseRoute from './routes/horseRoute.js';
import planRoute from './routes/planRoute.js';
import sessionRoute from './routes/sessionRoute.js';
import stableRoute from './routes/stableRoute.js';
import statsRoute from './routes/statsRoute.js';
import inventoryRoute from './routes/inventoryRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import vatRouter from './routes/vatRoute.js';
import revenueRouter from './routes/revenueRoute.js';
import trainerRouter from './routes/trainerRoute.js';

const app = express();

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/users', usersRoute);
app.use('/api/rider', riderRoute);
app.use('/api/horse', horseRoute);
app.use('/api/plan', planRoute);
app.use('/api/session', sessionRoute);
app.use('/api/stable', stableRoute);
app.use('/api/stats', statsRoute);
app.use('/api/inventory', inventoryRoute);
app.use("/api/vat", vatRouter)
app.use("/api/revenue", revenueRouter)
app.use("/api/trainer", trainerRouter)





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});