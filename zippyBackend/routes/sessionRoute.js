import { Router } from "express";
import { createSession, deleteSession, getSessionById, getSessions, updateAttendance, updateSession, updateSessionStatus, cancelBooking } from "../controllers/sessionController.js";
import { auth } from "../middleware/auth.js";

const sessionRouter = Router();

sessionRouter.get("/", auth, getSessions);
sessionRouter.get("/:id", auth, getSessionById);

sessionRouter.post("/", auth, createSession);
sessionRouter.put("/:id", auth, updateSession);
sessionRouter.put("/cancel/:id", auth, cancelBooking);
sessionRouter.delete("/:id", auth, deleteSession);
sessionRouter.put("/status/:userId/:sessionId", auth, updateSessionStatus);
sessionRouter.put("/attendance/:sessionId/:riderId", auth, updateAttendance);

export default sessionRouter