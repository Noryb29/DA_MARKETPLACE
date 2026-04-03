import { useState } from 'react'
import {ShoppingBag, Calendar, Package,ClipboardList, User, ChevronDown, ChevronUp,Archive, Store} from 'lucide-react'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const FarmerOrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false)
  const specs = [1,2,3,4,5].map(n => order[`specification_${n}`]).filter(Boolean)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-green-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-blue-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{order.crop_name}</p>
            {order.variety && <span className="text-xs text-gray-400">· {order.variety}</span>}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <User className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400">{order.buyer_first_name} {order.buyer_last_name}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Ordered {formatDateTime(order.order_date)}</p>
        </div>

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
                <span className="text-xs font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 font-semibold transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Store className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Farm</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{order.farm_name}</p>
            </div>

            <div className="bg-amber-50 rounded-xl border border-amber-100 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-widest">Expected Arrival</p>
              </div>
              <p className="text-sm font-bold text-amber-800">{formatDate(order.expected_arrival)}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <ClipboardList className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Order ID</p>
              </div>
              <p className="text-sm font-bold text-gray-800 font-mono">#{order.crop_order_id}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Buyer</p>
              </div>
              <p className="text-sm font-bold text-gray-800">{order.buyer_first_name} {order.buyer_last_name}</p>
            </div>
          </div>

          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {specs.map((s, i) => (
                <span key={i} className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FarmerOrderCard