import express from 'express'
import { addFarm,getFarm } from '../controllers/farmerControllers.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const farmerRoutes = express.Router()

farmerRoutes.post("/addFarm", authMiddleware, addFarm)
farmerRoutes.get("/farm", authMiddleware, getFarm)
