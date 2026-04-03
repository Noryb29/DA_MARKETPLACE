import express from 'express'
import { getAllCrops, getAllFarms,getFarmById,getCropsByFarmId } from '../controllers/marketControllers.js'

export const marketRoutes = express.Router()

marketRoutes.get("/getAllCrops", getAllCrops)


marketRoutes.get('/getAllFarms', getAllFarms)
marketRoutes.get('/farm/:farmId', getFarmById)
marketRoutes.get('/farm/:farmId/crops', getCropsByFarmId)