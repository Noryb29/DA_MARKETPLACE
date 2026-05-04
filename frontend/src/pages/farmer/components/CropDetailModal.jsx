import { X, Wheat, Package, Calendar, MapPin, Sprout, Layers } from 'lucide-react'
import CropLocation from '../../../components/CropLocation'

const CropDetailModal = ({ crop, onClose }) => {
  if (!crop) return null

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <h1></h1>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />
        
        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-xl">
                <Wheat className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{crop.crop_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{crop.variety || 'No variety specified'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Image */}
          {crop.harvest_photo && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img src={crop.harvest_photo} alt="Harvest" className="w-full h-56 object-cover" />
            </div>
          )}

          <div className="space-y-5">
            {/* Production Stats */}
            {(crop.volume || crop.stock || crop.total_harvest || crop.expected_volume) && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Production</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {crop.volume !== null && crop.volume !== undefined && (
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-400 font-medium uppercase">Volume</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{Number(crop.volume).toLocaleString()} <span className="text-xs font-normal text-gray-500">kg</span></p>
                    </div>
                  )}
                  {crop.stock !== null && crop.stock !== undefined && (
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-400 font-medium uppercase">Stock</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{Number(crop.stock).toLocaleString()} <span className="text-xs font-normal text-gray-500">pcs</span></p>
                    </div>
                  )}
                  {crop.expected_volume !== null && crop.expected_volume !== undefined && (
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-400 font-medium uppercase">Expected</p>
                      <p className="text-lg font-bold text-gray-800 mt-1">{Number(crop.expected_volume).toLocaleString()} <span className="text-xs font-normal text-gray-500">kg</span></p>
                    </div>
                  )}
                  {crop.total_harvest !== null && crop.total_harvest !== undefined && (
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-gray-400 font-medium uppercase">Harvested</p>
                      <p className="text-lg font-bold text-green-600 mt-1">{Number(crop.total_harvest).toLocaleString()} <span className="text-xs font-normal text-gray-500">kg</span></p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            {(crop.planting_date || crop.expected_harvest || crop.actual_harvest || crop.maturity_days) && (
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Timeline</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {crop.planting_date !== null && crop.planting_date !== undefined && (
                    <div className="flex-1 min-w-[140px] bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-green-600 font-semibold uppercase">Planted</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(crop.planting_date)}</p>
                    </div>
                  )}
                  {crop.maturity_days !== null && crop.maturity_days !== undefined && (
                    <div className="flex-1 min-w-[140px] bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-purple-600 font-semibold uppercase">Maturity</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{crop.maturity_days} <span className="text-xs font-normal text-gray-500">days</span></p>
                    </div>
                  )}
                  {crop.expected_harvest !== null && crop.expected_harvest !== undefined && (
                    <div className="flex-1 min-w-[140px] bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-amber-600 font-semibold uppercase">Expected</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(crop.expected_harvest)}</p>
                    </div>
                  )}
                  {crop.actual_harvest !== null && crop.actual_harvest !== undefined && (
                    <div className="flex-1 min-w-[140px] bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-xs text-emerald-600 font-semibold uppercase">Harvested</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{formatDate(crop.actual_harvest)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Specifications */}
            {[1, 2, 3, 4, 5, 6, 7, 8].some(n => crop[`specification_${n}_name`] || crop[`specification_${n}_value`]) && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-bold text-green-800 uppercase tracking-wide">Specifications</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const name = crop[`specification_${n}_name`]
                    const metric = crop[`specification_${n}_metric`]
                    const value = crop[`specification_${n}_value`]
                    return (name || value) ? (
                      <span key={n} className="text-sm bg-white text-green-700 px-4 py-2 rounded-xl shadow-sm font-semibold border border-green-200">
                        <span className="text-green-800">{name}:</span> {value}{metric && <span className="text-green-600"> {metric}</span>}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Farm Details */}
            {(crop.province || crop.municipality || crop.barangay || crop.farm_location || crop.gps_coordinates || crop.farm_name) && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Farm Details</h3>
                </div>
                <CropLocation crop={crop} showGps={true} />
              </div>
            )}

            {/* Harvest Location */}
            {crop.location && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Harvest Location</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{crop.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CropDetailModal