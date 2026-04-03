import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import useFarmerAuthStore from '../../store/FarmerAuthStore'
import Sidebar from '../public/components/SideBar'
import { HomeIcon } from 'lucide-react'

const stats = [
  { label: 'Total Sales',     value: '₱24,850', change: '+12%', up: true },
  { label: 'Active Listings', value: '38',       change: '+3',   up: true },
  { label: 'Pending Orders',  value: '7',        change: '-2',   up: false },
  { label: 'Avg. Rating',     value: '4.8 ★',    change: '+0.2', up: true },
]

const recentOrders = [
  { id: '#1042', product: 'Organic Tomatoes', qty: '5 kg',      amount: '₱350', status: 'Delivered' },
  { id: '#1041', product: 'Fresh Kangkong',   qty: '3 bundles', amount: '₱120', status: 'Processing' },
  { id: '#1040', product: 'Brown Rice',        qty: '10 kg',     amount: '₱750', status: 'Pending' },
  { id: '#1039', product: 'Carabao Mango',     qty: '2 kg',      amount: '₱280', status: 'Delivered' },
]

const statusStyles = {
  Delivered:  'bg-green-100 text-green-800',
  Processing: 'bg-orange-100 text-orange-700',
  Pending:    'bg-gray-100 text-gray-600',
}

export default function FarmerIndex() {
  const { farmer, logout } = useFarmerAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const firstName = farmer?.firstname || 'Farmer'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-8">

          {/* Header row */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <HomeIcon className="w-3.5 h-3.5" />
                Homepage
              </div>
              <h2 className="text-3xl font-bold text-green-900">
                Good morning, {firstName}! 🌤️
              </h2>
              <p className="text-gray-500 text-sm mt-1">Here's an overview of your farm today.</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-500 hover:bg-red-50 border border-red-200 rounded px-4 py-2 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{s.label}</p>
                <p className="text-2xl font-bold text-green-900">{s.value}</p>
                <p className={`text-xs mt-1 font-medium ${s.up ? 'text-green-600' : 'text-red-500'}`}>
                  {s.up ? '↑' : '↓'} {s.change}{' '}
                  <span className="text-gray-400 font-normal">vs last week</span>
                </p>
              </div>
            ))}
          </div>

          {/* Orders + sidebar */}
          <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-green-900">Recent Orders</h3>
                <Link to="/farmer/dashboard/orders" className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors">
                  View all →
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Order', 'Product', 'Qty', 'Amount', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={o.id} className={i < recentOrders.length - 1 ? 'border-b border-gray-50' : ''}>
                      <td className="py-3 px-3 font-semibold text-orange-500">{o.id}</td>
                      <td className="py-3 px-3 text-gray-700">{o.product}</td>
                      <td className="py-3 px-3 text-gray-500">{o.qty}</td>
                      <td className="py-3 px-3 font-semibold text-green-900">{o.amount}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${statusStyles[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-green-900 text-white rounded-lg p-5">
                <p className="font-bold mb-1">Grow your sales 🌱</p>
                <p className="text-green-300 text-sm mb-4">List a new product and reach more buyers today.</p>
                <Link
                  to="/farmer/dashboard/products"
                  className="bg-orange-500 hover:bg-orange-600 transition-colors text-white text-sm font-medium px-4 py-2 rounded inline-block"
                >
                  + Add Product
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex-1">
                <p className="font-bold text-green-900 text-sm mb-3">💡 Quick Tips</p>
                <ul className="flex flex-col gap-2">
                  {[
                    'Add clear photos to boost sales',
                    'Set competitive prices using market data',
                    'Reply quickly for better ratings',
                  ].map((tip, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-green-600 font-bold shrink-0">✓</span>
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