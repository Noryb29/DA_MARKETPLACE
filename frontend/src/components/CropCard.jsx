import { MapPin, Package, Archive, Calendar, Leaf, Sprout, Wheat, Pencil, Trash2, ImageIcon } from 'lucide-react'
import CropLocation from './CropLocation'

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) : '—'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const getCropEmoji = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('rice')) return '🌾'
  if (n.includes('corn') || n.includes('mais')) return '🌽'
  if (n.includes('tomato')) return '🍅'
  if (n.includes('mango')) return '🥭'
  if (n.includes('banana')) return '🍌'
  if (n.includes('carrot')) return '🥕'
  if (n.includes('pepper')) return '🌶️'
  if (n.includes('onion')) return '🧅'
  if (n.includes('garlic')) return '🧄'
  if (n.includes('potato')) return '🥔'
  if (n.includes('eggplant') || n.includes('talong')) return '🍆'
  if (n.includes('cabbage')) return '🥬'
  if (n.includes('lettuce')) return '🥗'
  if (n.includes('pineapple')) return '🍍'
  if (n.includes('watermelon')) return '🍉'
  return '🌱'
}

export const CropCard = ({ 
  crop, 
  onClick,
  variant = 'default',
  showAddToCart = false,
  onAddToCart,
  showActions = false,
  onEdit,
  onDelete
}) => {
  const imageSrc = crop.harvest_photo
    ? (crop.harvest_photo.startsWith('http') ? crop.harvest_photo : `${BASE_URL}${crop.harvest_photo}`)
    : null

  const specs = [1,2,3,4,5,6,7,8].map(n => {
    const name = crop[`specification_${n}_name`]
    const value = crop[`specification_${n}_value`]
    return (name || value) ? `${name}: ${value}` : null
  }).filter(Boolean)

  // Featured variant (large card with emoji)
  if (variant === 'featured') {
    return (
      <div
        onClick={onClick}
        className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-xl transition-all duration-300 flex flex-col"
      >
        <div className="h-1 w-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 px-6 pt-6 pb-4 flex items-center justify-between">
          <span className="text-5xl select-none">{getCropEmoji(crop.crop_name)}</span>
          {crop.expected_harvest && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              Harvest {formatDate(crop.expected_harvest)}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 px-5 py-4 gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{crop.crop_name}</h3>
            {crop.variety && <p className="text-xs text-gray-400 mt-0.5">{crop.variety}</p>}
          </div>
          
          <CropLocation crop={crop} showGps={true} />

          {(crop.volume || crop.stock) && (
            <div className="flex items-center gap-2 flex-wrap">
              {crop.volume && (
                <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
                  <Package className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-semibold text-green-700">{Number(crop.volume).toLocaleString()} kg</span>
                </div>
              )}
              {crop.stock && (
                <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                  <Archive className="w-3 h-3 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-700">{Number(crop.stock).toLocaleString()} pcs</span>
                </div>
              )}
            </div>
          )}

          {specs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {specs.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold border border-green-200">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="flex-1" />
          <button className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold">
            View in Shop
          </button>
        </div>
      </div>
    )
  }

  // Shop variant (card with image)
  if (variant === 'shop') {
    return (
      <div
        onClick={onClick}
        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
      >
        <div className="h-44 bg-gray-100 relative overflow-hidden">
          {imageSrc ? (
            <img src={imageSrc} alt={crop.crop_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
              <Sprout className="w-12 h-12 text-green-300" />
            </div>
          )}
          {crop.stock > 50 && (
            <span className="absolute top-2.5 left-2.5 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              In Stock
            </span>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="font-bold text-gray-900 truncate">{crop.crop_name}</p>
            {crop.variety && <p className="text-xs text-gray-400 truncate mt-0.5">{crop.variety}</p>}
          </div>
          
          <CropLocation crop={crop} showGps={true} />

          <div className="flex items-center gap-2 flex-wrap">
            {crop.volume && (
              <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
                <Package className="w-2.5 h-2.5" />{crop.volume} kg
              </span>
            )}
            {crop.stock && (
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1 font-medium">
                <Leaf className="w-2.5 h-2.5" />{crop.stock} pcs
              </span>
            )}
          </div>

          {crop.expected_harvest && (
            <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span className="text-[10px] text-amber-600 font-medium">Harvest: {formatDate(crop.expected_harvest)}</span>
            </div>
          )}

          {showAddToCart && onAddToCart && (
            <button 
              onClick={(e) => { e.stopPropagation(); onAddToCart(crop); }}
              className="w-full py-2 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    )
  }

  // Farmer variant (with edit/delete buttons)
  if (variant === 'farmer') {
    return (
      <div 
        onClick={() => onClick?.(crop)}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-200 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      >
        {crop.harvest_photo && (
          <div className="relative rounded-lg overflow-hidden">
            <img src={imageSrc} alt="Harvest" className="w-full h-32 object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {!crop.harvest_photo && (
              <div className="bg-green-100 p-2.5 rounded-xl shrink-0">
                <Wheat className="w-5 h-5 text-green-600" />
              </div>
            )}
            {crop.harvest_photo && (
              <div className="bg-green-100 p-2 rounded-xl shrink-0">
                <ImageIcon className="w-4 h-4 text-green-600" />
              </div>
            )}
            <div>
              <p className="font-bold text-gray-800 text-sm leading-tight">{crop.crop_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{crop.variety || 'No variety'}</p>
              <div className="mt-1">
                <CropLocation crop={crop} showGps={true} />
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              {onEdit && (
                <button onClick={() => onEdit(crop)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(crop.crop_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {crop.volume && (
          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
            <Package className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span className="text-xs font-semibold text-green-700">{Number(crop.volume).toLocaleString()} kg</span>
          </div>
        )}

        {(crop.planting_date || crop.expected_harvest) && (
          <div className="grid grid-cols-2 gap-2">
            {crop.planting_date && (
              <div className="bg-gray-50 rounded-lg px-2.5 py-2">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Planted</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(crop.planting_date)}
                </p>
              </div>
            )}
            {crop.expected_harvest && (
              <div className="bg-amber-50 rounded-lg px-2.5 py-2">
                <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Harvest</p>
                <p className="text-xs font-semibold text-amber-700 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-400" />
                  {formatDate(crop.expected_harvest)}
                </p>
              </div>
            )}
          </div>
        )}

        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-semibold text-green-600 uppercase tracking-wide">Specs:</span>
            </div>
            {specs.map((s, i) => (
              <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold border border-green-200">
                {s}
              </span>
            ))}
          </div>
        )}

        {crop.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="line-clamp-1">{crop.location}</span>
          </div>
        )}
      </div>
    )
  }

  // Default variant (compact card)
  return (
    <div onClick={onClick} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="h-36 bg-gray-100 relative">
        {imageSrc ? (
          <img src={imageSrc} alt={crop.crop_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Wheat className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{crop.crop_name}</p>
          {crop.variety && <p className="text-xs text-gray-400">{crop.variety}</p>}
        </div>
        <CropLocation crop={crop} />
        <div className="flex items-center gap-2 flex-wrap">
          {crop.volume && (
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
              <Package className="w-2.5 h-2.5" />{crop.volume}kg
            </span>
          )}
          {crop.stock && (
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
              <Archive className="w-2.5 h-2.5" />{crop.stock} pcs
            </span>
          )}
        </div>
        {crop.expected_harvest && (
          <div className="flex items-center gap-1 text-[10px] text-amber-600">
            <Calendar className="w-2.5 h-2.5" />
            <span>Harvest: {formatDate(crop.expected_harvest)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CropCard