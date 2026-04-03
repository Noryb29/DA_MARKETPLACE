import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import Header from './pages/public/components/Header'
import Hero from './pages/public/components/Hero'
import FeaturedProducts from './pages/public/components/FeaturedProducts'
import Footer from './pages/public/components/Footer'
import useUserStore from './store/UserStore'
import useFarmerAuthStore from './store/FarmerAuthStore'

const App = () => {
  const { checkAuth: checkUserAuth, isAuthenticated: userAuth, user, isCheckingAuth: userChecking } = useUserStore()
  const { checkAuth: checkFarmerAuth, isAuthenticated: farmerAuth, isCheckingAuth: farmerChecking } = useFarmerAuthStore()

  useEffect(() => {
    checkUserAuth()
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
  if (farmerAuth) return <Navigate to="/" replace /> //GI CHANGE
  if (userAuth && user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
  if (userAuth) return <Navigate to="/user/index" replace />

  // Not logged in → show landing page
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <FeaturedProducts />
      <Footer />
    </div>
  )
}

export default App