import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getOTP, getUser, updateUser, verifyOTP } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const usersRoute = Router();

usersRoute.get('/all', getAllUsers);
usersRoute.get('/', auth, getUser);
usersRoute.post('/', createUser);
usersRoute.put('/:id', auth, updateUser);
usersRoute.delete('/:id', auth, deleteUser);
usersRoute.post("/getOTP", getOTP);
usersRoute.post("/verifyOTP", verifyOTP);

export default usersRoute;
