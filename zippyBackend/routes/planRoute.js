import { Router } from "express";
import { bootstrapPlans, createPlan, deletePlan, getPlanById, getPlans, updatePlan } from "../controllers/planController.js";


const planRouter = Router();

planRouter.get("/", getPlans);
planRouter.get("/bootstrap", bootstrapPlans);
planRouter.get("/:id", getPlanById);
planRouter.post("/", createPlan);
planRouter.put("/:id", updatePlan);
planRouter.delete("/:id", deletePlan);

export default planRouter;