import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', icon: '🏠', to: '/user/index' },
      { label: 'Analytics',  icon: '📊', to: '/user/dashboard/analytics' },
    ],
  },
  {
    group: 'Store',
    items: [
      { label: 'Produce', icon: '🌿', to: '/user/shop' },
      { label: 'Cart',   icon: '🛒',  to: '/user/dashboard/cart' },
      { label: 'Orders',      icon: '📦', to: '/user/dashboard/orders' },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'Profile',  icon: '👤', to: '/user/dashboard/profile' },
    ],
  },
]

const UserSidebar = ({ onLogout }) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside className={`bg-green-900 text-white flex flex-col transition-all duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>

      {/* Toggle */}
      <div className="flex items-center justify-end px-3 py-3 border-b border-green-800">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-green-300 hover:text-white text-lg p-1 rounded hover:bg-green-800 transition-colors"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map(group => (
          <div key={group.group} className="mb-2">
            {!collapsed && (
              <p className="text-green-400 text-xs font-semibold uppercase tracking-widest px-3 mb-1">
                {group.group}
              </p>
            )}
            {group.items.map(item => {
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

      {/* Logout */}
      <div className="px-2 pb-4 pt-3 border-t border-green-800">
        <button
          onClick={onLogout}
          title={collapsed ? 'Logout' : ''}
          className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-green-200 hover:bg-green-800 hover:text-white transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <span className="text-base">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default UserSidebar