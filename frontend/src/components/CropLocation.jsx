import { MapPin } from 'lucide-react'

export const CropLocation = ({ farm, crop, showGps = false }) => {
  const data = farm || crop
  
  const hasLocation = data.province || data.municipality || data.barangay || data.farm_location || (showGps && data.gps_coordinates)
  
  if (!hasLocation && !data.farm_name) return null

  return (
    <div className="flex flex-col gap-0.5">
      {data.farm_name && (
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500 truncate">{data.farm_name}</span>
        </div>
      )}
      {(data.province || data.municipality || data.barangay) && (
        <div className="flex items-center gap-1 pl-4">
          <span className="text-[10px] text-gray-400 truncate">
            {data.barangay}{data.municipality && `, ${data.municipality}`}{data.province && `, ${data.province}`}
          </span>
        </div>
      )}
      {data.farm_location && (
        <div className="flex items-center gap-1 pl-4">
          <span className="text-[10px] text-gray-400 truncate">{data.farm_location}</span>
        </div>
      )}
      {showGps && data.gps_coordinates && (
        <div className="flex items-center gap-1 pl-4">
          <span className="text-[10px] text-gray-300 truncate">GPS: {data.gps_coordinates}</span>
        </div>
      )}
    </div>
  )
}

export default CropLocation