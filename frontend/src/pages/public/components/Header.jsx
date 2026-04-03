import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import useUserStore from '../../../store/UserStore'
import useFarmerAuthStore from '../../../store/FarmerAuthStore'

const Header = () => {
  const location = useLocation()

  // Get user and farmer from stores (matching Sidebar logic)
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const farmer = useFarmerAuthStore((state) => state.farmer)

  // Determine user role and auth status (matching Sidebar logic)
  const isAdmin = !!user && user.role === 'admin'
  const isRegularUser = !!user && user.role === 'user'
  const isFarmer = !!farmer
  const isUnauthenticated = !user && !farmer

  // Define nav links based on role
  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Logout', action:'logout'}
  ]    
  }

    if (isFarmer) {
      return [
        { label: 'Dashboard', to: '/farmer/dashboard/index' },
        { label: 'Products', to: '/farmer/dashboard/products' },
        { label: 'Farm', to: '/farmer/dashboard/farm' },
        { label: 'Orders', to: '/farmer/dashboard/orders' },
      ]
    }

    if (isRegularUser) {
      return [
        { label: 'Dashboard', to: '/user/index' },
        { label: 'Produce', to: '/user/shop' },
        { label: 'Farms', to: '/shop/farms' },
        { label: 'Orders', to: '/user/dashboard/orders' },
      ]
    }

    // Unauthenticated
    return [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/shop/products' },
      { label: 'Farms', to: '/shop/farms' },
      { label: 'About', to: '#' },
    ]
  }

  const navLinks = getNavLinks()

  return (
    <header className="sticky top-0 z-50 bg-green-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-8 py-4">

            {isAdmin ? (
              <Link to="/admin/dashboard" className="text-2xl font-bold">🌾 Farmer's Marketplace (Admin's Dashboard)</Link>
            ) : (
              <Link to="/" className="text-2xl font-bold">🌾 Farmer's Marketplace</Link>
            )}

          <nav className="flex gap-8 items-center">

            {/* Navigation Links */}
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to

              if (link.action === 'logout') {
                return (
                  <button
                    key="logout"
                    onClick={logout}
                    className="logout-btn self-start md:self-auto w-full md:w-auto px-6 py-3 text-white-600 border border-red-200 rounded-lg font-medium text-sm hover:bg-white hover:text-black flex items-center justify-center gap-2 transition-all"
                  >
                    {link.label}
                  </button>
                )
              }

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-medium transition-colors ${
                    isActive
                      ? 'text-orange-500'
                      : 'hover:text-green-300'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            {/* Auth Buttons - shown only if unauthenticated */}
            {isUnauthenticated && (
              <>
                <Link
                  to="/login"
                  className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            )}

          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header