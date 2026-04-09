import express from 'express';
import cors from 'cors';
import usersRoute from './routes/usersRoute.js';
import riderRoute from './routes/riderRoute.js';

const app = express();

app.use(cors());

app.use(express.json());

app.use('/api/users', usersRoute);
app.use('/api/rider', riderRoute);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});