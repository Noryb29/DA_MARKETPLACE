import express from "express"
import {
  getPriceTrend,
  getAveragePriceByMarket,
  getPriceComparison,
  getPriceVolatility,
  getMarketCoverage,
  getDashboardStats,
  getPriceMatrix,
  getAdminDashboardStats,
  getFarmerDashboardStats,
} from "../controllers/analyticsControllers.js"
import { farmerAuthMiddleware } from "../middleware/authMiddleware.js"

export const analyticsRoutes = express.Router()

analyticsRoutes.get("/trend",        getPriceTrend)           // ?commodity_id=&market_id=&limit=
analyticsRoutes.get("/avg-by-market",getAveragePriceByMarket) // ?commodity_id=
analyticsRoutes.get("/comparison",   getPriceComparison)      // ?market_id=&category_id=
analyticsRoutes.get("/volatility",   getPriceVolatility)      // ?market_id=&category_id=&limit=
analyticsRoutes.get("/market-coverage", getMarketCoverage)    //
analyticsRoutes.get("/stats",        getDashboardStats)       //
analyticsRoutes.get("/matrix",       getPriceMatrix)          // ?category_id=
analyticsRoutes.get("/admin-stats", getAdminDashboardStats)
analyticsRoutes.get("/farmer-stats", farmerAuthMiddleware, getFarmerDashboardStats)

