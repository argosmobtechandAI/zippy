import { Router } from "express";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, seedInventory, getInventoryByStableId } from "../controllers/inventoryController.js";
import { auth } from "../middleware/auth.js";

const inventoryRoute = Router();

inventoryRoute.get("/", auth, getInventory);
inventoryRoute.get("/seed", seedInventory);
inventoryRoute.get("/:stableId", auth, getInventoryByStableId);
inventoryRoute.post("/", auth, createInventoryItem);
inventoryRoute.put("/:id", auth, updateInventoryItem);
inventoryRoute.delete("/:id", auth, deleteInventoryItem);

export default inventoryRoute;
