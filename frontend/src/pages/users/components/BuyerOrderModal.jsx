import React from 'react'
import {
  X, User, Calendar, ClipboardList, Store,
  Package, Archive, MapPin, Sprout
} from 'lucide-react'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const BuyerOrderModal = ({ order, onClose }) => {
  if (!order) return null
  const specs = [1,2,3,4,5,6,7,8].map(n => {
    const name = order[`specification_${n}_name`]
    const value = order[`specification_${n}_value`]
    return (name || value) ? `${name}: ${value}` : null
  }).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">{order.crop_name}</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {order.harvest_photo && (
            <div className="rounded-xl overflow-hidden mb-4">
              <img src={order.harvest_photo} alt={order.crop_name} className="w-full h-44 object-cover" />
            </div>
          )}

          {!order.harvest_photo && (
            <div className="w-full h-44 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <Sprout className="w-12 h-12 text-gray-300" />
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {order.variety && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Variety</span>
                <span className="text-sm text-gray-800">{order.variety}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Order ID</span>
              <span className="text-sm font-bold text-gray-800 font-mono">#{order.crop_order_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Order Date</span>
              <span className="text-sm text-gray-700">{formatDateTime(order.order_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Expected Arrival</span>
              <span className="text-sm font-semibold text-amber-700">{formatDate(order.expected_arrival)}</span>
            </div>
            {order.quantity && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Quantity</span>
                <span className="text-sm font-semibold text-gray-800">x{order.quantity}</span>
              </div>
            )}
            {order.volume && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Volume</span>
                <span className="text-sm font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold uppercase">Farmer</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{order.farmer_first_name} {order.farmer_last_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold uppercase">Farm</span>
              </div>
              <span className="text-sm text-gray-800">{order.farm_name}</span>
            </div>
            {(order.province || order.municipality || order.barangay) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold uppercase">Address</span>
                </div>
                <span className="text-sm text-gray-600 max-w-[180px] truncate text-right">
                  {order.barangay}{order.municipality && `, ${order.municipality}`}{order.province && `, ${order.province}`}
                </span>
              </div>
            )}
            {order.farm_location && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold uppercase">Location</span>
                </div>
                <span className="text-sm text-gray-600 max-w-[150px] truncate">{order.farm_location}</span>
              </div>
            )}
            {order.gps_coordinates && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-blue-600 font-semibold uppercase">GPS</span>
                </div>
                <span className="text-sm text-gray-500">{order.gps_coordinates}</span>
              </div>
            )}
          </div>

          {specs.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
              <div className="flex flex-wrap gap-1.5">
                {specs.map((s, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full mt-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuyerOrderModal