import { Router } from "express";
import { getRider } from "../controllers/riderController.js";
import { auth } from "../middleware/auth.js";

const riderRoute = Router();

riderRoute.get("/", auth, getRider)

export default riderRoute;

