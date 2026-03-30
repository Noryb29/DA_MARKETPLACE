import express from 'express'
import { addFarm, getCrops, getFarm, getFarms } from '../controllers/farmerControllers.js'
import { farmerAuthMiddleware } from '../middleware/authMiddleware.js'

export const farmerRoutes = express.Router()

farmerRoutes.post("/addFarm", farmerAuthMiddleware, addFarm)

farmerRoutes.get("/getFarm", farmerAuthMiddleware, getFarm)
farmerRoutes.get("/getCrops", farmerAuthMiddleware, getCrops)
farmerRoutes.get("/getFarms", farmerAuthMiddleware, getFarms)
