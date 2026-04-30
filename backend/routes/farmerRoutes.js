import express from 'express'
import multer from 'multer'
import { addFarm, getCrops, getFarm, getFarms } from '../controllers/farmerControllers.js'
import { farmerAuthMiddleware } from '../middleware/authMiddleware.js'

export const farmerRoutes = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({ storage })

farmerRoutes.post("/addFarm", 
    farmerAuthMiddleware, 
    upload.fields([
        { name: 'farm_image', maxCount: 1 },
        { name: 'farm_docs', maxCount: 3 }
    ]), 
    addFarm
)

farmerRoutes.get("/getFarm", farmerAuthMiddleware, getFarm)
farmerRoutes.get("/getCrops", farmerAuthMiddleware, getCrops)
farmerRoutes.get("/getFarms", farmerAuthMiddleware, getFarms)
