import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import useUserStore from '../../store/UserStore'
import useOrderStore from '../../store/OrderStore'

const AdminDashboard = () => {
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const { myOrders, getMyOrders, loading } = useOrderStore()
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    setAnimateCards(true)
  }, [])

  // Sample dashboard stats (replace with actual data)
  const stats = [
    { label: 'Total Orders', value: '1,234', icon: '📦', color: 'from-blue-500 to-blue-600', trend: '+12%' },
    { label: 'Total Users', value: '856', icon: '👥', color: 'from-purple-500 to-purple-600', trend: '+8%' },
    { label: 'Total Farmers', value: '342', icon: '👨‍🌾', color: 'from-green-500 to-green-600', trend: '+5%' },
    { label: 'Revenue', value: '₱125K', icon: '💰', color: 'from-orange-500 to-orange-600', trend: '+22%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={logout} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Welcome back, {user?.name || 'Admin'}
                  </h1>
                  <p className="text-slate-600 text-lg">
                    Here's what's happening with your platform today
                  </p>
                </div>
                <div className="text-6xl">📊</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl ${
                    animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    transitionDelay: animateCards ? `${idx * 100}ms` : '0ms',
                  }}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-90`}></div>

                  {/* Light overlay for depth */}
                  <div className="absolute inset-0 bg-white opacity-5 group-hover:opacity-10 transition-opacity"></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-5xl">{stat.icon}</div>
                      <span className="inline-block bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {stat.trend}
                      </span>
                    </div>
                    <p className="text-white text-sm font-medium opacity-90 mb-1">{stat.label}</p>
                    <p className="text-white text-3xl font-bold">{stat.value}</p>
                  </div>

                  {/* Decorative gradient blob */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Manage Users', to: '/admin/dashboard/users', icon: '👥' },
                  { label: 'View Products', to: '/admin/dashboard/products', icon: '🌿' },
                  { label: 'Manage Farms', to: '/admin/dashboard/farms', icon: '🚜' },
                ].map((action, idx) => (
                  <Link
                    key={idx}
                    to={action.to}
                    className="group block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-green-300"
                  >
                    <div className="text-4xl mb-3">{action.icon}</div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">Access now →</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Recent Orders</h2>
                  <p className="text-slate-600 text-sm mt-1">Latest transactions from your platform</p>
                </div>
                <Link
                  to="/admin/dashboard/orders"
                  className="text-green-600 hover:text-green-700 font-semibold text-sm"
                >
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                  <p className="text-slate-600 mt-4">Loading orders...</p>
                </div>
              ) : myOrders && myOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.slice(0, 5).map((order, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-900 font-medium">{order.id}</td>
                          <td className="py-3 px-4 text-slate-600">{order.customer}</td>
                          <td className="py-3 px-4 text-slate-900 font-semibold">₱{order.amount}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                order.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-600">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard