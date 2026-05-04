import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'
import useMarketStore from '../../../store/MarketStore'
import { ArrowLeft, Loader2, MapPin, Ruler, User, AlertCircle, Leaf, Droplets, Sprout, Calendar, Package, FileText, MapPinned, ExternalLink } from 'lucide-react'
import Swal from 'sweetalert2'
import useCartStore from '../../../store/CartStore'
import useUserStore from '../../../store/UserStore'
import { getDaysUntilHarvest } from '../shopComponents/HarvestBadge'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  const { selectedFarm: farm, farmCrops: crops, farmLoading: loading, getFarmDetails, clearFarmDetails } = useMarketStore()
  const { addToCart } = useCartStore()
  const { user } = useUserStore()

  useEffect(() => {
    if (!id) {
      setError('Invalid farm ID')
      return
    }
    getFarmDetails(id).catch(err => {
      console.error('Error fetching farm details:', err)
      setError('Failed to load farm details. Please try again.')
    })
    return () => clearFarmDetails()
  }, [id])

  useEffect(() => {
    if (id && user) {
      setLoadingDocs(true)
      const token = localStorage.getItem('token')
      fetch(`${BASE_URL}/api/farmers/farm/${id}/documents`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => res.json())
        .then(data => {
          setDocuments(data.documents || [])
          setLoadingDocs(false)
        })
        .catch(() => setLoadingDocs(false))
    }
  }, [id, user])

  const handleAddToCart = (crop) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to add items to your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Maybe Later',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login'
      })
      return
    }
    addToCart(crop)
    setSelectedCrop(null)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const location = farm ? [farm.barangay, farm.municipality, farm.province].filter(Boolean).join(', ') : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-green-600" />
          </main>
        </div>
      </div>
    )
  }

  if (error || !farm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar />
          <main className="flex-1 flex items-center justify-center px-6">
            <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Farm Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'This farm does not exist or has been removed.'}</p>
              <button onClick={() => navigate('/shop/farms')} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl">
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
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Farms
            </button>
              <h1 className='justify-center self-center text-left ml-35 text-2xl font-bold my-3'>Farm Details</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Farm Details */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-40 bg-linear-to-br from-green-400 to-emerald-600 relative">
                    {farm.farm_image ? (
                      <img src={farm.farm_image.startsWith('http') ? farm.farm_image : `${BASE_URL}${farm.farm_image}`} alt={farm.farm_name} className="w-full h-full object-cover" />
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
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{farm.farm_name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <User className="w-4 h-4" />
                      <span>{farm.firstname} {farm.lastname}</span>
                    </div>

                    {location && (
                      <div className="flex items-start gap-2 bg-green-50 px-3 py-2 rounded-lg mb-4">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-green-800">{location}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {/* {farm.farm_area && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Ruler className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[10px] text-green-700 font-semibold uppercase">Area</span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{(parseFloat(farm.farm_area) / 1000).toFixed(1)}k m²</p>
                        </div>
                      )} */}
                      {farm.farm_hectares && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPinned className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] text-blue-700 font-semibold uppercase">Hectares</span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{farm.farm_hectares} ha</p>
                        </div>
                      )}
                      {farm.farm_elevation && (
                        <div className="bg-amber-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Leaf className="w-3.5 h-3.5 text-amber-600" />
                            <span className="text-[10px] text-amber-700 font-semibold uppercase">Elevation</span>
                          </div>
                          <p className="text-base font-bold text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)}m</p>
                        </div>
                      )}
                      {farm.created_at && (
                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-600" />
                            <span className="text-[10px] text-purple-700 font-semibold uppercase">Since</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{new Date(farm.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</p>
                        </div>
                      )}
                    </div>

                    {farm.plot_boundaries && (
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[10px] font-semibold text-gray-500 uppercase">Plot Boundaries</span>
                        </div>
                        <p className="text-xs text-gray-700">{farm.plot_boundaries}</p>
                      </div>
                    )}

                    {/* <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Documents ({documents.length})</span>
                      </div>
                      {documents.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {documents.map(doc => (
                            <a key={doc.doc_id} href={`${BASE_URL}/api/farmers/documents/${doc.doc_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors">
                              <FileText className="w-3 h-3 text-red-500" />
                              <span className="text-gray-700">{doc.file_name}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No documents</p>
                      )}
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Right Column - Crops */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">Available Crops</h2>
                  <span className="text-xs text-gray-400 font-medium">({crops.length})</span>
                </div>

                {crops.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                    <Sprout className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No crops listed yet</p>
                    <p className="text-xs text-gray-400 mt-1">Check back later for fresh produce</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {crops.map(crop => (
                      <div key={crop.crop_id} onClick={() => setSelectedCrop(crop)} className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer overflow-hidden">
                        <div className="h-32 relative">
                          {crop.harvest_photo ? (
                            <img src={crop.harvest_photo} alt={crop.crop_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                              <Sprout className="w-10 h-10 text-green-300" />
                            </div>
                          )}
                          {crop.expected_harvest && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <Calendar className="w-2 h-2" />
                              {getDaysUntilHarvest(crop.expected_harvest) <= 0 ? 'Ready' : `${getDaysUntilHarvest(crop.expected_harvest)}d`}
                            </div>
                          )}
                          {(crop.specification_1_name || crop.specification_1_value) && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold">
                              {crop.specification_1_name}: {crop.specification_1_value}
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="font-bold text-gray-900 text-sm">{crop.crop_name}</p>
                          {crop.variety && <p className="text-xs text-gray-500 mt-0.5">{crop.variety}</p>}
                          
                          {(crop.province || crop.municipality || crop.barangay || crop.farm_location || crop.gps_coordinates) && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              {(crop.province || crop.municipality || crop.barangay) && (
                                <p className="text-[10px] text-gray-400 truncate">
                                  {crop.barangay}{crop.municipality && `, ${crop.municipality}`}{crop.province && `, ${crop.province}`}
                                </p>
                              )}
                              {crop.farm_location && (
                                <p className="text-[10px] text-gray-400 truncate">{crop.farm_location}</p>
                              )}
                              {crop.gps_coordinates && (
                                <p className="text-[10px] text-gray-300 truncate">GPS: {crop.gps_coordinates}</p>
                              )}
                            </div>
                          )}
                          
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

                          {[2, 3, 4, 5, 6, 7, 8].some(n => crop[`specification_${n}_name`] || crop[`specification_${n}_value`]) && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100">
                              {[2, 3, 4, 5, 6, 7, 8].map(n => {
                                const name = crop[`specification_${n}_name`]
                                const value = crop[`specification_${n}_value`]
                                return (name || value) && (
                                  <span key={n} className="text-[8px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded border border-green-200">
                                    {name}: {value}
                                  </span>
                                )
                              })}
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
            <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />
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
                  <div className="w-full h-44 bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center">
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
                    <span className="text-sm font-medium text-gray-800">{formatDate(selectedCrop.planting_date)}</span>
                  </div>
                )}
                {selectedCrop.expected_harvest && (
                  <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-amber-700">Expected Harvest</span>
                    <span className="text-sm font-bold text-amber-700">{formatDate(selectedCrop.expected_harvest)}</span>
                  </div>
                )}
                {selectedCrop.actual_harvest && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-700">Actual Harvest</span>
                    <span className="text-sm font-bold text-green-700">{formatDate(selectedCrop.actual_harvest)}</span>
                  </div>
                )}
                {selectedCrop.location && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Harvest Location</span>
                    <span className="text-sm font-medium text-gray-800">{selectedCrop.location}</span>
                  </div>
                )}
              </div>

              {[1, 2, 3, 4, 5, 6, 7, 8].some(n => selectedCrop[`specification_${n}_name`] || selectedCrop[`specification_${n}_value`]) && (
                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                      const name = selectedCrop[`specification_${n}_name`]
                      const value = selectedCrop[`specification_${n}_value`]
                      return (name || value) && (
                        <span key={n} className="text-xs bg-white text-green-700 font-semibold px-3 py-1.5 rounded-lg border border-green-200">
                          {name}: <span className="font-normal">{value}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedCrop.total_harvest && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs text-green-700 font-medium">Total Harvest</span>
                  <span className="text-sm font-bold text-green-700">{Number(selectedCrop.total_harvest).toLocaleString()} kg</span>
                </div>
              )}

              <button onClick={() => handleAddToCart(selectedCrop)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold shadow-md shadow-green-200">
                <Package className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
)}
    </div>
  )
}

export default FarmDetailsPage