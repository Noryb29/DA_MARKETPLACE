import express from 'express'
import {
  registerUser, registerFarmer,
  login, loginUser, loginFarmer,
  getCurrentUser, getCurrentFarmer,
  logout
} from '../controllers/authController.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/farmer/register', registerFarmer)

authRouter.post('/login', login)
authRouter.post('/user/login', loginUser)
authRouter.post('/farmer/login', loginFarmer)

authRouter.get('/me', authMiddleware, getCurrentUser)
authRouter.get('/farmer/me', farmerAuthMiddleware, getCurrentFarmer)

authRouter.post('/logout', logout)

export default authRouter