import express from "express";
import {
  getAllProducts,
  getAllFarms,
  getAllUsers,
  updateUser,
  getAllFarmers,
  updateFarmer,
  getAllOrders,
  getOrderById,
} from "../controllers/adminControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
// import { adminauthMiddleware } from "../middleware/authMiddleware.js";


const adminRoutes = express.Router();

// ==================== MIDDLEWARE AUTH
adminRoutes.use(authMiddleware)

// ==================== PRODUCT ROUTES ====================
adminRoutes.get("/products", getAllProducts);

// ==================== FARM ROUTES ====================
adminRoutes.get("/farms", getAllFarms);

// ==================== USER ROUTES ====================
adminRoutes.get("/users", getAllUsers);
adminRoutes.put("/users/:userId", updateUser);

// ==================== FARMER ROUTES ====================
adminRoutes.get("/farmers", getAllFarmers);
adminRoutes.put("/farmers/:farmerId", updateFarmer);

// ==================== ORDER ROUTES ====================
adminRoutes.get("/orders", getAllOrders);
adminRoutes.get("/orders/:orderId", getOrderById);

export default adminRoutes;