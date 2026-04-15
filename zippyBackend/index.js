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

import { runHorseMigrations } from './controllers/horseController.js';
import { runInventoryMigrations } from './controllers/inventoryController.js';
import { runTrainerMigrations } from './controllers/userController.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/users', usersRoute);
app.use('/api/rider', riderRoute);
app.use('/api/horse', horseRoute);
app.use('/api/plan', planRoute);
app.use('/api/session', sessionRoute);
app.use('/api/stable', stableRoute);
app.use('/api/stats', statsRoute);
app.use('/api/inventory', inventoryRoute);

// Auto-migrate schema on startup
runHorseMigrations();
runInventoryMigrations();
runTrainerMigrations();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});