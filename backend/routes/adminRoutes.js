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
  verifyProduct,
  verifyFarm,
} from "../controllers/adminControllers.js";
import { adminAuthMiddleware } from "../middleware/authMiddleware.js";


const adminRoutes = express.Router();

// ==================== MIDDLEWARE AUTH
adminRoutes.use(adminAuthMiddleware)

// ==================== PRODUCT ROUTES ====================
adminRoutes.get("/products", getAllProducts);
adminRoutes.put("/products/:productId/verify", verifyProduct);

// ==================== FARM ROUTES ====================
adminRoutes.get("/farms", getAllFarms);
adminRoutes.put("/farms/:farmId/verify", verifyFarm);

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