import { Router } from "express";
import { getRevenueStats } from "../controllers/revenueController.js";
import { auth } from "../middleware/auth.js";

const revenueRouter = Router();

revenueRouter.get("/stats", auth, getRevenueStats);

export default revenueRouter;