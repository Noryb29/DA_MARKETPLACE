import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './SideBar'
import useMarketStore from '../../../store/MarketStore'
import CropRow from '../shopComponents/CropRow'
import { ArrowLeft, Loader2, MapPin, Ruler, User } from 'lucide-react'
import axios from 'axios'

const FarmDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
  selectedFarm: farm,
  farmCrops: crops,
  farmLoading: loading,
  getFarmDetails,
  clearFarmDetails
} = useMarketStore()
 

  useEffect(() => {
  getFarmDetails(id)

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
            <Loader2 className="w-7 h-7 animate-spin text-green-600" />
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
              className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Farms
            </button>

            {/* Farm Details Card */}
            {farm && (
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
                <div className="flex items-start gap-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Farmer</p>
                  <p className="text-lg font-bold text-gray-900">
                    {farm.firstname} {farm.lastname}
                  </p>
                  <p className="text-sm text-gray-500">{farm.email}</p>
                </div>
              </div>

                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{farm.farm_name}</h1>
                  </div>
                  <span className="inline-block bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {farm.farm_area && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Ruler className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Area</p>
                        <p className="text-lg font-bold text-gray-900">{parseFloat(farm.farm_area).toFixed(2)} hectares</p>
                      </div>
                    </div>
                  )}

                  {farm.gps_coordinates && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Location</p>
                        <p className="text-lg font-bold text-gray-900">{farm.gps_coordinates}</p>
                      </div>
                    </div>
                  )}

                  {farm.farm_elevation && (
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Elevation</p>
                        <p className="text-lg font-bold text-gray-900">{parseFloat(farm.farm_elevation).toFixed(0)} m</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Crops Section */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crops</h2>
                <p className="text-gray-500 text-sm mt-1">{crops.length} crop{crops.length !== 1 ? 's' : ''} available</p>
              </div>

              {crops.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No crops found on this farm.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {crops.map((crop) => (
                    <CropRow key={crop.crop_id} crop={crop} />
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