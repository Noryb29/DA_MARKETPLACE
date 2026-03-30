import { Navigate, Outlet } from "react-router-dom"
import useUserStore from "../store/UserStore"
import useFarmerAuthStore from "../store/FarmerAuthStore"
import Swal from "sweetalert2"

export function RequireRole({ role }) {
  const { user, isAuthenticated: userAuth, isCheckingAuth: userChecking } = useUserStore()
  const { farmer, isAuthenticated: farmerAuth, isCheckingAuth: farmerChecking } = useFarmerAuthStore()

  // ── Farmer routes ──────────────────────────────────────────────────────────
  if (role === 'farmer') {
    if (farmerChecking) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (!farmerAuth || !farmer) 
      return (
    Swal.fire({
      title:'User Not Authenticated',
      text:'Please Login First'
    }),
    <Navigate to="/login" replace />)
    return <Outlet />
  }

  // ── Admin routes ───────────────────────────────────────────────────────────
  if (role === 'admin') {
    if (userChecking) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (!userAuth || !user) 
      return (
    Swal.fire({
      icon:'error',
      title:'User Not Authenticated',
      text:'Please Login First'
    }),
      <Navigate to="/login" replace />
    )

    if (user.role !== 'admin') return (
    Swal.fire({
      icon:'error',
      title:'User Not Authenticated',
      text:'Please Login First'
    }),
      <Navigate to="/login" replace />
    )
    return <Outlet />
  }

  // ── User routes ────────────────────────────────────────────────────────────
  if (role === 'user') {
    if (userChecking) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
    if (!userAuth || !user) return (
    Swal.fire({
      icon:'error',
      title:'User Not Authenticated',
      text:'Please Login First'
    }),
      <Navigate to="/login" replace />
    )
    if (user.role !== 'user') return <Navigate to="/login" replace />
    return <Outlet />
  }

  // Unknown role → deny
  return <Navigate to="/login" replace />
}