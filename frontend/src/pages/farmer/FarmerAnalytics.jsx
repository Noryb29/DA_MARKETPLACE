import React, { useEffect } from 'react'
import Sidebar from '../public/components/SideBar'
import useFarmerAnalyticsStore from '../../store/FarmerAnalyticsStore'
import { BarChart3, Package, ShoppingCart, Wheat, TrendingUp, Calendar } from 'lucide-react'
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
  BarElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const FarmerAnalytics = () => {
  const { stats, loading, fetchFarmerStats } = useFarmerAnalyticsStore()

  useEffect(() => {
    fetchFarmerStats()
  }, [])

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    return Number(num).toLocaleString()
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  const ordersChartData = stats?.ordersByMonth ? {
    labels: stats.ordersByMonth.map(o => {
      const [year, month] = o.month.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleDateString('en-PH', { month: 'short' })
    }),
    datasets: [
      {
        label: 'Orders',
        data: stats.ordersByMonth.map(o => o.order_count),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null

  const volumeChartData = stats?.ordersByMonth ? {
    labels: stats.ordersByMonth.map(o => {
      const [year, month] = o.month.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleDateString('en-PH', { month: 'short' })
    }),
    datasets: [
      {
        label: 'Volume (kg)',
        data: stats.ordersByMonth.map(o => o.total_volume || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6,
      },
    ],
  } : null

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 p-8 overflow-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Farm Analytics</h2>
            <p className="text-gray-500 text-sm mt-1">Overview of your farm performance and orders.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Wheat className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats?.totals?.total_crops)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats?.totals?.total_orders)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Items Sold</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats?.totals?.total_items_sold)}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Volume Sold</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats?.totals?.total_volume_sold)} kg</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Orders Trend (12 Months)</h3>
              {ordersChartData && ordersChartData.labels.length > 0 ? (
                <div className="h-64">
                  <Line data={ordersChartData} options={chartOptions} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No order data available
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Volume by Month (kg)</h3>
              {volumeChartData && volumeChartData.labels.length > 0 ? (
                <div className="h-64">
                  <Line 
                    data={volumeChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: { beginAtZero: true },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  No volume data available
                </div>
              )}
            </div>
          </div>

          {/* Crops by Farm & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crops by Farm */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Crops by Farm</h3>
              <div className="space-y-3">
                {stats?.cropsByFarm?.length > 0 ? (
                  stats.cropsByFarm.map((farm, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{farm.farm_name}</p>
                        {(farm.province || farm.municipality || farm.barangay) && (
                          <p className="text-[10px] text-gray-400">{farm.barangay}{farm.municipality && `, ${farm.municipality}`}{farm.province && `, ${farm.province}`}</p>
                        )}
                        <p className="text-xs text-gray-500">{farm.crop_count} crops</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{formatNumber(farm.total_stock)} stock</p>
                        <p className="text-xs text-gray-500">{formatNumber(farm.total_volume)} kg</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No farm data available</p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{order.crop_name}</p>
                        <p className="text-xs text-gray-500">by {order.buyer_name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-2">
                          {order.quantity && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">x{order.quantity}</span>
                          )}
                          {order.volume && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{order.volume}kg</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">No recent orders</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Crops */}
          {stats?.topCrops?.length > 0 && (
            <div className="mt-6 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Top Performing Crops</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-3">Crop</th>
                      <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-3">Variety</th>
                      <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-3">Stock</th>
                      <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-3">Volume</th>
                      <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest pb-3">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topCrops.map((crop, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-sm font-semibold text-gray-800">{crop.crop_name}</td>
                        <td className="py-3 text-sm text-gray-500">{crop.variety || '—'}</td>
                        <td className="py-3 text-sm text-gray-700 text-right">{formatNumber(crop.stock)}</td>
                        <td className="py-3 text-sm text-gray-700 text-right">{formatNumber(crop.volume)} kg</td>
                        <td className="py-3 text-sm text-gray-700 text-right">{formatNumber(crop.order_count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default FarmerAnalytics