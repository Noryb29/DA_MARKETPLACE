import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'
import useMarketStore from '../../../store/MarketStore'
import CropRow from '../shopComponents/CropRow'
import { ArrowLeft, Loader2, MapPin, Ruler, User, AlertCircle, Leaf, Droplets } from 'lucide-react'

const FarmDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const {
    selectedFarm: farm,
    farmCrops: crops,
    farmLoading: loading,
    getFarmDetails,
    clearFarmDetails
  } = useMarketStore()

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
          <Sidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <p className="text-gray-600">Loading farm details...</p>
            </div>
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
            <div className="max-w-md w-full">
              <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Farm Not Found</h2>
                <p className="text-gray-600 mb-6">
                  {error || 'The farm you\'re looking for doesn\'t exist or has been removed.'}
                </p>
                <button
                  onClick={() => navigate('/shop/farms')}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Farms
                </button>
              </div>
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
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Farms
            </button>

            {/* Farm Hero Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-8">
              {/* Farmer Info */}
              <div className="flex items-start gap-4 mb-8 pb-8 border-b border-green-200">
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">Farmer</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {farm.firstname} {farm.lastname}
                  </h3>
                  <p className="text-sm text-gray-600">{farm.email}</p>
                </div>
              </div>

              {/* Farm Name and Status */}
              <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex-1">
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">{farm.farm_name}</h1>
                  <p className="text-gray-600">A local agricultural operation</p>
                </div>
                <span className="px-4 py-2 bg-white border-2 border-green-600 text-green-700 text-xs font-bold rounded-full whitespace-nowrap">
                  🌱 ACTIVE FARM
                </span>
              </div>

              {/* Farm Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {farm.farm_area && (
                  <div className="bg-white rounded-lg p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Ruler className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Farm Area</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{parseFloat(farm.farm_area).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">hectares</p>
                  </div>
                )}

                {farm.gps_coordinates && (
                  <div className="bg-white rounded-lg p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Location</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 break-all">{farm.gps_coordinates}</p>
                  </div>
                )}

                {farm.farm_elevation && (
                  <div className="bg-white rounded-lg p-5 border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Leaf className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Elevation</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)}</p>
                    <p className="text-sm text-gray-600">meters above sea level</p>
                  </div>
                )}
              </div>
            </div>

            {/* Crops Section */}
            <div>
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      <Droplets className="w-8 h-8 text-green-600" />
                      Available Crops
                    </h2>
                    <p className="text-gray-600 mt-2">
                      {crops.length} crop{crops.length !== 1 ? 's' : ''} growing on this farm
                    </p>
                  </div>
                </div>
              </div>

              {crops.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">No Crops Listed Yet</h3>
                  <p className="text-gray-500">
                    This farm hasn't listed any crops for sale at the moment. Check back later!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {crops.map((crop, idx) => (
                    <div
                      key={crop.crop_id}
                      className="bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all p-6"
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`
                      }}
                    >
                      <style>{`
                        @keyframes fadeInUp {
                          from {
                            opacity: 0;
                            transform: translateY(20px);
                          }
                          to {
                            opacity: 1;
                            transform: translateY(0);
                          }
                        }
                      `}</style>
                      <CropRow crop={crop} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

export default FarmDetailsPage