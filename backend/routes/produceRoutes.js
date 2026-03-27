import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getCrops,addCrop,updateCrop,deleteCrop } from '../controllers/produceControllers.js'

export const produceRoutes = express.Router()

produceRoutes.get('/getCrops',authMiddleware,getCrops)
produceRoutes.post('/addCrop', authMiddleware, addCrop)
produceRoutes.put('/updateCrop/:crop_id', authMiddleware, updateCrop)
produceRoutes.delete('/deleteCrop/:crop_id', authMiddleware, deleteCrop)



