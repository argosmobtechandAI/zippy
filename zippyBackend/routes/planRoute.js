import { Router } from "express";
import { bootstrapPlans, createPlan, deletePlan, getPlanById, getPlans, updatePlan } from "../controllers/planController.js";
import { auth } from "../middleware/auth.js";

const planRouter = Router();

planRouter.get("/", auth, getPlans);
planRouter.get("/bootstrap", bootstrapPlans);
planRouter.get("/:id", auth, getPlanById);
planRouter.post("/", auth, createPlan);
planRouter.put("/:id", auth, updatePlan);
planRouter.delete("/:id", auth, deletePlan);

export default planRouter;