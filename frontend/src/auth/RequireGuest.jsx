import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../store/UserStore"

export function RequireGuest() {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth)

  // Still checking auth state - show blank page while loading
  if (isCheckingAuth) {
    return <div className="min-h-screen bg-gray-50" />
  }

  // User is authenticated, redirect to their dashboard
  if (isAuthenticated && user) {
    if (user.role === 'user') {
      return <Navigate to="/" replace />
    } else if (user.role === 'farmer') {
      return <Navigate to="/farmer/dashboard/index" replace />
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  // User is not authenticated, allow access to login/register
  return <Outlet />
}
