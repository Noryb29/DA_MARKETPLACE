import express from 'express'
import { addCategory, 
    addCommodity, 
    addMarket, 
    addPriceRecord, 
    deleteCommodity, 
    getCategories, 
    getCommodities, 
    getCommodityPrices, 
    getCrops, 
    getLatestPrices, 
    getMarkets, 
    updateCommodity } from '../controllers/VegetableControllers.js'

export const vegetableRouter = express.Router()

// GET
vegetableRouter.get("/",getCrops)
vegetableRouter.get("/markets",getMarkets)
vegetableRouter.get("/categories",getCategories)
vegetableRouter.get("/commodities",getCommodities)
vegetableRouter.get("/commodity/:id/prices", getCommodityPrices)
vegetableRouter.get("/prices/lates",getLatestPrices)

// POST
vegetableRouter.post("/commodities",addCommodity)
vegetableRouter.post("/prices",addPriceRecord)
vegetableRouter.post("/categories",addCategory)
vegetableRouter.post("/markets",addMarket)

// UPDATE

vegetableRouter.put("/commodities/:id",updateCommodity)
vegetableRouter.delete("/commodities/:id",deleteCommodity)

