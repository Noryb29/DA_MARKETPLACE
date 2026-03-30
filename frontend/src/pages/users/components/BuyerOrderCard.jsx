import React from 'react'
import { Wheat, Package, Archive, Store, ChevronRight } from 'lucide-react'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const BuyerOrderCard = ({ order, onViewDetails }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-green-200 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
          <Wheat className="w-5 h-5 text-green-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{order.crop_name}</p>
            {order.variety && (
              <span className="text-xs text-gray-400">· {order.variety}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Store className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 truncate">{order.farm_name}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Ordered {formatDateTime(order.order_date)}
          </p>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {order.quantity && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1">
                <Archive className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-semibold text-gray-600">x{order.quantity}</span>
              </div>
            )}
            {order.volume && (
              <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
                <Package className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-700">
                  {Number(order.volume).toLocaleString()} kg
                </span>
              </div>
            )}
          </div>

          {/* View Details button */}
          <button
            onClick={() => onViewDetails(order)}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold transition-colors"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default BuyerOrderCard