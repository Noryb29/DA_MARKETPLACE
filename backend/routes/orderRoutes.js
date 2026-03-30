import express from 'express'
import { placeOrder, getMyOrders, getFarmerOrders } from '../controllers/orderControllers.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

export const orderRoutes = express.Router()

orderRoutes.post('/placeOrder',      authMiddleware, placeOrder)
orderRoutes.get('/getMyOrders',      authMiddleware, getMyOrders)
orderRoutes.get('/getFarmerOrders',  farmerAuthMiddleware, getFarmerOrders)


// in app.js:
// app.use('/api/orders', orderRoutes)
