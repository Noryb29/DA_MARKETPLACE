import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import FarmerLayout from "./layouts/FarmerLayout.jsx"

import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/public/Login.jsx";
import FarmerIndex from "./pages/farmer/FarmerIndex.jsx";
import App from "./App.jsx"

import { RequireRole } from "./auth/RequireRole.jsx";
import { RequireGuest } from "./auth/RequireGuest.jsx";
import Register from "./pages/public/Register.jsx";
import Index from "./pages/users/UserIndex.jsx";
import ErrorElement from "./ErrorElement.jsx";
import FarmerAnalytics from "./pages/farmer/FarmerAnalytics.jsx";

import FarmerProduce from "./pages/farmer/FarmerProduce.jsx";

import FarmerOrders from "./pages/farmer/FarmerOrders.jsx";
import FarmerInventory from "./pages/farmer/FarmerInventory.jsx";
import FarmerProfile from "./pages/farmer/FarmerProfile.jsx";
import UserProfile from "./pages/users/UserProfile.jsx";
import UserAnalytics from "./pages/users/UserAnalytics.jsx";
import UserOrders from "./pages/users/UserOrders.jsx";
import UserCart  from "./pages/users/UserCart.jsx";
import FarmerFarm from "./pages/farmer/FarmerFarm.jsx";

export const router = createBrowserRouter([

  {
    element:<App/>,
    path:"/",
    errorElement:<ErrorElement/>
  },
  // 🌐 Public Routes (Login/Register only for guests)
  {
    element: <RequireGuest />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register",element:<Register/>},
        ],
      },
    ],
  },

  // 👤 Buyer Routes (role: user)
  {
    element: <RequireRole role="user" />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "/user/index", element: <Index /> },
          { path:"user/dashboard/profile", element:<UserProfile/>},
          { path: "user/dashboard/orders",element:<UserOrders/>},
          { path:"user/dashboard/analytics",element:<UserAnalytics/>},
          { path:"user/dashboard/cart",element:<UserCart/>}
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
          { path: "/farmer/dashboard/index", element: <FarmerIndex /> }, //FARMER's INDEX PAGE
          { path: "/farmer/dashboard/analytics", element: <FarmerAnalytics/>},
          { path: "/farmer/dashboard/products", element: (
          <FarmerProduce />
            )},
          { path: "/farmer/dashboard/orders", element:<FarmerOrders/>},
          { path: "/farmer/dashboard/inventory", element:<FarmerInventory/>},
          { path: "/farmer/dashboard/profile", element:<FarmerProfile/>},
          { path: "/farmer/dashboard/farm", element:<FarmerFarm/>}
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


]);