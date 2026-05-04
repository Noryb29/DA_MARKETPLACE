import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import useFarmerStore from '../../store/FarmsStore'
import useProduceStore from '../../store/ProduceStore'
import useOrderStore from '../../store/OrderStore'
import useFarmerAnalyticsStore from '../../store/FarmerAnalyticsStore'
import Sidebar from '../public/components/SideBar'
import { 
  HomeIcon, Package, ShoppingCart, Wheat, TrendingUp, 
  Users, Calendar, ArrowRight, Plus, Eye, Clock,
  MapPin, ChevronRight
} from 'lucide-react'

const FarmerIndex = () => {
  const { farmer, logout, farmerDetails } = useFarmerAuthStore()
  const { farm, farms, hasFarm, getFarm } = useFarmerStore()
  const { crops, getCrops } = useProduceStore()
  const { farmerOrders, getFarmerOrders } = useOrderStore()
  const { stats: analyticsStats, fetchFarmerStats } = useFarmerAnalyticsStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getFarm(),
        getCrops(),
        getFarmerOrders(),
        fetchFarmerStats()
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const firstName = farmer?.firstname || 'Farmer'

  const pendingOrders = farmerOrders.filter(o => 
    new Date(o.expected_arrival) >= new Date()
  ).length

  const recentOrders = farmerOrders.slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'

  const getProfilePicture = () => {
    if (!farmerDetails?.profile_picture) return null
    const pic = farmerDetails.profile_picture
    const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"
    return pic.startsWith('http') ? pic : `${BASE_URL}${pic}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar onLogout={handleLogout} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              {getProfilePicture() ? (
                <img src={getProfilePicture()} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-green-500" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-green-900 flex items-center justify-center text-white text-xl font-bold border-2 border-green-500">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  <HomeIcon className="w-3.5 h-3.5" />
                  Dashboard
                </div>
                <h2 className="text-2xl font-bold text-green-900">
                  {getGreeting()}, {firstName}!
                </h2>
                <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
            </div>
             <button
                onClick={logout}
                className="logout-btn self-start md:self-auto w-full md:w-auto px-6 py-3 text-red-600 border border-red-200 rounded-lg font-medium text-sm hover:bg-red-50 flex items-center justify-center gap-2"
              >
                🚪 Logout
              </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link to="/farmer/dashboard/products" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Wheat className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">{crops.length} crops</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">My Crops</p>
              <p className="text-xl font-bold text-gray-900 mt-1">Active Listings</p>
            </Link>

            <Link to="/farmer/dashboard/orders" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{farmerOrders.length} total</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Orders</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{pendingOrders} Pending</p>
            </Link>

            <Link to="/farmer/dashboard/farm" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium">{farms.length} farms</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">My Farms</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{hasFarm ? farm?.farm_name : 'None yet'}</p>
                {hasFarm && (farm?.barangay || farm?.municipality || farm?.province) && (
                  <p className="text-xs text-gray-400 mt-1">{farm?.barangay}{farm?.municipality && `, ${farm.municipality}`}{farm?.province && `, ${farm.province}`}</p>
                )}
            </Link>

            <Link to="/farmer/dashboard/analytics" className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">12 months</span>
              </div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Analytics</p>
              <p className="text-xl font-bold text-gray-900 mt-1">View Stats</p>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Recent Orders</h3>
                <Link to="/farmer/dashboard/orders" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.crop_order_id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {order.harvest_photo ? (
                            <img src={order.harvest_photo} alt={order.crop_name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{order.crop_name}</p>
                          <p className="text-xs text-gray-500">by {order.buyer_first_name} {order.buyer_last_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          {order.quantity && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">x{order.quantity}</span>
                          )}
                          {order.volume && (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{order.volume}kg</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No orders yet</p>
                    <p className="text-gray-400 text-xs mt-1">Orders will appear here when customers buy your crops</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Quick Add */}
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-5 text-white">
                <p className="font-bold text-lg mb-1">Grow your farm! 🌱</p>
                <p className="text-green-100 text-sm mb-4">Add new crops to reach more buyers.</p>
                <Link
                  to="/farmer/dashboard/products"
                  className="bg-white text-green-700 hover:bg-green-50 transition-colors text-sm font-semibold px-4 py-2.5 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Crop
                </Link>
              </div>

              {/* Farm Info */}
              {hasFarm && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <h4 className="font-bold text-gray-900">Your Farm</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Farm Name</p>
                      <p className="text-sm font-semibold text-gray-800">{farm?.farm_name}</p>
                    </div>
                    {farm?.farm_location && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Location</p>
                        <p className="text-sm text-gray-600">{farm.farm_location}</p>
                      </div>
                    )}
                    {farm?.total_area_hectares && (
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Area</p>
                        <p className="text-sm text-gray-600">{farm.total_area_hectares} hectares</p>
                      </div>
                    )}
                    <Link 
                      to="/farmer/dashboard/farms"
                      className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 mt-2"
                    >
                      Edit farm details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {!hasFarm && (
                <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Register your farm</p>
                      <p className="text-xs text-gray-500">Start selling today</p>
                    </div>
                  </div>
                  <Link
                    to="/farmer/dashboard/farms"
                    className="block text-center bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Farm
                  </Link>
                </div>
              )}

              {/* Top Crops */}
              {analyticsStats?.topCrops?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h4 className="font-bold text-gray-900 mb-4">Top Performing Crops</h4>
                  <div className="space-y-3">
                    {analyticsStats.topCrops.slice(0, 3).map((crop, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{crop.crop_name}</p>
                            <p className="text-xs text-gray-400">{crop.order_count} orders</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link 
                    to="/farmer/dashboard/analytics"
                    className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1 mt-4"
                  >
                    View full analytics <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Tips */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h4 className="font-bold text-gray-900 mb-3">💡 Quick Tips</h4>
                <ul className="space-y-2">
                  {[
                    'Add clear photos to boost sales',
                    'Set competitive prices',
                    'Update stock regularly',
                  ].map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-500 font-bold shrink-0">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default FarmerIndex