import { Router } from "express";
import { createHorse, deleteHorse, getHorseById, getHorses, updateHorse } from "../controllers/horseController";


const horseRoute = Router();

horseRoute.get("/", getHorses);
horseRoute.get("/:id", getHorseById);
horseRoute.post("/", createHorse);
horseRoute.put("/:id", updateHorse);
horseRoute.delete("/:id", deleteHorse);

export default horseRoute;