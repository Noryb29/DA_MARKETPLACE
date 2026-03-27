import express from 'express'
import { login, getCurrentUser, logout, register } from '../controllers/userControllers.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const userRoutes = express.Router()

// Public routes
userRoutes.post('/login', login)
userRoutes.post('/logout', logout)
userRoutes.post('/register',register)

// Protected routes
userRoutes.get('/me', authMiddleware, getCurrentUser)
