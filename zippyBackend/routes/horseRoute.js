import { Router } from "express";
import { createHorse, deleteHorse, getHorseById, getHorses, updateHorse, logHealthStatus, logVaccination, getHealthRecords, getVaccinationRecords, migrateHorseTable, seedHorses } from "../controllers/horseController.js";


const horseRoute = Router();

horseRoute.get("/migrate", migrateHorseTable);
horseRoute.get("/seed", seedHorses);

horseRoute.get("/", getHorses);
horseRoute.get("/health", getHealthRecords);
horseRoute.get("/vaccination", getVaccinationRecords);
horseRoute.get("/:id", getHorseById);
horseRoute.post("/", createHorse);
horseRoute.put("/:id", updateHorse);
horseRoute.delete("/:id", deleteHorse);

// Vet Specific
horseRoute.post("/health", logHealthStatus);
horseRoute.post("/vaccination", logVaccination);

export default horseRoute;