import express from 'express'
import { getAllCrops } from '../controllers/marketControllers.js'

export const marketRoutes = express.Router()

marketRoutes.get("/getAllCrops",getAllCrops)