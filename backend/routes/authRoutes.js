import express from 'express'
import {
  registerUser, registerFarmer,
  loginUser, loginFarmer,
  getCurrentUser, getCurrentFarmer,
  logout
} from '../controllers/authController.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

const authRouter = express.Router()

// Register
authRouter.post('/user/register',   registerUser)
authRouter.post('/farmer/register', registerFarmer)

// Login
authRouter.post('/user/login',   loginUser)
authRouter.post('/farmer/login', loginFarmer)

// Auth check — each store hits its own endpoint with its own middleware
authRouter.get('/me',         authMiddleware,        getCurrentUser)    // UserStore → token → JWT_SECRET_USER
authRouter.get('/farmer/me',  farmerAuthMiddleware,  getCurrentFarmer)  // FarmerAuthStore → farmer_token → JWT_SECRET_FARMER

// Logout
authRouter.post('/logout', logout)

export default authRouter

// in app.js:
// app.use('/api/auth', authRoutes)