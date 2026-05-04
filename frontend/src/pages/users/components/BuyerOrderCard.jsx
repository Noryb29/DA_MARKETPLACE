import React from 'react'
import { Wheat, Package, Archive, Store, ChevronRight, MapPin, Calendar, Sprout } from 'lucide-react'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const BuyerOrderCard = ({ order, onViewDetails }) => {
  return (
    <div 
      onClick={() => onViewDetails(order)}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="h-28 bg-gray-100 relative">
        {order.harvest_photo ? (
          <img src={order.harvest_photo} alt={order.crop_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sprout className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {order.expected_arrival && (
          <div className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            Arrival
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div>
          <p className="font-bold text-gray-900 text-sm truncate">{order.crop_name}</p>
          {order.variety && <p className="text-xs text-gray-500 truncate">{order.variety}</p>}
        </div>

        {order.farm_name && (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Store className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-500 truncate">{order.farm_name}</span>
            </div>
            {(order.province || order.municipality || order.barangay) && (
              <div className="flex items-center gap-1 pl-4">
                <span className="text-[9px] text-gray-400 truncate">
                  {order.barangay}{order.municipality && `, ${order.municipality}`}{order.province && `, ${order.province}`}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {order.quantity && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
              <Archive className="w-2.5 h-2.5" />x{order.quantity}
            </span>
          )}
          {order.volume && (
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
              <Package className="w-2.5 h-2.5" />{order.volume}kg
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-400">{formatDateTime(order.order_date)}</span>
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default BuyerOrderCard