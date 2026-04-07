import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useUserStore from '../../../store/UserStore.js'
import useFarmerAuthStore from '../../../store/FarmerAuthStore.js'

const Sidebar = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Get user and farmer from stores
  const user = useUserStore((state) => state.user)
  const farmer = useFarmerAuthStore((state) => state.farmer)

  // Determine user role and auth status
  const isAdmin = !!user && user.role === 'admin'
  const isRegularUser = !!user && user.role === 'user'
  const isFarmer = !!farmer

  // Define navigation items based on role
  const getNavItems = () => {
    if (isAdmin) {
      return [
        {
          group: 'Overview',
          items: [
            { label: 'Dashboard', icon: '📊', to: '/admin/dashboard' },
            { label: 'Analytics', icon: '📈', to: '/admin/dashboard/analytics' },
            { label: 'Price Monitoring', icon: '🏷️', to: '/admin/dashboard/price_monitoring' },
          ],
        },
        {
          group: 'Management',
          items: [
            { label: 'Products', icon: '🌿', to: '/admin/dashboard/products' },
            { label: 'Farms', icon: '🚜', to: '/admin/dashboard/farms' },
            { label: 'Users', icon: '👥', to: '/admin/dashboard/users' },
            { label: 'Farmers', icon: '👨‍🌾', to: '/admin/dashboard/farmers' },
            { label: 'Orders', icon: '📦', to: '/admin/dashboard/orders' },
          ],
        },
      ]
    }

    if (isFarmer) {
      return [
        {
          group: 'Overview',
          items: [
            { label: 'Dashboard', icon: '🏠', to: '/farmer/dashboard/index' },
            { label: 'Analytics', icon: '📊', to: '/farmer/dashboard/analytics' },
            { label: 'Farm', icon: '🚜', to: '/farmer/dashboard/farm' },
          ],
        },
        {
          group: 'Store',
          items: [
            { label: 'My Produce', icon: '🌿', to: '/farmer/dashboard/products' },
            { label: 'Orders', icon: '📦', to: '/farmer/dashboard/orders' },
            { label: 'Inventory', icon: '🗂️', to: '/farmer/dashboard/inventory' },
          ],
        },
        {
          group: 'Account',
          items: [
            { label: 'Profile', icon: '👤', to: '/farmer/dashboard/profile' },
          ],
        },
      ]
    }

    if (isRegularUser) {
      return [
        {
          group: 'Overview',
          items: [
            { label: 'Dashboard', icon: '🏠', to: '/user/index' },
            { label: 'Analytics', icon: '📊', to: '/user/dashboard/analytics' },
          ],
        },
        {
          group: 'Store',
          items: [
            { label: 'Produce', icon: '🌿', to: '/user/shop' },
            { label: 'Farms', icon: '🚜', to: '/shop/farms' },
            { label: 'Orders', icon: '📦', to: '/user/dashboard/orders' },
          ],
        },
        {
          group: 'Account',
          items: [
            { label: 'Profile', icon: '👤', to: '/user/dashboard/profile' },
          ],
        },
      ]
    }

    // Unauthenticated / Shop visitor
    return [
      {
        group: 'Overview',
        items: [
          { label: 'Home', icon: '🏠', to: '/shop/dashboard' },
        ],
      },
      {
        group: 'Store',
        items: [
          { label: 'Produce', icon: '🌿', to: '/shop/products' },
          { label: 'Farms', icon: '🚜', to: '/shop/farms' },
          { label: 'Price Monitoring', icon: '📊', to: '/shop/price_monitoring' },
        ],
      },
      {
        group: 'Details',
        items: [
          { label: 'About', icon: '🕮', to: '/shop/about' },
        ],
      },
    ]
  }

  const navItems = getNavItems()

  return (
    <aside
      className={`bg-green-900 min-h-screen text-white flex flex-col transition-all duration-200 shrink-0 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Toggle */}
      <div className="flex items-center justify-end px-3 py-3 border-b border-green-800">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="text-green-300 hover:text-white text-lg p-1 rounded hover:bg-green-800 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group} className="mb-2">
            {!collapsed && (
              <p className="text-green-400 text-xs font-semibold uppercase tracking-widest px-3 mb-1">
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : ''}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors
                    ${active ? 'bg-orange-500 text-white' : 'text-green-200 hover:bg-green-800 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logout - shown if authenticated */}
      {(isRegularUser || isAdmin || isFarmer) && (
        <div className="px-2 pb-4 pt-3 border-t border-green-800">
          <button
            onClick={onLogout}
            title={collapsed ? 'Logout' : ''}
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-green-200 hover:bg-green-800 hover:text-white transition-colors w-full ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <span className="text-base">🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      )}
    </aside>
  )
}

export default Sidebar