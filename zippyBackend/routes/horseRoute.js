import { Router } from "express";
import { createHorse, deleteHorse, getHorseById, getHorses, updateHorse, logHealthStatus, logVaccination, getHealthRecords, getVaccinationRecords, migrateHorseTable, seedHorses, getHorsesByStable, assignVet, assignTrainer } from "../controllers/horseController.js";
import { auth } from "../middleware/auth.js";


const horseRoute = Router();

horseRoute.get("/migrate", migrateHorseTable);
horseRoute.get("/seed", seedHorses);

horseRoute.get("/", auth, getHorses);
horseRoute.get("/health", auth, getHealthRecords);
horseRoute.get("/vaccination", auth, getVaccinationRecords);
horseRoute.get("/:id", auth, getHorseById);
horseRoute.post("/", auth, createHorse);
horseRoute.put("/:id", auth, updateHorse);
horseRoute.delete("/:id", auth, deleteHorse);
horseRoute.get("/stable/:stableId", auth, getHorsesByStable);
horseRoute.put("/assignVet/:horseId", auth, assignVet);
horseRoute.put("/assignTrainer/:horseId", auth, assignTrainer);

// Vet Specific
horseRoute.post("/health", logHealthStatus);
horseRoute.post("/vaccination", logVaccination);

export default horseRoute;