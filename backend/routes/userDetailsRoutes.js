import express from 'express'
import multer from 'multer'
import {
  getUserDetails, createUserDetails, updateUserDetails,
  getFarmerDetails, createFarmerDetails, updateFarmerDetails
} from '../controllers/userDetailsController.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

const upload = multer({ dest: 'uploads/profile_pictures/' })

const userDetailsRouter = express.Router()

userDetailsRouter.get('/me/details', authMiddleware, getUserDetails)
userDetailsRouter.post('/me/details', authMiddleware, upload.single('profile_picture'), createUserDetails)
userDetailsRouter.put('/me/details', authMiddleware, upload.single('profile_picture'), updateUserDetails)

userDetailsRouter.get('/farmer/me/details', farmerAuthMiddleware, getFarmerDetails)
userDetailsRouter.post('/farmer/me/details', farmerAuthMiddleware, upload.single('profile_picture'), createFarmerDetails)
userDetailsRouter.put('/farmer/me/details', farmerAuthMiddleware, upload.single('profile_picture'), updateFarmerDetails)

export default userDetailsRouter