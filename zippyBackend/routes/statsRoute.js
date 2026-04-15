import express from "express";
import { getGlobalStats, getStableStats, getRevenueStats } from "../controllers/statsController.js";

const statsRouter = express.Router();

statsRouter.get("/global", getGlobalStats);
statsRouter.get("/stable/:stableId", getStableStats);
statsRouter.get("/revenue", getRevenueStats);

export default statsRouter;
