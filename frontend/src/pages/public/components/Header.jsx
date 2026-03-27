import React from 'react'
import { Link } from 'react-router-dom'
import useUserStore from '../../../store/UserStore'

const Header = () => {
  const user = useUserStore((state) => state.user)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)

  return (
    <header className="sticky top-0 z-100 bg-green-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-8 py-4">
          <div className="logo">
            <h1 className="text-2xl font-bold">🌾 Farmer's Marketplace</h1>
          </div>
          <nav className="flex gap-8 items-center">
            <Link to="/" className="hover:text-green-300 font-medium transition-colors">Home</Link>
            <Link to="#" className="hover:text-green-300 font-medium transition-colors">Products</Link>
            <Link to="#" className="hover:text-green-300 font-medium transition-colors">Farmers</Link>
            <Link to="#" className="hover:text-green-300 font-medium transition-colors">About</Link>           
            {!isAuthenticated || (user?.role !== 'user' && user?.role !== 'farmer' && user?.role !== 'admin') ? (
              <>
                <Link to="/login" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Login</Link>
                <Link to="/register" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Register</Link>
              </>
            ) : (
              <>
                {user?.role === 'user' && (
                  <Link to="/user/index" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
                )}
                {user?.role === 'farmer' && (
                  <Link to="/farmer/dashboard/index" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium">Dashboard</Link>
                )}
              </>
            )}</nav>
        </div>
      </div>
    </header>
  )
}

export default Header
