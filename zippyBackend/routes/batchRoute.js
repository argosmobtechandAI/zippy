import { Router } from "express";
import { createBatch, getAllBatches, updateBatch, deleteBatch } from "../controllers/batchController.js";

const batchRouter = Router();

batchRouter.post("/", createBatch);
batchRouter.get("/", getAllBatches);
batchRouter.put("/:id", updateBatch);
batchRouter.delete("/:id", deleteBatch);

export default batchRouter;