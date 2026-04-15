import { Router } from "express";
import { createSession, deleteSession, getSessionById, getSessions, updateSession } from "../controllers/sessionController.js";

const sessionRouter = Router();

sessionRouter.get("/", getSessions);
sessionRouter.get("/:id", getSessionById);
sessionRouter.post("/", createSession);
sessionRouter.put("/:id", updateSession);
sessionRouter.delete("/:id", deleteSession);

export default sessionRouter