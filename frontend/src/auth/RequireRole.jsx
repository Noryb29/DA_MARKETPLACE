import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../store/UserStore"

export function RequireRole({ role }) {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  // Still loading auth state
  if (!isAuthenticated && localStorage.getItem('token')) {
    return null
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // Wrong role
  if (user.role !== role) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}