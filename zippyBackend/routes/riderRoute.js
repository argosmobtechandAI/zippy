import { Router } from "express";
import { getRider, enrollPack } from "../controllers/riderController.js";
import { auth } from "../middleware/auth.js";

const riderRoute = Router();

riderRoute.get("/", auth, getRider)
riderRoute.post("/enroll", auth, enrollPack)

export default riderRoute;

