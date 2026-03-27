import express from 'express'
import cors from 'cors'
import { userRoutes } from './routes/userRoutes.js'
import dotenv from 'dotenv'
import { farmerRoutes } from './routes/farmerRoutes.js'
import { produceRoutes } from './routes/produceRoutes.js'
import { marketRoutes } from './routes/marketRoutes.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT

app.use(cors())
app.use(express.json())

app.use('/api/market',marketRoutes)
app.use('/api/users', userRoutes)
app.use('/api/farmers',farmerRoutes)
app.use('/api/produce',produceRoutes)

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
