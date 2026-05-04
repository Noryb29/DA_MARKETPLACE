import React, { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import useUserStore from './store/UserStore'
import useFarmerAuthStore from './store/FarmerAuthStore'
import ShopDashboard from './pages/public/ShopDashboard'

const App = () => {
  const user = useUserStore((state) => state.user)
  const userAuth = useUserStore((state) => state.isAuthenticated)
  const userChecking = useUserStore((state) => state.isCheckingAuth)
  const farmerAuth = useFarmerAuthStore((state) => state.isAuthenticated)
  const farmerChecking = useFarmerAuthStore((state) => state.isCheckingAuth)

  const checkUserAuth = useRef(useUserStore.getState().checkAuth)
  const checkFarmerAuth = useFarmerAuthStore.getState().checkAuth

  useEffect(() => {
    checkUserAuth.current()
    checkFarmerAuth()
  }, [])

  // Wait for both stores to finish before deciding anything
  if (userChecking || farmerChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Redirect authenticated users away from the landing page
  if (farmerAuth) return <Navigate to="/" replace />
  if (userAuth && user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (userAuth) return <Navigate to="/user/index" replace />

  // Not logged in → show landing page
  return (
    <div className="min-h-screen">
      <ShopDashboard/>
    </div>
  )
}

export default App