import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import useUserStore from '../../../store/UserStore'
import useFarmerAuthStore from '../../../store/FarmerAuthStore'
import AgricultureLogo from '../../../assets/DA_LOGO.png'

const Header = () => {
  const location = useLocation()

  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const farmer = useFarmerAuthStore((state) => state.farmer)

  const isAdmin = !!user && user.role === 'admin'
  const isRegularUser = !!user && user.role === 'user'
  const isFarmer = !!farmer
  const isUnauthenticated = !user && !farmer

  const getNavLinks = () => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Logout', action: 'logout' }
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

    return [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/shop/products' },
      { label: 'Farms', to: '/shop/farms' },
      { label: 'Price Monitoring', to: '/shop/price_monitoring' },
      { label: 'About', to: '/shop/about' },
    ]
  }

  const navLinks = getNavLinks()
  const logoLink = isAdmin ? "/admin/dashboard" : "/"

  return (
    <header className="sticky top-0 z-50 bg-green-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex items-center justify-between h-24">

          {/* Logo + Branding */}
          <Link
            to={logoLink}
            className="flex items-center group"
          >
            <img
              src={AgricultureLogo}
              alt="Department of Agriculture Logo"
              className="h-30 w-40 object-contain transition-transform duration-200 group-hover:scale-105"
            />

            <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isAdmin
                ? "Farmer's Marketplace (Admin Dashboard)"
                : "Farmer's Marketplace"}
            </span>
          </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to

                if (link.action === 'logout') {
                  return (
                    <button
                      key="logout"
                      onClick={logout}
                      className="px-5 py-2 text-sm font-medium border-2 border-red-300 rounded-lg hover:bg-red-500 hover:border-red-500 hover:text-white text-red-200 transition-all"
                    >
                      {link.label}
                    </button>
                  )
                }

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`font-medium text-sm border-b-2 pb-1 transition-all duration-200 ${
                      isActive
                        ? 'text-orange-500 border-orange-500'
                        : 'border-transparent hover:text-green-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Auth Buttons */}
            {isUnauthenticated && (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="hidden sm:block bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

          </nav>

        </div>
      </div>
    </header>
  )
}

export default Header