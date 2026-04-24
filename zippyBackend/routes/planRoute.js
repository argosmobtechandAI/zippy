import { Router } from "express";
import { bootstrapPlans, createPlan, createRazorPayOrder, deletePlan, getPlanById, getPlans, updatePlan, verifyRazorPayOrder } from "../controllers/planController.js";
import { auth } from "../middleware/auth.js";

const planRouter = Router();

planRouter.get("/", auth, getPlans);
planRouter.get("/bootstrap", bootstrapPlans);
planRouter.get("/:id", auth, getPlanById);
planRouter.post("/", auth, createPlan);
planRouter.put("/:id", auth, updatePlan);
planRouter.delete("/:id", auth, deletePlan);
planRouter.post("/createOrder", auth, createRazorPayOrder);
planRouter.post("/verifyPayment", auth, verifyRazorPayOrder);



export default planRouter;