import { useState } from 'react'
import {ShoppingBag, Calendar, Package, User, MapPin, X, CheckCircle, Clock, Truck, DollarSign, MessageSquare, Store} from 'lucide-react'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Truck },
  completed: { label: 'Completed', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200', icon: X },
}

const FarmerOrderCard = ({ order }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const specs = [1,2,3,4,5,6,7,8].map(n => {
    const name = order[`specification_${n}_name`]
    const value = order[`specification_${n}_value`]
    return (name || value) ? `${name}: ${value}` : null
  }).filter(Boolean)

  const status = statusConfig[order.order_status] || statusConfig.pending
  const StatusIcon = status.icon

  const CardContent = () => (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-md transition-all duration-200">
      <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          {order.harvest_photo ? (
            <img src={order.harvest_photo} alt="Harvest" className="w-16 h-16 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-7 h-7 text-green-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold text-gray-900 text-base truncate">{order.crop_name}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1 shrink-0`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {status.label}
              </span>
            </div>
            
            {order.variety && (
              <p className="text-xs text-gray-500 mt-0.5">{order.variety}</p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              {order.buyer_profile_picture ? (
                <img src={order.buyer_profile_picture} alt="Buyer" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              )}
              <span className="text-xs text-gray-500 truncate">{order.buyer_first_name} {order.buyer_last_name}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {order.quantity && (
                <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                  <Package className="w-3 h-3 text-gray-500" />
                  <span className="text-[10px] font-semibold text-gray-600">x{order.quantity}</span>
                </div>
              )}
              {order.volume && (
                <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded px-2 py-1">
                  <ShoppingBag className="w-3 h-3 text-green-600" />
                  <span className="text-[10px] font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
                </div>
              )}
            </div>
            {order.total_price && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-700">₱{Number(order.total_price).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Store className="w-3 h-3" />
              <span className="truncate">{order.farm_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(order.order_date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!modalOpen) {
    return (
      <div onClick={() => setModalOpen(true)} className="cursor-pointer">
        <CardContent />
      </div>
    )
  }

  return (
    <>
      <div onClick={() => setModalOpen(true)} className="cursor-pointer">
        <CardContent />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
            
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Order Details</h2>
                <button 
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {order.harvest_photo && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img src={order.harvest_photo} alt="Harvest" className="w-full h-48 object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-xl text-gray-900">{order.crop_name}</p>
                  {order.variety && <p className="text-sm text-gray-500">{order.variety}</p>}
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${status.color} flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Order ID</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">#{order.crop_order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Order Date</span>
                  <span className="text-sm text-gray-700">{formatDateTime(order.order_date)}</span>
                </div>
                {order.expected_arrival && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Expected Arrival</span>
                    <span className="text-sm font-semibold text-amber-700">{formatDate(order.expected_arrival)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Quantity</span>
                  <span className="text-sm font-semibold text-gray-900">x{order.quantity || 1}</span>
                </div>
                {order.volume && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume</span>
                    <span className="text-sm font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
                  </div>
                )}
                {order.total_price && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">Total Price</span>
                    <span className="text-lg font-bold text-green-700">₱{Number(order.total_price).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-4 space-y-3">
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest">Buyer</p>
                <div className="flex items-center gap-3">
                  {order.buyer_profile_picture ? (
                    <img src={order.buyer_profile_picture} alt="Buyer" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-7 h-7 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-base font-bold text-gray-900">{order.buyer_first_name} {order.buyer_last_name}</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 mt-4 space-y-3">
                <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest">Farm Details</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Farm</span>
                  <span className="text-sm font-medium text-gray-800">{order.farm_name}</span>
                </div>
                {order.crop_location && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Location</span>
                    <span className="text-sm text-gray-800">{order.crop_location}</span>
                  </div>
                )}
              </div>

              {specs.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {specs.map((s, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {order.notes && (
                <div className="mt-4 bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-600 font-semibold uppercase">Notes</p>
                  </div>
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FarmerOrderCard