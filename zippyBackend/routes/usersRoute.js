import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getOTP, getUser, login, notifyUser, notifyAllUsers, updateUser, verifyOTP, markNotificationsAsRead, updateLeaveRequest, updateLeave } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import multer from 'multer';
import path from 'path';
import { db } from "../db.js";
import { userTable } from '../schema.js';
import { eq } from 'drizzle-orm';

const usersRoute = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

usersRoute.get('/all', getAllUsers);
usersRoute.get('/', auth, getUser);
usersRoute.post('/', createUser);
usersRoute.post('/login', login);
usersRoute.put('/:id', auth, updateUser);
usersRoute.delete('/:id', auth, deleteUser);
usersRoute.post("/notify/:id", auth, notifyUser);
usersRoute.post("/notify-all", auth, notifyAllUsers);
usersRoute.put("/mark-as-read/:id", auth, markNotificationsAsRead);
usersRoute.post("/getOTP", getOTP);
usersRoute.post("/verifyOTP", verifyOTP);
usersRoute.put("/leave/:id", auth, updateLeave);
usersRoute.put("/leave-request/:riderId/:trainerId", auth, updateLeaveRequest);

usersRoute.post('/profile-picture/:id', auth, upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const profilePictureUrl = `/uploads/${req.file.filename}`;

    const updated = await db.update(userTable)
      .set({ profilePicture: profilePictureUrl })
      .where(eq(userTable.id, id))
      .returning();

    if (!updated.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'Profile picture updated', profilePicture: profilePictureUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default usersRoute;
