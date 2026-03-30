import React from 'react'
import {
  X, User, Calendar, ClipboardList, Store,
  Package,
  Archive
} from 'lucide-react'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const BuyerOrderModal = ({ order, onClose }) => {
  if (!order) return null
  const specs = [1,2,3,4,5].map(n => order[`specification_${n}`]).filter(Boolean)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{order.crop_name}</h2>
              {order.variety && (
                <p className="text-xs text-gray-400 mt-0.5">Variety: {order.variety}</p>
              )}
              <p className="text-[10px] text-gray-400 mt-1 font-mono">Order #{order.crop_order_id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">

            {/* Farmer */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Farmer</p>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {order.farmer_first_name} {order.farmer_last_name}
              </p>
            </div>

            {/* Farm */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Farm</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{order.farm_name}</p>
              {order.gps_coordinates && (
                <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">{order.gps_coordinates}</p>
              )}
            </div>

            {/* Expected Arrival */}
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-widest">Expected Arrival</p>
              </div>
              <p className="text-sm font-bold text-amber-800">{formatDate(order.expected_arrival)}</p>
            </div>

            {/* Order Date */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Order Date</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{formatDate(order.order_date)}</p>
            </div>

            {/* Quantity */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Archive className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Quantity</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{order.quantity ?? '—'}</p>
            </div>

            {/* Volume */}
            <div className="bg-green-50 rounded-xl border border-green-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3.5 h-3.5 text-green-500" />
                <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest">Volume</p>
              </div>
              <p className="text-sm font-bold text-green-800">
                {order.volume ? `${Number(order.volume).toLocaleString()} kg` : '—'}
              </p>
            </div>
          </div>

          {/* Specs */}
        
          {specs.length > 0 && (
            <div className="flex flex-col flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">  
                <span className='text-xs border-gray-50 border-t bg-green-50 rounded-xl p-1 max-w-max'>Specifications:</span>
                <div>
              {specs.map((s, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
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