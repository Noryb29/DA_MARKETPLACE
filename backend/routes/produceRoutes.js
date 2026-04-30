import express from 'express'
import multer from 'multer'
import { farmerAuthMiddleware } from '../middleware/authMiddleware.js'
import { getCrops,addCrop,updateCrop,deleteCrop } from '../controllers/produceControllers.js'
import { getAllCrops } from '../controllers/produceControllers.js'

const upload = multer({ dest: 'uploads/' })

export const produceRoutes = express.Router()

produceRoutes.get('/getCrops', farmerAuthMiddleware, getCrops)
produceRoutes.post('/addCrop', farmerAuthMiddleware, upload.single('harvest_photo'), addCrop)
produceRoutes.put('/updateCrop/:crop_id', farmerAuthMiddleware, upload.single('harvest_photo'), updateCrop)
produceRoutes.delete('/deleteCrop/:crop_id', farmerAuthMiddleware, deleteCrop)
produceRoutes.get('/getAllCrops',getAllCrops)



