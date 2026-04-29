import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import useUserStore from '../../store/UserStore'
import useOrderStore from '../../store/OrderStore'

const UserIndex = () => {
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const { myOrders, getMyOrders, loading } = useOrderStore()
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    if (user?.user_id) {
      getMyOrders()
      setAnimateCards(true)
    }
  }, [user?.user_id])

  // Calculate stats from actual buyer orders
  const stats = [
    {
      label: 'My Orders',
      value: myOrders?.length || 0,
      icon: '🛒',
      color: 'from-emerald-50 to-teal-50',
      textColor: 'text-emerald-900',
      change: '+12%',
      trend: true,
    },
  ]

  const getStatusStyle = (status) => {
    const styles = {
      Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Processing: 'bg-amber-100 text-amber-800 border-amber-200',
      Pending: 'bg-rose-100 text-rose-800 border-rose-200',
    }
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status) => {
    const icons = {
      Delivered: '✓',
      Processing: '⟳',
      Pending: '○',
    }
    return icons[status] || '?'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      <style>{`
        
        :root {
          --primary: #1e7145;
          --secondary: #f59e0b;
          --accent: #065f46;
          --light: #f0fdf4;
      }

        .heading-serif {
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .grain {
          background-image: 
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
        }

        .stat-card {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .order-row {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(30, 113, 69, 0.12);
        }

        .stat-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .order-row:hover {
          background-color: rgba(16, 185, 129, 0.03);
        }

        .badge-status {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1.5px solid;
        }

        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .logout-btn {
          transition: all 0.2s ease;
        }
      `}</style>

      <Header />

      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={logout} />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <div className="flex-1">
                <h1 className="heading-serif text-4xl md:text-5xl text-slate-900 mb-2">
                  Welcome back, <span className="text-emerald-700">{user?.firstname}</span>
                </h1>
                <p className="text-slate-600 text-lg">
                  Track your orders and discover fresh produce from local farmers
                </p>
              </div>

              <button
                onClick={logout}
                className="logout-btn self-start md:self-auto w-full md:w-auto px-6 py-3 text-red-600 border border-red-200 rounded-lg font-medium text-sm hover:bg-red-50 flex items-center justify-center gap-2"
              >
                🚪 Logout
              </button>
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 ${animateCards ? '' : ''}`}>
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={`stat-card bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-white shadow-sm hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 uppercase tracking-wide mb-2">
                        {stat.label}
                      </p>
                      <p className={`heading-serif text-3xl ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <span className="text-4xl opacity-60">{stat.icon}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className={stat.trend ? 'text-emerald-600' : 'text-rose-600'}>
                      {stat.trend ? '↑' : '↓'} {stat.change}
                    </span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-8 border-b border-slate-100">
                <div>
                  <h2 className="heading-serif text-2xl text-slate-900 mb-1">Your Orders</h2>
                  <p className="text-sm text-slate-500">
                    {myOrders?.length || 0} total orders placed
                  </p>
                </div>
                <Link
                  to="/user/dashboard/orders"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  View all orders →
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-slate-500">Loading your orders...</p>
                </div>
              ) : myOrders?.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 text-lg mb-2">No orders yet</p>
                  <p className="text-slate-400 text-sm">
                    Start exploring fresh produce from local farmers
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Order ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Farmer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myOrders.slice(0, 6).map((order, i) => (
                        <tr key={order.crop_order_id || i} className="order-row hover:bg-emerald-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-emerald-700">#{order.crop_order_id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{order.crop_name}</p>
                              <p className="text-xs text-slate-500">{order.variety}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{order.farmer_first_name} {order.farmer_last_name}</p>
                              <p className="text-xs text-slate-500">{order.farm_name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-emerald-900">
                              ₱{parseFloat(order.amount || 0).toLocaleString('en-PH')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`badge-status ${getStatusStyle(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 text-sm">
                            {order.order_date ? new Date(order.order_date).toLocaleDateString('en-PH') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer Spacing */}
            <div className="h-8"></div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserIndex