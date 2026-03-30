import React from 'react'
import { Wheat, MapPin, Package, Archive, ShoppingCart } from 'lucide-react'
import HarvestBadge, { formatDate } from './HarvestBadge'
import useCartStore from '../../../store/CartStore'
import useUserStore from '../../../store/UserStore'
import Swal from 'sweetalert2'

const CropRow = ({ crop }) => {
  const { addToCart } = useCartStore()
  const { user } = useUserStore()

  const specs = [1, 2, 3, 4, 5]
    .map((n) => crop[`specification_${n}`])
    .filter(Boolean)

  const handleAddToCart = () => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in or create an account to add items to your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Maybe Later',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
      return
    }
    addToCart(crop)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-green-300 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center gap-4">

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
          <Wheat className="w-5 h-5 text-green-600" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 text-sm">{crop.crop_name}</p>
            {crop.variety && (
              <span className="text-xs text-gray-400 font-medium">· {crop.variety}</span>
            )}
            <HarvestBadge date={crop.expected_harvest} />
          </div>

          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 truncate">{crop.farm_name}</span>
          </div>

          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {specs.map((s, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col items-end gap-2 shrink-0">

          {/* Volume + Stock */}
          {(crop.volume || crop.stock) && (
            <div className="flex items-center gap-2">
              {crop.volume && (
                <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                  <Package className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold text-green-700">
                    {Number(crop.volume).toLocaleString()} <span className="font-normal">kg</span>
                  </span>
                </div>
              )}
              {crop.stock && (
                <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                  <Archive className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">
                    {Number(crop.stock).toLocaleString()} <span className="font-normal">pcs</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-3 text-right">
            {crop.planting_date && (
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Planted</p>
                <p className="text-xs font-semibold text-gray-600">{formatDate(crop.planting_date)}</p>
              </div>
            )}
            {crop.expected_harvest && (
              <>
                <div className="w-px h-8 bg-gray-100" />
                <div>
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Harvest</p>
                  <p className="text-xs font-semibold text-amber-700">{formatDate(crop.expected_harvest)}</p>
                </div>
              </>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-600 hover:to-emerald-700 text-white text-xs font-semibold
              active:scale-[0.97] transition-all shadow-sm shadow-green-200"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default CropRow