import express from 'express';
import { createStable, deleteLogo, deleteStable, getStable, getStables, updateStable, uploadLogo } from '../controllers/stableController.js';
import { auth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/', auth, createStable);
router.put('/:id', auth, updateStable);
router.get('/', auth, getStables);
router.get('/single', auth, getStable);
router.delete('/:id', auth, deleteStable);
router.post('/uploadFile', auth, upload.single('file'), uploadLogo);
router.delete('/deleteLogo/:id', auth, deleteLogo);

export default router;
