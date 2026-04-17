import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getHorseByVat } from "../controllers/vatController.js";

const vatRouter = Router();

vatRouter.get("/horse", auth, getHorseByVat)

export default vatRouter;


