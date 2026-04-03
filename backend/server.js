import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { farmerRoutes } from './routes/farmerRoutes.js'
import { produceRoutes } from './routes/produceRoutes.js'
import { orderRoutes } from './routes/orderRoutes.js'
import { marketRoutes } from './routes/marketRoutes.js'
import { vegetableRouter } from './routes/VegetableRoutes.js'
import {analyticsRoutes} from './routes/AnalyticsRoutes.js'
import authRouter from './routes/authRoutes.js'


dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

app.use('/api/market', marketRoutes)
app.use('/api/farmers', farmerRoutes)
app.use('/api/produce', produceRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRouter)
app.use('/api/crops',vegetableRouter)
app.use('/api/analytics', analyticsRoutes)  // For simplicity, using the same router for analytics endpoints



app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
  console.log('If Database is not created, please run "npm run database"')
  console.log('To start frontend, navigate to frontend and run "npm run dev"')

})
  

