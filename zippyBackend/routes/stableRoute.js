import express from 'express';
import { createStable, deleteStable, getStable, getStables, updateStable } from '../controllers/stableController.js';
import { auth } from '../middleware/auth.js';
const router = express.Router();

router.post('/', auth, createStable);
router.put('/:id', auth, updateStable);
router.get('/', auth, getStables);
router.get('/single', auth, getStable);
router.delete('/:id', auth, deleteStable);

export default router;
