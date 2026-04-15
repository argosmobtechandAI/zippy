import { Router } from "express";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, seedInventory } from "../controllers/inventoryController.js";

const inventoryRoute = Router();

inventoryRoute.get("/", getInventory);
inventoryRoute.get("/seed", seedInventory);
inventoryRoute.post("/", createInventoryItem);
inventoryRoute.put("/:id", updateInventoryItem);
inventoryRoute.delete("/:id", deleteInventoryItem);

export default inventoryRoute;
