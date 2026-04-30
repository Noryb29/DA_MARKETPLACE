import { useState } from 'react'
import {ShoppingBag, Calendar, Package,ClipboardList, User, Archive, Store, MapPin, X} from 'lucide-react'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—'

const FarmerOrderCard = ({ order }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const specs = [1,2,3,4,5].map(n => order[`specification_${n}`]).filter(Boolean)

  if (!modalOpen) {
    return (
      <div 
        onClick={() => setModalOpen(true)}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer max-w-sm"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {order.harvest_photo ? (
            <img src={order.harvest_photo} alt="Harvest" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-sm truncate">{order.crop_name}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {order.buyer_profile_picture ? (
                <img src={order.buyer_profile_picture} alt="Buyer" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <User className="w-3 h-3 text-gray-400 shrink-0" />
              )}
              <span className="text-xs text-gray-400 truncate">{order.buyer_first_name} {order.buyer_last_name}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {order.quantity && (
              <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5">
                <span className="text-[10px] font-semibold text-gray-600">x{order.quantity}</span>
              </div>
            )}
            {order.volume && (
              <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded px-2 py-0.5">
                <span className="text-[10px] font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div 
        onClick={() => setModalOpen(true)}
        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-200 hover:shadow-md transition-all duration-200 cursor-pointer max-w-sm"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {order.harvest_photo ? (
            <img src={order.harvest_photo} alt="Harvest" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-900 text-sm truncate">{order.crop_name}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {order.buyer_profile_picture ? (
                <img src={order.buyer_profile_picture} alt="Buyer" className="w-3.5 h-3.5 rounded-full object-cover" />
              ) : (
                <User className="w-3 h-3 text-gray-400 shrink-0" />
              )}
              <span className="text-xs text-gray-400 truncate">{order.buyer_first_name} {order.buyer_last_name}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            {order.quantity && (
              <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-0.5">
                <span className="text-[10px] font-semibold text-gray-600">x{order.quantity}</span>
              </div>
            )}
            {order.volume && (
              <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded px-2 py-0.5">
                <span className="text-[10px] font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full bg-linear-to-r from-blue-400 via-green-500 to-teal-400" />
            
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
                  <img src={order.harvest_photo} alt="Harvest" className="w-full h-44 object-cover" />
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Crop</span>
                  <span className="text-sm font-bold text-gray-900">{order.crop_name}</span>
                </div>
                {order.variety && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Variety</span>
                    <span className="text-sm text-gray-700">{order.variety}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Order ID</span>
                  <span className="text-sm font-bold text-gray-900 font-mono">#{order.crop_order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Ordered</span>
                  <span className="text-sm text-gray-700">{formatDateTime(order.order_date)}</span>
                </div>
                {order.quantity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Quantity</span>
                    <span className="text-sm font-semibold text-gray-900">x{order.quantity}</span>
                  </div>
                )}
                {order.volume && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume</span>
                    <span className="text-sm font-semibold text-green-700">{Number(order.volume).toLocaleString()} kg</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Expected Arrival</span>
                  <span className="text-sm font-semibold text-amber-700">{formatDate(order.expected_arrival)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Farm</span>
                  <span className="text-sm text-gray-700">{order.farm_name}</span>
                </div>
                {order.crop_location && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Location</span>
                    <span className="text-sm text-gray-700">{order.crop_location}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mt-4">
                <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-widest mb-2">Buyer</p>
                <div className="flex items-center gap-3">
                  {order.buyer_profile_picture ? (
                    <img src={order.buyer_profile_picture} alt="Buyer" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-900">{order.buyer_first_name} {order.buyer_last_name}</p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                </div>
              </div>

              {specs.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specs.map((s, i) => (
                      <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
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