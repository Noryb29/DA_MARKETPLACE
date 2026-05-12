import React, { useEffect } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import useOrderStore from '../../store/OrderStore'
import { FaShoppingCart, FaClock, FaCheckCircle, FaTruck, FaChartLine, FaMoneyBill, FaCircle } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const UserAnalytics = () => {
  const { myOrders, loading, initialized, getMyOrders } = useOrderStore()

  useEffect(() => {
    getMyOrders()
  }, [])

  const totalOrders = myOrders.length
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length
  const completedOrders = myOrders.filter(o => o.status === 'completed').length
  const totalSpent = myOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0)

  const recentOrders = [...myOrders].sort((a, b) => new Date(b.order_date) - new Date(a.order_date)).slice(0, 6)

  const getMonthlySpending = () => {
    const monthlyData = {}
    myOrders.forEach(order => {
      const date = new Date(order.order_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = date.toLocaleDateString('en-PH', { month: 'short' })
      if (!monthlyData[key]) {
        monthlyData[key] = { label, total: 0 }
      }
      monthlyData[key].total += parseFloat(order.total_price) || 0
    })
    const sorted = Object.values(monthlyData).slice(-6)
    return {
      labels: sorted.map(d => d.label),
      datasets: [{
        label: 'Spending',
        data: sorted.map(d => d.total),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false } },
    },
  }

  const statCards = [
    { label: 'Total Orders', value: totalOrders, icon: FaShoppingCart, bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Total Spent', value: `₱${totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: FaMoneyBill, bgColor: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Pending', value: pendingOrders, icon: FaClock, bgColor: 'bg-amber-100', iconColor: 'text-amber-600' },
    { label: 'Completed', value: completedOrders, icon: FaCheckCircle, bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  ]

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-blue-100 text-blue-700',
      processing: 'bg-purple-100 text-purple-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    const icons = {
      pending: <FaClock className="w-3 h-3" />,
      confirmed: <FaCheckCircle className="w-3 h-3" />,
      processing: <FaTruck className="w-3 h-3" />,
      shipped: <FaTruck className="w-3 h-3" />,
      delivered: <FaCheckCircle className="w-3 h-3" />,
      completed: <FaCheckCircle className="w-3 h-3" />,
      cancelled: <FaCircle className="w-3 h-3" />,
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {icons[status] || icons.pending}
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <FaChartLine className="w-3.5 h-3.5" />
                Analytics
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Your Order Analytics</h2>
              <p className="text-gray-500 text-sm mt-1">Overview of your purchasing activity</p>
            </div>

            {loading && !initialized ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {statCards.map(({ label, value, icon: Icon, bgColor, iconColor }) => (
                    <div key={label} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`${bgColor} w-11 h-11 rounded-lg flex items-center justify-center`}>
                          <Icon className={`${iconColor} w-5 h-5`} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Monthly Spending Trend</h3>
                  <div className="h-64">
                    <Line data={getMonthlySpending()} options={chartOptions} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="px-5 pt-5 pb-2">
                    <h3 className="text-sm font-bold text-gray-800">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Order ID</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Farm</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Product</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Quantity</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Total</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Date</th>
                          <th className="text-left py-3 px-5 text-gray-500 font-semibold text-xs uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length > 0 ? (
                          recentOrders.map((order) => (
                            <tr key={order.crop_order_id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                              <td className="py-3 px-5 font-medium text-gray-700">#{order.crop_order_id}</td>
                              <td className="py-3 px-5">
                                <span className="text-gray-800">{order.farm_name}</span>
                                {(order.province || order.municipality || order.barangay) && (
                                  <span className="text-[10px] text-gray-400 block">{order.barangay}{order.municipality && `, ${order.municipality}`}{order.province && `, ${order.province}`}</span>
                                )}
                              </td>
                              <td className="py-3 px-5 text-gray-700">{order.crop_name}</td>
                              <td className="py-3 px-5 text-gray-700">{order.quantity}</td>
                              <td className="py-3 px-5 font-medium text-gray-800">₱{parseFloat(order.total_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                              <td className="py-3 px-5 text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                              <td className="py-3 px-5">{getStatusBadge(order.status)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-gray-400">No recent orders</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default UserAnalytics