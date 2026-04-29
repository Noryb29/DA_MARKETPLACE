import React, { useEffect } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import useOrderStore from '../../store/OrderStore'
import { FaShoppingCart, FaClock, FaCheckCircle, FaTruck, FaChartLine, FaMoneyBill, FaCircle } from 'react-icons/fa'

const UserAnalytics = () => {
  const { myOrders, loading, initialized, getMyOrders } = useOrderStore()

  useEffect(() => {
    getMyOrders()
  }, [])

  const totalOrders = myOrders.length
  const pendingOrders = myOrders.filter(o => o.status === 'pending').length
  const completedOrders = myOrders.filter(o => o.status === 'completed').length
  const totalSpent = myOrders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0)

  const recentOrders = myOrders.slice(0, 5)

  const statCards = [
    { label: 'Total Orders', value: totalOrders, icon: FaShoppingCart, color: 'bg-blue-500' },
    { label: 'Total Spent', value: `₱${totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, icon: FaMoneyBill, color: 'bg-green-500' },
    { label: 'Pending', value: pendingOrders, icon: FaClock, color: 'bg-amber-500' },
    { label: 'Completed', value: completedOrders, icon: FaCheckCircle, color: 'bg-emerald-500' },
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
          <div className="mx-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
                <FaChartLine /> Analytics
              </h2>
              <p className="text-gray-500 text-sm mt-1">Your order statistics and insights</p>
            </div>

            {loading && !initialized ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {statCards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                      <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className="text-white" />
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-gray-800 truncate">{value}</p>
                      <p className="text-xs text-gray-500 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Order ID</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Farm</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Product</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Quantity</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Total</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Date</th>
                          <th className="text-left py-2 px-2 text-gray-500 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.length > 0 ? (
                          recentOrders.map((order) => (
                            <tr key={order.crop_order_id} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-2 px-2">#{order.crop_order_id}</td>
                              <td className="py-2 px-2">{order.farm_name}</td>
                              <td className="py-2 px-2">{order.crop_name}</td>
                              <td className="py-2 px-2">{order.quantity}</td>
                              <td className="py-2 px-2">₱{parseFloat(order.total_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2 px-2">{new Date(order.order_date).toLocaleDateString()}</td>
                              <td className="py-2 px-2">{getStatusBadge(order.status)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-gray-400">No recent orders</td>
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