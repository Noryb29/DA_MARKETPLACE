import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCropstore } from '../../../store/CropsStore.js'

const navItems = [
  {
    group: 'Overview',
    items: [
      { label: 'Dashboard', icon: '🏠', to: '/shop/dashboard' },
      { label: 'Farms', icon: '🚜', to: '/shop/farms' },
    ],
  },
  {
    group: 'Store',
    items: [
      { label: 'Produce', icon: '🌿', to: '/shop/products' },
      { label: 'Price Monitoring', icon: '📊', to: '/shop/price_monitoring' },
    ],
  },
]

const Sidebar = ({
  onLogout,
  categoryFilter,
  setCategoryFilter,
  searchTerm,
  setSearchTerm,
  onAddRecord,
  onAddCommodity,
  onImportExcel,
  onImportPDF,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const hasFilters = categoryFilter || searchTerm
  const isPriceMonitoringPage = location.pathname === '/shop/price_monitoring'

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

        {/* ── Filter Options (from reference) ── */}
        {isPriceMonitoringPage && !collapsed && (
          <div className="collapse collapse-arrow bg-base-200 rounded-box mt-2">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title font-semibold">Filter Options</div>
            <div className="collapse-content flex flex-col gap-4">

              {/* Category Filter */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Category</label>
                <select
                  className="select select-bordered w-full"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Grains">Grains</option>
                  <option value="Legumes">Legumes</option>
                  <option value="Herbs">Herbs</option>
                </select>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Search</label>
                <label className="input input-bordered flex items-center gap-2">
                  🔍
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search commodity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </label>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <button
                  onClick={() => {
                    setCategoryFilter("")
                    setSearchTerm("")
                  }}
                  className="btn btn-error btn-sm w-full"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Action Buttons (from reference) ── */}
        {isPriceMonitoringPage && !collapsed && (
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest px-1">
              Actions
            </span>

            <button
              onClick={onAddRecord}
              className="flex items-center gap-3 w-full rounded-xl border border-green-700 bg-green-800 hover:bg-green-700 transition-colors p-3 text-left"
            >
              <span className="text-xl">📝</span>
              <div>
                <p className="font-semibold text-sm text-white">Add Price Record</p>
                <p className="text-xs text-green-400">Log a new price entry</p>
              </div>
            </button>

            <button
              onClick={onAddCommodity}
              className="flex items-center gap-3 w-full rounded-xl border border-green-700 bg-green-800 hover:bg-green-700 transition-colors p-3 text-left"
            >
              <span className="text-xl">🌿</span>
              <div>
                <p className="font-semibold text-sm text-white">Add Commodity</p>
                <p className="text-xs text-green-400">Register a new commodity</p>
              </div>
            </button>

            <button
              onClick={onImportExcel}
              className="flex items-center gap-3 w-full rounded-xl border border-green-700 bg-green-800 hover:bg-green-700 transition-colors p-3 text-left"
            >
              <span className="text-xl">📊</span>
              <div>
                <p className="font-semibold text-sm text-white">Bulk Upload Excel</p>
                <p className="text-xs text-green-400">Import from Form A1 spreadsheet</p>
              </div>
            </button>

            <button
              onClick={onImportPDF}
              className="flex items-center gap-3 w-full rounded-xl border border-green-700 bg-green-800 hover:bg-green-700 transition-colors p-3 text-left"
            >
              <span className="text-xl">📄</span>
              <div>
                <p className="font-semibold text-sm text-white">Upload PDF</p>
                <p className="text-xs text-green-400">Import from Bantay Presyo report</p>
              </div>
            </button>
          </div>
        )}
      </nav>

      {/* Logout */}
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
    </aside>
  )
}

export default Sidebar