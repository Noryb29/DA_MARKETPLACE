import express from 'express'
import {
  getUserDetails, createUserDetails, updateUserDetails,
  getFarmerDetails, createFarmerDetails, updateFarmerDetails
} from '../controllers/userDetailsController.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

const userDetailsRouter = express.Router()

userDetailsRouter.get('/me/details', authMiddleware, getUserDetails)
userDetailsRouter.post('/me/details', authMiddleware, createUserDetails)
userDetailsRouter.put('/me/details', authMiddleware, updateUserDetails)

userDetailsRouter.get('/farmer/me/details', farmerAuthMiddleware, getFarmerDetails)
userDetailsRouter.post('/farmer/me/details', farmerAuthMiddleware, createFarmerDetails)
userDetailsRouter.put('/farmer/me/details', farmerAuthMiddleware, updateFarmerDetails)

export default userDetailsRouter