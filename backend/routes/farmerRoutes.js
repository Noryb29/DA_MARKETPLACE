import express from 'express'
import { addFarm, getCrops, getFarm, getFarms } from '../controllers/farmerControllers.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const farmerRoutes = express.Router()

farmerRoutes.post("/addFarm", authMiddleware, addFarm)

farmerRoutes.get("/getFarm",authMiddleware,getFarm)
farmerRoutes.get("/getCrops",authMiddleware,getCrops)
farmerRoutes.get("/getFarms",authMiddleware,getFarms)
