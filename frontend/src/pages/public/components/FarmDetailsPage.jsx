import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'
import useMarketStore from '../../../store/MarketStore'
import { ArrowLeft, Loader2, MapPin, Ruler, User, AlertCircle, Leaf, Droplets, Sprout, Calendar, Package, Archive, FileText, MapPinned } from 'lucide-react'
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

  const {
    selectedFarm: farm,
    farmCrops: crops,
    farmLoading: loading,
    getFarmDetails,
    clearFarmDetails
  } = useMarketStore()

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

    return () => {
      clearFarmDetails()
    }
  }, [id])

  useEffect(() => {
    if (id) {
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
  }, [id])

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
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
      return
    }
    addToCart(crop)
    setSelectedCrop(null)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

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
              <button
                onClick={() => navigate('/shop/farms')}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
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

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {/* Farm Hero Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
              {/* Header Image */}
              <div className="h-40 bg-gradient-to-r from-green-500 to-emerald-600 relative">
                {farm.farm_image ? (
                  <img src={farm.farm_image.startsWith('http') ? farm.farm_image : `${BASE_URL}${farm.farm_image}`} alt={farm.farm_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sprout className="w-16 h-16 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-3 py-1.5 bg-amber-500 text-amber text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Farm Name & Farmer */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{farm.farm_name}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{farm.firstname} {farm.lastname}</span>
                    </div>
                  </div>
                </div>

                {/* Farm Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {farm.farm_area && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-[10px] text-green-700 font-semibold uppercase">Area (sqm)</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{parseFloat(farm.farm_area).toLocaleString()}</p>
                    </div>
                  )}
                  {farm.total_acres && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPinned className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] text-blue-700 font-semibold uppercase">Total Acres</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{farm.total_acres}</p>
                    </div>
                  )}
                  {farm.farm_elevation && (
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Leaf className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] text-amber-700 font-semibold uppercase">Elevation</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)}m</p>
                    </div>
                  )}
                  {farm.created_at && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[10px] text-purple-700 font-semibold uppercase">Since</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(farm.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Plot Boundaries */}
                {farm.plot_boundaries && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase">Plot Boundaries</span>
                    </div>
                    <p className="text-sm text-gray-700">{farm.plot_boundaries}</p>
                  </div>
                )}

                {/* Documents */}
                {loadingDocs ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase">Farm Documents</span>
                    </div>
                    <p className="text-xs text-gray-400">Loading...</p>
                  </div>
                ) : documents.length > 0 ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-500 uppercase">Farm Documents ({documents.length})</span>
                    </div>
                    <div className="space-y-3">
                      {documents.map((doc) => {
                        const docUrl = `${BASE_URL}/api/farmers/documents/${doc.doc_id}`
                        return (
                          <div key={doc.doc_id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-xs font-medium text-gray-600 truncate">{doc.file_name}</span>
                              </div>
                              <a
                                href={docUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 shrink-0"
                              >
                                View
                              </a>
                            </div>
                            <iframe
                              src={docUrl}
                              className="w-full h-48"
                              title={doc.file_name}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Crops Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Available Crops</h2>
                <span className="text-xs text-gray-400 font-medium">({crops.length})</span>
              </div>

              {crops.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Leaf className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No crops listed yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {crops.map((crop) => (
                    <div
                      key={crop.crop_id}
                      onClick={() => setSelectedCrop(crop)}
                      className="bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="h-36 bg-gray-100 relative">
                        {crop.harvest_photo ? (
                          <img src={crop.harvest_photo} alt={crop.crop_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sprout className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        {crop.expected_harvest && (
                          <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {getDaysUntilHarvest(crop.expected_harvest) <= 0 ? 'Harvested' : 
                             `${getDaysUntilHarvest(crop.expected_harvest)} days`}
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <div>
                          <p className="font-bold text-gray-900 text-sm truncate">{crop.crop_name}</p>
                          {crop.variety && <p className="text-xs text-gray-500 truncate">{crop.variety}</p>}
                        </div>

                        {crop.farm_name && (
                          <div className="flex items-center gap-1">
                            <Leaf className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] text-gray-500 truncate">{crop.farm_name}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 flex-wrap">
                          {crop.volume && (
                            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              {crop.volume}kg
                            </span>
                          )}
                          {crop.stock && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              {crop.stock} pcs
                            </span>
                          )}
                        </div>

                        {crop.expected_harvest && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Harvest: {new Date(crop.expected_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}

                        {crop.location && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <MapPin className="w-2.5 h-2.5" />
                            <span className="truncate">{crop.location}</span>
                          </div>
                        )}

                        {[1, 2, 3].some(n => crop[`specification_${n}`]) && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
                            {[1, 2, 3].map((n) =>
                              crop[`specification_${n}`] ? (
                                <span key={n} className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  {crop[`specification_${n}`]}
                                </span>
                              ) : null
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Crop Detail Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />
            
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCrop.crop_name}</h2>
                <button 
                  onClick={() => setSelectedCrop(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Photo */}
              <div className="rounded-xl overflow-hidden mb-4">
                {selectedCrop.harvest_photo ? (
                  <img src={selectedCrop.harvest_photo} alt={selectedCrop.crop_name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                    <Sprout className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {selectedCrop.variety && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Variety</span>
                    <span className="text-sm text-gray-800">{selectedCrop.variety}</span>
                  </div>
                )}
                {selectedCrop.volume && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume</span>
                    <span className="text-sm font-semibold text-green-700">{Number(selectedCrop.volume).toLocaleString()} kg</span>
                  </div>
                )}
                {selectedCrop.stock && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Stock</span>
                    <span className="text-sm font-semibold text-blue-700">{Number(selectedCrop.stock).toLocaleString()} pcs</span>
                  </div>
                )}
                {selectedCrop.planting_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Planted</span>
                    <span className="text-sm text-gray-700">{formatDate(selectedCrop.planting_date)}</span>
                  </div>
                )}
                {selectedCrop.expected_harvest && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Expected Harvest</span>
                    <span className="text-sm font-semibold text-amber-700">{formatDate(selectedCrop.expected_harvest)}</span>
                  </div>
                )}
                {selectedCrop.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Location</span>
                    <span className="text-sm text-gray-700">{selectedCrop.location}</span>
                  </div>
                )}
              </div>

              {/* Specs */}
              {[1, 2, 3, 4, 5].some(n => selectedCrop[`specification_${n}`]) && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) =>
                      selectedCrop[`specification_${n}`] ? (
                        <span key={n} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">
                          {selectedCrop[`specification_${n}`]}
                        </span>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(selectedCrop)}
                className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold active:scale-[0.98] transition-all shadow-md shadow-green-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
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