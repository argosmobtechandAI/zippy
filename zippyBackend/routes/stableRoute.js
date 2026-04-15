import express from 'express';
import { createStable, getStables } from '../controllers/stableController.js';
const router = express.Router();

router.post('/', createStable);
router.get('/', getStables);

export default router;
