import { Sprout, MapPin, User, Ruler, MapPinned, Leaf, FileText } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

export const FarmCard = ({ farm, onViewClick, index }) => {
  const getDocsCount = () => {
    if (!farm.farm_docs) return 0
    if (Array.isArray(farm.farm_docs)) return farm.farm_docs.length
    if (typeof farm.farm_docs === 'string' && farm.farm_docs.startsWith('[')) {
      try { return JSON.parse(farm.farm_docs).length } catch (e) { return 0 }
    }
    return 0
  }

  const docsCount = getDocsCount()
  const address = [farm.barangay, farm.municipality, farm.province].filter(Boolean).join(', ')

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group" 
      onClick={onViewClick}
    >
      <div className="h-36 bg-gradient-to-br from-green-400 to-emerald-600 relative">
        {farm.farm_image ? (
          <img 
            src={farm.farm_image.startsWith('http') ? farm.farm_image : `${BASE_URL}${farm.farm_image}`} 
            alt={farm.farm_name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sprout className="w-14 h-14 text-white/40" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-semibold rounded-full">
            Active
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{farm.farm_name}</h3>
        
        <div className="flex items-center gap-1.5 mb-3">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 truncate">{farm.firstname} {farm.lastname}</span>
        </div>

        {address && (
          <div className="flex items-start gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-500 line-clamp-2">{address}</span>
          </div>
        )}

        {farm.farm_location && (
          <div className="flex items-start gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-400 line-clamp-1">{farm.farm_location}</span>
          </div>
        )}

        {farm.gps_coordinates && (
          <div className="flex items-start gap-1.5 mb-3">
            <MapPin className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
            <span className="text-xs text-gray-400 line-clamp-1">GPS: {farm.gps_coordinates}</span>
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-gray-100">
          {farm.farm_area && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-semibold text-green-700">{(parseFloat(farm.farm_area) / 1000).toFixed(1)}k m²</span>
            </div>
          )}
          {farm.farm_hectares && (
            <div className="flex items-center gap-1">
              <MapPinned className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-700">{farm.farm_hectares} ha</span>
            </div>
          )}
          {farm.farm_elevation && (
            <div className="flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{parseFloat(farm.farm_elevation).toFixed(0)}m</span>
            </div>
          )}
          {docsCount > 0 && (
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-semibold text-purple-700">{docsCount} docs</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FarmCard