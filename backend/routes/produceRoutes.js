import express from 'express'
import { farmerAuthMiddleware } from '../middleware/authMiddleware.js'
import { getCrops,addCrop,updateCrop,deleteCrop } from '../controllers/produceControllers.js'
import { getAllCrops } from '../controllers/produceControllers.js'

export const produceRoutes = express.Router()

produceRoutes.get('/getCrops', farmerAuthMiddleware, getCrops)
produceRoutes.post('/addCrop', farmerAuthMiddleware, addCrop)
produceRoutes.put('/updateCrop/:crop_id', farmerAuthMiddleware, updateCrop)
produceRoutes.delete('/deleteCrop/:crop_id', farmerAuthMiddleware, deleteCrop)
produceRoutes.get('/getAllCrops',getAllCrops)



