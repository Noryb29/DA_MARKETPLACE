import React from 'react'
import { Link } from 'react-router-dom'
import useUserStore from '../../../store/UserStore'
import useFarmerAuthStore from '../../../store/FarmerAuthStore'

const Header = () => {
  const { user, isAuthenticated: userAuth } = useUserStore()
  const { farmer, isAuthenticated: farmerAuth } = useFarmerAuthStore()

  const isGuest    = !userAuth && !farmerAuth
  const isUser     = userAuth && user?.role === 'user'
  const isAdmin    = userAuth && user?.role === 'admin'
  const isFarmer   = farmerAuth && farmer?.role === 'farmer'

  const navLinks = (
    <>
      <Link to="/"              className="hover:text-green-300 font-medium transition-colors">Home</Link>
      <Link to="/shop/products" className="hover:text-green-300 font-medium transition-colors">Products</Link>
      <Link to="/shop/farms"    className="hover:text-green-300 font-medium transition-colors">Farms</Link>
      <Link to="#"              className="hover:text-green-300 font-medium transition-colors">About</Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 bg-green-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-8 py-4">

          <Link to="/" className="text-2xl font-bold">🌾 Farmer's Marketplace</Link>

          <nav className="flex gap-8 items-center">

            {/* Guest */}
            {isGuest && (
              <>
                {navLinks}
                <Link to="/login"    className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Register</Link>
              </>
            )}

            {/* User */}
            {isUser && (
              <>
                {navLinks}
                <Link to="/user/index" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
              </>
            )}

            {/* Farmer */}
            {isFarmer && (
              <>
                {navLinks}
                <Link to="/farmer/dashboard/index" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
              </>
            )}

            {/* Admin */}
            {isAdmin && (
              <>
                {navLinks}
                <Link to="/admin/dashboard" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
              </>
            )}

          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header