import { Wheat,Pencil, Trash2, Calendar, Package, MapPin, ImageIcon } from 'lucide-react'

const CropCard = ({ crop, onEdit, onDelete, onClick }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return (
    <div 
      onClick={() => onClick?.(crop)}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-200 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
    >

      {/* Harvest Photo */}
      {crop.harvest_photo && (
        <div className="relative rounded-lg overflow-hidden">
          <img src={crop.harvest_photo} alt="Harvest" className="w-full h-32 object-cover" />
        </div>
      )}

      {/* Top row */}
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
            {crop.farm_name && (
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] text-gray-500 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{crop.farm_name}</p>
              {(crop.province || crop.municipality || crop.barangay) && (
                <p className="text-[9px] text-gray-400 pl-4 truncate">
                  {crop.barangay}{crop.municipality && `, ${crop.municipality}`}{crop.province && `, ${crop.province}`}
                </p>
              )}
              {crop.farm_location && (
                <p className="text-[9px] text-gray-400 pl-4 truncate">{crop.farm_location}</p>
              )}
              {crop.gps_coordinates && (
                <p className="text-[9px] text-gray-300 pl-4 truncate">GPS: {crop.gps_coordinates}</p>
              )}
            </div>
          )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(crop)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(crop.crop_id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Volume */}
      {crop.volume && (
        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
          <Package className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="text-xs font-semibold text-green-700">{Number(crop.volume).toLocaleString()} kg</span>
        </div>
      )}

      {/* Dates */}
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

      {/* Specs */}
      {[1, 2, 3, 4, 5, 6, 7, 8].some(n => crop[`specification_${n}_name`] || crop[`specification_${n}_value`]) && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-semibold text-green-600 uppercase tracking-wide">Specs:</span>
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
            const name = crop[`specification_${n}_name`]
            const value = crop[`specification_${n}_value`]
            return (name || value) ? (
              <span key={n} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold border border-green-200">
                {name}: <span className="font-normal">{value}</span>
              </span>
            ) : null
          })}
        </div>
      )}

      {/* Location */}
      {crop.location && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{crop.location}</span>
        </div>
      )}
    </div>
  )
}

export default CropCard