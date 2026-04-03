import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import FarmerLayout from "./layouts/FarmerLayout.jsx"

import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/public/Login.jsx"
import Register from "./pages/public/Register.jsx";
import App from "./App.jsx"

import { RequireRole } from "./auth/RequireRole.jsx";
import { RequireGuest } from "./auth/RequireGuest.jsx";

import Index from "./pages/users/UserIndex.jsx";
import ErrorElement from "./ErrorElement.jsx";
import FarmerAnalytics from "./pages/farmer/FarmerAnalytics.jsx";
import FarmerProduce from "./pages/farmer/FarmerProduce.jsx";
import FarmerIndex from "./pages/farmer/FarmerIndex.jsx";
import FarmerOrders from "./pages/farmer/FarmerOrders.jsx";
import FarmerInventory from "./pages/farmer/FarmerInventory.jsx";
import FarmerProfile from "./pages/farmer/FarmerProfile.jsx";
import FarmerFarm from "./pages/farmer/FarmerFarm.jsx";
import UserProfile from "./pages/users/UserProfile.jsx";
import UserAnalytics from "./pages/users/UserAnalytics.jsx";
import UserOrdersPage from "./pages/users/UserOrdersPage.jsx"
import ShoppingPage from "./pages/public/ShoppingPage.jsx";
import UserShoppingPage from "./pages/users/UserShoppingPage.jsx";
import PriceMonitoring from "./pages/price_monitoring/PriceMonitoring.jsx";
import ShopDashboard from "./pages/public/ShopDashboard.jsx";
import FarmsPage from "./pages/public/FarmsPage.jsx";
import FarmDetailsPage from "./pages/public/components/FarmDetailsPage.jsx";

export const router = createBrowserRouter([

  {
    path: "/",
    element: <App />,
    errorElement: <ErrorElement />
  },

  // 🌐 Public Routes — guests only (redirect if already logged in)
  {
    element: <RequireGuest />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/login",           element: <Login /> },
          { path: "/register",        element: <Register /> },
          { path: "/shop/dashboard",  element: <ShopDashboard /> },
          { path: "/shop/products",   element: <ShoppingPage /> },
          { path: "/shop/farms",      element:<FarmsPage/>},
          { path: "/shop/farm/:id", element: <FarmDetailsPage/>},
          { path: "/shop/price_monitoring", element: <PriceMonitoring/>}
        ],
      },
    ],
  },

  // 👤 User Routes
  {
    element: <RequireRole role="user" />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/user/index",              element: <Index /> },
          { path: "/user/dashboard/profile",  element: <UserProfile /> },
          { path: "/user/dashboard/orders",   element: <UserOrdersPage /> },
          { path: "/user/dashboard/analytics",element: <UserAnalytics /> },
          { path: "/user/shop",               element: <UserShoppingPage /> },
        ],
      },
    ],
  },

  // 👨‍🌾 Farmer Routes
  {
    element: <RequireRole role="farmer" />,
    children: [
      {
        element: <FarmerLayout />,
        children: [
          { path: "/farmer/dashboard/index",     element: <FarmerIndex /> },
          { path: "/farmer/dashboard/analytics", element: <FarmerAnalytics /> },
          { path: "/farmer/dashboard/products",  element: <FarmerProduce /> },
          { path: "/farmer/dashboard/orders",    element: <FarmerOrders /> },
          { path: "/farmer/dashboard/inventory", element: <FarmerInventory /> },
          { path: "/farmer/dashboard/profile",   element: <FarmerProfile /> },
          { path: "/farmer/dashboard/farm",      element: <FarmerFarm /> },
        ],
      },
    ],
  },

  // 🛠️ Admin Routes
  {
    element: <RequireRole role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/dashboard", element: <Dashboard /> },
        ],
      },
    ],
  },

])