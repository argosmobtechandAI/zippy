import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getOTP, getUser, login, notifyUser, notifyAllUsers, updateUser, verifyOTP, markNotificationsAsRead } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const usersRoute = Router();

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

export default usersRoute;
