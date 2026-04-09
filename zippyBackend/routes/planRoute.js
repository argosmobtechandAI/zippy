import { Router } from "express";
import { createPlan, deletePlan, getPlanById, getPlans, updatePlan } from "../controllers/planController";


const planRouter = Router();

planRouter.get("/", getPlans);
planRouter.get("/:id", getPlanById);
planRouter.post("/", createPlan);
planRouter.put("/:id", updatePlan);
planRouter.delete("/:id", deletePlan);

export default planRouter;