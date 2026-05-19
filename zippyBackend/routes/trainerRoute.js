import { Router } from "express";
import { updateTrainer } from "../controllers/trainerController.js";

const trainerRouter = Router()

trainerRouter.put("/:id", updateTrainer)

export default trainerRouter
