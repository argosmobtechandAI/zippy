import express from "express";
import { getGlobalStats, getStableStats, getRevenueStats } from "../controllers/statsController.js";
import { auth } from "../middleware/auth.js";

const statsRouter = express.Router();

statsRouter.get("/global", auth, getGlobalStats);
statsRouter.get("/stable/:stableId", auth, getStableStats);
statsRouter.get("/revenue", auth, getRevenueStats);

export default statsRouter;
