import express from 'express'
import { placeOrder, getMyOrders, getFarmerOrders, approveOrder, rejectOrder } from '../controllers/orderControllers.js'
import { authMiddleware, farmerAuthMiddleware } from '../middleware/authMiddleware.js'

export const orderRoutes = express.Router()

orderRoutes.post('/placeOrder',      authMiddleware, placeOrder)
orderRoutes.get('/getMyOrders',      authMiddleware, getMyOrders)
orderRoutes.get('/getFarmerOrders',  farmerAuthMiddleware, getFarmerOrders)
orderRoutes.post('/approveOrder/:orderId', farmerAuthMiddleware, approveOrder)
orderRoutes.post('/rejectOrder/:orderId',  farmerAuthMiddleware, rejectOrder)


// in app.js:
// app.use('/api/orders', orderRoutes)
