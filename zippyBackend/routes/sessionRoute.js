import { Router } from "express";
import { createSession, deleteSession, getSessionById, getSessions, updateAttendance, updateSession, updateSessionStatus } from "../controllers/sessionController.js";
import { auth } from "../middleware/auth.js";

const sessionRouter = Router();

sessionRouter.get("/", getSessions);
sessionRouter.get("/:id", getSessionById);
sessionRouter.post("/", createSession);
sessionRouter.put("/:id", updateSession);
sessionRouter.delete("/:id", deleteSession);
sessionRouter.put("/status/:userId/:sessionId", auth, updateSessionStatus);
sessionRouter.put("/attendance/:sessionId/:riderId", auth, updateAttendance);

export default sessionRouter