import { useEffect } from 'react'
import Header from '../public/components/Header'
import Sidebar from '../public/components/SideBar'
import { useAdminStore } from '../../store/AdminStore'
import { FaUsers, FaTractor, FaWarehouse, FaSeedling, FaShoppingCart, FaChartLine } from 'react-icons/fa'

const AdminAnalytics = () => {
  const adminStats = useAdminStore((state) => state.adminStats)
  const adminLoading = useAdminStore((state) => state.adminLoading)
  const getAdminStats = useAdminStore((state) => state.getAdminStats)

  useEffect(() => {
    getAdminStats()
  }, [])

  const statCards = [
    { label: 'Total Users', value: adminStats?.totals?.total_users || 0, icon: FaUsers, color: 'bg-blue-500' },
    { label: 'Total Farmers', value: adminStats?.totals?.total_farmers || 0, icon: FaTractor, color: 'bg-green-500' },
    { label: 'Total Farms', value: adminStats?.totals?.total_farms || 0, icon: FaWarehouse, color: 'bg-amber-500' },
    { label: 'Total Products', value: adminStats?.totals?.total_products || 0, icon: FaSeedling, color: 'bg-emerald-500' },
    { label: 'Total Orders', value: adminStats?.totals?.total_orders || 0, icon: FaShoppingCart, color: 'bg-purple-500' },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <FaChartLine /> Analytics
            </h2>
            <p className="text-gray-500 text-sm mt-1">Platform statistics and insights</p>
          </div>

          {adminLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statCards.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                    <div className={`${color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                      <Icon className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{value.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-bold text-green-900 mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Order ID</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Customer</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Farm</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Product</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Quantity</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStats?.recentOrders?.length > 0 ? (
                        adminStats.recentOrders.map((order) => (
                          <tr key={order.crop_order_id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 px-2">#{order.crop_order_id}</td>
                            <td className="py-2 px-2">{order.customer_firstname} {order.customer_lastname}</td>
                            <td className="py-2 px-2">{order.farm_name}</td>
                            <td className="py-2 px-2">{order.crop_name}</td>
                            <td className="py-2 px-2">{order.quantity}</td>
                            <td className="py-2 px-2">{new Date(order.order_date).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-4 text-center text-gray-400">No recent orders</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products by Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Top Products (by Stock)</h3>
                  <div className="space-y-3">
                    {adminStats?.topProducts?.length > 0 ? (
                      adminStats.topProducts.map((product, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{product.crop_name}</p>
                            <p className="text-xs text-gray-500">{product.farm_name} - {product.farm_location}</p>
                          </div>
                          <span className="text-sm font-bold text-green-600">{product.stock}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No products</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-4">Farmers by Farm Area</h3>
                  <div className="space-y-3">
                    {adminStats?.farmersByArea?.length > 0 ? (
                      adminStats.farmersByArea.map((farmer, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{farmer.farm_name}</p>
                            <p className="text-xs text-gray-500">{farmer.firstname} {farmer.lastname}</p>
                          </div>
                          <span className="text-sm font-bold text-amber-600">{farmer.farm_area} ha</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No farms</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminAnalytics