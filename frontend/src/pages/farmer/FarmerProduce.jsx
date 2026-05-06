import React, { useEffect, useState } from 'react'
import useFarmerStore from '../../store/FarmsStore'
import useProduceStore from '../../store/ProduceStore'
import { Wheat, Loader2, AlertCircle, Plus, ClipboardList, Search, Filter } from 'lucide-react'
import Sidebar from '../public/components/SideBar'
import CropModal from './components/CropModal'
import CropDetailModal from './components/CropDetailModal'
import CropCard from '../../components/CropCard'


// ─── Main Page ────────────────────────────────────────────────────────────────
const FarmerProduce = () => {
  const { farm, farms, hasFarm, farmInitialized, getFarm, getFarms } = useFarmerStore()
  const { crops, cropsLoading, cropsInitialized, getCrops, addCrop, updateCrop, deleteCrop } = useProduceStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [viewTarget, setViewTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.variety?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    if (statusFilter === 'verified') return matchesSearch && crop.is_verified === true
    if (statusFilter === 'pending') return matchesSearch && crop.is_verified !== true && !crop.rejection_reason
    if (statusFilter === 'rejected') return matchesSearch && crop.rejection_reason
    return matchesSearch
  })

  useEffect(() => { getFarm(); getFarms() }, [])
  useEffect(() => { if (hasFarm) getCrops() }, [hasFarm])

  const handleAdd = async (form) => {
    if (!farm?.is_verified) {
      alert('Your farm is still pending approval. You cannot add crops until your farm is verified.')
      return
    }
    await addCrop(form)
    setModalOpen(false)
  }
  const handleEdit = (crop) => { setEditTarget(crop); setModalOpen(true) }
  const handleView = (crop) => { setViewTarget(crop) }
  const handleUpdate = async (form) => {
    if (editTarget?.rejection_reason) {
      form.is_verified = false
      form.rejection_reason = null
    }
    await updateCrop(editTarget.crop_id, form)
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleResubmit = (crop) => {
    setEditTarget(crop)
    setModalOpen(true)
  }
  const handleModalClose = () => { setModalOpen(false); setEditTarget(null) }
  const handleViewClose = () => { setViewTarget(null) }

  return (
    <div className="min-h-screen">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>

        <main className="flex-1 p-10 bg-gray-50">

          {/* Loading */}
          {!farmInitialized && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-green-600 w-8 h-8" />
            </div>
          )}

          {/* No Farm */}
          {farmInitialized && !hasFarm && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-gray-700">No Farm Registered</h2>
              <p className="text-gray-500">Please register your farm first before managing your produce.</p>
              <a href="/farmer/dashboard/farm" className="mt-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                Register Farm
              </a>
            </div>
          )}

          {/* Has Farm */}
          {farmInitialized && hasFarm && (
            <>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <ClipboardList className="w-3.5 h-3.5" />
                Produce Management
              </div>
                  <h2 className="text-3xl font-bold text-gray-800">My Produce</h2>
                  {farm?.is_verified ? (
                    <button
                      onClick={() => { setEditTarget(null); setModalOpen(true) }}
                      className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600
                        hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl
                        shadow-md shadow-green-200 active:scale-[0.98] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Crop
                    </button>
                  ) : (
                    <div className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-500 text-sm font-semibold rounded-xl cursor-not-allowed">
                      <AlertCircle className="w-4 h-4" />
                      Farm Pending Approval
                    </div>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search crops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium text-gray-700"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending Approval</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  Showing {filteredCrops.length} of {crops.length} crops
                </div>
              </div>

              {/* Crops Loading */}
              {cropsLoading && !cropsInitialized && (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="animate-spin text-green-600 w-6 h-6" />
                </div>
              )}

              {/* No Crops */}
              {cropsInitialized && crops.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <Wheat className="w-12 h-12 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-500">No Crops Added Yet</h3>
                  <p className="text-sm text-gray-400">Click "Add Crop" to register your first crop.</p>
                </div>
              )}

              {/* No Filter Results */}
              {cropsInitialized && crops.length > 0 && filteredCrops.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                  <Search className="w-12 h-12 text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-500">No Results Found</h3>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter.</p>
                </div>
              )}

              {/* Crop Cards */}
              {cropsInitialized && filteredCrops.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCrops.map((crop) => (
                    <CropCard
                      key={crop.crop_id}
                      crop={crop}
                      variant="farmer"
                      showActions={true}
                      onEdit={handleEdit}
                      onDelete={deleteCrop}
                      onClick={handleView}
                      onAddHarvestDetails={handleEdit}
                      onResubmit={handleResubmit}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <CropModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSubmit={editTarget ? handleUpdate : handleAdd}
        loading={cropsLoading}
        initialData={editTarget}
        farms={farms}
      />

      <CropDetailModal crop={viewTarget} onClose={handleViewClose} />
    </div>
  )
}

export default FarmerProduce