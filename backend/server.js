import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { farmerRoutes } from './routes/farmerRoutes.js'
import { produceRoutes } from './routes/produceRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'
import { marketRoutes } from './routes/marketRoutes.js'
import { vegetableRouter } from './routes/vegetableRoutes.js'
import {analyticsRoutes} from './routes/analyticsRoutes.js'
import authRouter from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.use('/api/market', marketRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/produce', produceRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRouter)
app.use('/api/crops',vegetableRouter)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Using Neon DB: ${process.env.PGDATABASE}`)
  console.log('If tables not created, run "npm run database"')
  console.log('For frontend: cd frontend && npm run dev')
})

