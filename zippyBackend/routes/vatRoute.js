import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getHorseByVat, getAllVets } from "../controllers/vatController.js";

const vatRouter = Router();

vatRouter.get("/horse", auth, getHorseByVat)
vatRouter.get("/all", auth, getAllVets)

export default vatRouter;


