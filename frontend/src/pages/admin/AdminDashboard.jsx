import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import { useAdminStore } from '../../store/AdminStore'
import useUserStore from '../../store/UserStore'
import { TrendingUp, Users, Leaf, Truck, AlertCircle, ChevronRight, Calendar, BarChart3 } from 'lucide-react'

const AdminDashboard = () => {
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const navigate = useNavigate()
  
  const {
    products,
    farms,
    users: allUsers,
    farmers,
    orders,
    loading,
    error,
    clearError,
    getAllProducts,
    getAllFarms,
    getAllUsers,
    getAllFarmers,
    getAllOrders,
  } = useAdminStore()

  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          getAllProducts(),
          getAllFarms(),
          getAllUsers(),
          getAllFarmers(),
          getAllOrders(),
        ])
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      }
    }
    fetchAllData()
    setAnimateCards(true)
  }, [])

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length.toLocaleString(),
      icon: <Truck className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Users',
      value: allUsers.length.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Farmers',
      value: farmers.length.toLocaleString(),
      icon: <Leaf className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Products',
      value: products.length.toLocaleString(),
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const recentOrders = orders.slice(0, 5)
  const lowStockProducts = products.filter(p => (p.stock || 0) < 10).slice(0, 5)

  const quickActions = [
    { label: 'Users', to: '/admin/dashboard/users', icon: '👥' },
    { label: 'Farmers', to: '/admin/dashboard/farmers', icon: '🌾' },
    { label: 'Farms', to: '/admin/dashboard/farms', icon: '🚜' },
    { label: 'Products', to: '/admin/dashboard/products', icon: '📦' },
    { label: 'Orders', to: '/admin/dashboard/orders', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header */}
            <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-5 bg-white border border-gray-200 rounded-lg transition-all duration-300 ${
                    animateCards ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    transitionDelay: animateCards ? `${idx * 50}ms` : '0ms',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <div className={stat.color}>{stat.icon}</div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <Link
                      key={idx}
                      to={action.to}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{action.icon}</span>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          {action.label}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                  <Link
                    to="/admin/orders"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View all <ChevronRight size={16} />
                  </Link>
                </div>

                {loading ? (
                  <div className="py-8 text-center">
                    <div className="inline-block animate-spin">
                      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">Loading orders...</p>
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-2">
                    {recentOrders.map((order, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900">Order #{order.crop_order_id}</p>
                            <p className="text-xs text-gray-500">{order.crop_name} • {order.variety}</p>
                          </div>
                          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                            {order.quantity} units
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {order.buyer_firstname} {order.buyer_lastname} • {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-amber-600" size={20} />
                  <h2 className="font-bold text-amber-900">Low Stock Alert</h2>
                </div>
                <div className="space-y-2">
                  {lowStockProducts.map((product, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.crop_name}</p>
                        <p className="text-xs text-gray-500">{product.variety}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-amber-700">{product.stock} units left</p>
                        <p className="text-xs text-gray-500">
                          Harvest: {new Date(product.expected_harvest).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Platform Activity */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Platform Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Orders</span>
                    <span className="font-bold text-gray-900">{orders.filter(o => new Date(o.expected_arrival) >= new Date()).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Volume</span>
                    <span className="font-bold text-gray-900">{orders.reduce((sum, o) => sum + (o.volume || 0), 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Order Size</span>
                    <span className="font-bold text-gray-900">
                      {orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + (o.quantity || 0), 0) / orders.length) : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Metrics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">User Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="font-bold text-gray-900">{allUsers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Farmers</span>
                    <span className="font-bold text-gray-900">{farmers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Farms</span>
                    <span className="font-bold text-gray-900">{farms.length}</span>
                  </div>
                </div>
              </div>

              {/* Inventory Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Inventory</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Products</span>
                    <span className="font-bold text-gray-900">{products.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock</span>
                    <span className="font-bold text-gray-900">{products.filter(p => (p.stock || 0) < 10).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Stock</span>
                    <span className="font-bold text-gray-900">{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard