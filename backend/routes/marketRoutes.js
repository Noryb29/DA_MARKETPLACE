import express from 'express'
import { getAllCrops, getAllFarms, getFarmById, getCropsByFarmId } from '../controllers/marketControllers.js'

export const marketRoutes = express.Router()

// Get all crops
marketRoutes.get('/getAllCrops', getAllCrops)

// Get all farms
marketRoutes.get('/getAllFarms', getAllFarms)

// Get single farm by ID - MUST come before /farm/:farmId/crops
marketRoutes.get('/farm/:farmId', getFarmById)

// Get crops by farm ID
marketRoutes.get('/farm/:farmId/crops', getCropsByFarmId)