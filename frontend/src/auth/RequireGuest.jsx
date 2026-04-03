import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../store/UserStore"
import useFarmerAuthStore from "../store/FarmerAuthStore"

export function RequireGuest() {
  const { user, isAuthenticated: userAuth, isCheckingAuth: userChecking } = useUserStore()
  const { farmer, isAuthenticated: farmerAuth, isCheckingAuth: farmerChecking } = useFarmerAuthStore()

  // Wait for both stores to finish verifying tokens
  if (userChecking || farmerChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Farmer is logged in → send to farmer dashboard
  if (farmerAuth && farmer) {
    return <Navigate to="/farmer/dashboard/index" replace />
  }

  // // User is logged in → send to their area
  // if (userAuth && user) {
  //   if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  //   return <Navigate to="/user/index" replace />
  // }

  // Not authenticated → allow through
  return <Outlet />
}