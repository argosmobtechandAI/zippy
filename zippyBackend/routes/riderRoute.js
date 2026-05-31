import { Router } from "express";
import { getRider, enrollPack, purchasePlanWithWallet } from "../controllers/riderController.js";
import { auth } from "../middleware/auth.js";

const riderRoute = Router();

riderRoute.get("/", auth, getRider)
riderRoute.post("/enroll", auth, enrollPack)
riderRoute.post("/purchase-plan-wallet", auth, purchasePlanWithWallet)

export default riderRoute;

