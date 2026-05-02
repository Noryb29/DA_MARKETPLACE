import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../public/components/SideBar'
import useFarmerStore from '../../store/FarmsStore'
import useProduceStore from '../../store/ProduceStore'
import EditFarmModal from './components/EditFarmModal.jsx'
import CropModal from './components/CropModal.jsx'
import { ArrowLeft, Loader2, MapPin, Ruler, AlertCircle, Leaf, Droplets, Sprout, Calendar, Package, FileText, MapPinned } from 'lucide-react'
import { getDaysUntilHarvest } from '../public/shopComponents/HarvestBadge'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmerFarmDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [editFarm, setEditFarm] = useState(null)
  const [cropModalOpen, setCropModalOpen] = useState(false)

  const { farm, farms, getFarms, getFarm, updateFarm, deleteFarm } = useFarmerStore()
  const { crops, getCrops, addCrop, deleteCrop } = useProduceStore()

  const currentFarm = farms.find(f => f.farm_id === parseInt(id))
  const farmCrops = crops.filter(c => c.farm_id === parseInt(id))

  useEffect(() => {
    getFarms()
    getCrops()
  }, [])

  const location = currentFarm ? [currentFarm.barangay, currentFarm.municipality, currentFarm.province].filter(Boolean).join(', ') : ''

  if (!currentFarm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar />
          <main className="flex-1 flex items-center justify-center px-6">
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Farm Not Found</h2>
              <p className="text-gray-600 mb-6">This farm does not exist or has been removed.</p>
              <button onClick={() => navigate('/farmer/dashboard/farm')} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl">
                Back to Farms
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            <button onClick={() => navigate('/farmer/dashboard/farm')} className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Farms
            </button>
              <h1 className='justify-center self-center text-left ml-35 text-2xl font-bold my-3'>Farm Details</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Farm Details */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-green-400 to-emerald-600 relative">
                    {currentFarm.farm_image ? (
                      <img src={currentFarm.farm_image.startsWith('http') ? currentFarm.farm_image : `${BASE_URL}${currentFarm.farm_image}`} alt={currentFarm.farm_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sprout className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-semibold rounded-full">Active</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{currentFarm.farm_name}</h1>

                    {location && (
                      <div className="flex items-start gap-2 bg-green-50 px-3 py-2 rounded-lg mb-4">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-green-800">{location}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {currentFarm.farm_hectares && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPinned className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] text-blue-700 font-semibold uppercase">Hectares</span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{currentFarm.farm_hectares} ha</p>
                        </div>
                      )}
                      {currentFarm.farm_elevation && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Leaf className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] text-amber-700 font-semibold uppercase">Elevation</span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{parseFloat(currentFarm.farm_elevation).toFixed(0)}m</p>
                        </div>
                      )}
                      {currentFarm.created_at && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] text-purple-700 font-semibold uppercase">Since</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{new Date(currentFarm.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</p>
                        </div>
                      )}
                    </div>

                    {currentFarm.plot_boundaries && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">Plot Boundaries</span>
                        </div>
                        <p className="text-xs text-gray-700">{currentFarm.plot_boundaries}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditFarm(currentFarm)}
                        className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Edit Farm
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this farm?')) {
                            await deleteFarm(currentFarm.farm_id)
                            navigate('/farmer/dashboard/farm')
                          }
                        }}
                        className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                      >
                        Delete Farm
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Crops */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-900">Your Crops</h2>
                    <span className="text-xs text-gray-400 font-medium">({farmCrops.length})</span>
                  </div>
                  <button
                    onClick={() => setCropModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    + Add Crop
                  </button>
                </div>

                {farmCrops.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <Sprout className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No crops listed yet</p>
                    <button
                      onClick={() => setCropModalOpen(true)}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      + Add Your First Crop
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {farmCrops.map(crop => (
                      <div key={crop.crop_id} onClick={() => setSelectedCrop(crop)} className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer overflow-hidden">
                        <div className="h-32 relative">
                          {crop.harvest_photo ? (
                            <img src={crop.harvest_photo} alt={crop.crop_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                              <Sprout className="w-10 h-10 text-green-300" />
                            </div>
                          )}
                          {crop.expected_harvest && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Calendar className="w-2 h-2" />
                              {getDaysUntilHarvest(crop.expected_harvest) <= 0 ? 'Ready' : `${getDaysUntilHarvest(crop.expected_harvest)}d`}
                            </div>
                          )}
                          {crop.specification_1 && (
                            <div className="absolute top-2 right-2 bg-white/90 text-gray-700 text-[9px] px-1.5 py-0.5 rounded-full font-medium">
                              {crop.specification_1}
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="font-bold text-gray-900 text-sm">{crop.crop_name}</p>
                          {crop.variety && <p className="text-xs text-gray-500 mt-0.5">{crop.variety}</p>}
                          
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            {crop.volume && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-semibold">
                                <Leaf className="w-2.5 h-2.5" />
                                {crop.volume}kg
                              </span>
                            )}
                            {crop.stock && (
                              <span className="inline-flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                <Package className="w-2.5 h-2.5" />
                                {crop.stock} pcs
                              </span>
                            )}
                          </div>

                          {crop.expected_harvest && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-2">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>Harvest: {new Date(crop.expected_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                          
                          {crop.maturity_days && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                              <Leaf className="w-2.5 h-2.5" />
                              <span>{crop.maturity_days} days to maturity</span>
                            </div>
                          )}

                          {[crop.specification_2, crop.specification_3, crop.specification_4].filter(Boolean).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                              {[2, 3, 4].map(n => crop[`specification_${n}`] && (
                                <span key={n} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  {crop[`specification_${n}`]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCrop.crop_name}</h2>
                <button onClick={() => setSelectedCrop(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4">
                {selectedCrop.harvest_photo ? (
                  <img src={selectedCrop.harvest_photo} alt={selectedCrop.crop_name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Sprout className="w-12 h-12 text-green-300" />
                  </div>
                )}
              </div>

              {selectedCrop.variety && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Variety</p>
                  <p className="text-sm text-gray-800">{selectedCrop.variety}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {selectedCrop.volume && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] text-green-700 font-semibold uppercase">Volume</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.volume).toLocaleString()} kg</p>
                  </div>
                )}
                {selectedCrop.stock && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] text-blue-700 font-semibold uppercase">Stock</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.stock).toLocaleString()} pcs</p>
                  </div>
                )}
                {selectedCrop.expected_volume && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[10px] text-purple-700 font-semibold uppercase">Expected</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.expected_volume).toLocaleString()} kg</p>
                  </div>
                )}
                {selectedCrop.maturity_days && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] text-amber-700 font-semibold uppercase">Maturity</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedCrop.maturity_days} days</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {selectedCrop.planting_date && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Planting Date</span>
                    <span className="text-sm font-medium text-gray-800">{new Date(selectedCrop.planting_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.expected_harvest && (
                  <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-amber-700">Expected Harvest</span>
                    <span className="text-sm font-bold text-amber-700">{new Date(selectedCrop.expected_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.actual_harvest && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-700">Actual Harvest</span>
                    <span className="text-sm font-bold text-green-700">{new Date(selectedCrop.actual_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.location && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Harvest Location</span>
                    <span className="text-sm font-medium text-gray-800">{selectedCrop.location}</span>
                  </div>
                )}
              </div>

              {[1, 2, 3, 4, 5].some(n => selectedCrop[`specification_${n}`]) && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(n => selectedCrop[`specification_${n}`] && (
                      <span key={n} className="text-xs bg-gray-100 text-gray-600 px-2 py-1.5 rounded-lg">
                        {selectedCrop[`specification_${n}`]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCrop.total_harvest && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs text-green-700 font-medium">Total Harvest</span>
                  <span className="text-sm font-bold text-green-700">{Number(selectedCrop.total_harvest).toLocaleString()} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <EditFarmModal
        isOpen={!!editFarm}
        onClose={() => setEditFarm(null)}
        onSubmit={async (form) => {
          if (!editFarm) return
          await updateFarm(editFarm.farm_id, form)
          setEditFarm(null)
          getFarms()
          getFarm()
        }}
        farm={editFarm}
      />

      <CropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        onSubmit={async (form) => {
          await addCrop({ ...form, farm_id: parseInt(id) })
          setCropModalOpen(false)
          getCrops()
        }}
        farms={[currentFarm].filter(Boolean)}
      />
    </div>
  )
}

export default FarmerFarmDetails