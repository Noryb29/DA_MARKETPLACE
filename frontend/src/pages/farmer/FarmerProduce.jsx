import React, { useEffect, useState } from 'react'
import FarmerSidebar from './components/FarmerSidebar'
import useFarmerStore from '../../store/FarmerStore'
import useProduceStore from '../../store/ProduceStore'
import { Wheat, Loader2, AlertCircle, Plus, X, Pencil, Trash2, Calendar, Package } from 'lucide-react'

// ─── Modal ────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  crop_name: '', variety: '', volume: '', stock: '',
  specification_1: '', specification_2: '', specification_3: '',
  specification_4: '', specification_5: '',
  planting_date: '', expected_harvest: '',
}

const CropModal = ({ isOpen, onClose, onSubmit, loading, initialData }) => {
  const isEdit = !!initialData
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    setForm(initialData
      ? {
          ...EMPTY_FORM, ...initialData,
          // format dates to yyyy-mm-dd for input[type=date]
          planting_date: initialData.planting_date?.slice(0, 10) || '',
          expected_harvest: initialData.expected_harvest?.slice(0, 10) || '',
        }
      : EMPTY_FORM
    )
  }, [initialData, isOpen])

  if (!isOpen) return null

  const field = (key, label, placeholder, type = 'text', required = false) => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
          focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
          outline-none text-sm text-gray-800 font-medium transition-all duration-200"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{isEdit ? 'Edit Crop' : 'Add New Crop'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{isEdit ? 'Update crop details below.' : 'Fill in the details for your new crop.'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4 max-h-[62vh] overflow-y-auto pr-1">

            {/* Crop Name + Variety */}
            <div className="grid grid-cols-2 gap-3">
              {field('crop_name', 'Crop Name', 'e.g. Rice, Corn', 'text', true)}
              {field('variety', 'Variety', 'e.g. IR64, Sweet Corn')}
            </div>

            {/* Volume + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Volume</label>
              <div className="relative">
                <input
                  type="number" placeholder="0" value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">kg</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Stock</label>
              <div className="relative">
                <input
                  type="number" placeholder="0" value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full px-3 py-2.5 pr-12 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">pcs</span>
              </div>
            </div>
          </div>

            {/* Planting Date + Expected Harvest */}
            <div className="grid grid-cols-2 gap-3">
              {field('planting_date', 'Planting Date', '', 'date')}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Expected Harvest
                </label>
                <input
                  type="date"
                  min={form.planting_date || undefined}
                  value={form.expected_harvest}
                  onChange={(e) => setForm({ ...form, expected_harvest: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Specifications</label>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <input
                    key={n}
                    type="text" placeholder={`Spec ${n}`}
                    value={form[`specification_${n}`]}
                    onChange={(e) => setForm({ ...form, [`specification_${n}`]: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                      outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={loading || !form.crop_name}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-green-500 to-emerald-600
                hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-md shadow-green-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Adding...'}
                </span>
              ) : isEdit ? 'Update Crop' : 'Add Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Crop Card ────────────────────────────────────────────────────────────────
const CropCard = ({ crop, onEdit, onDelete }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-green-200 transition-all duration-200 flex flex-col gap-3">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2.5 rounded-xl shrink-0">
            <Wheat className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">{crop.crop_name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{crop.variety || 'No variety'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
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
      {[1, 2, 3, 4, 5].some(n => crop[`specification_${n}`]) && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
          {[1, 2, 3, 4, 5].map((n) =>
            crop[`specification_${n}`] ? (
              <span key={n} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                {crop[`specification_${n}`]}
              </span>
            ) : null
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FarmerProduce = () => {
  const { farm, hasFarm, farmInitialized, getFarm } = useFarmerStore()
  const { crops, cropsLoading, cropsInitialized, getCrops, addCrop, updateCrop, deleteCrop } = useProduceStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => { getFarm() }, [])
  useEffect(() => { if (hasFarm) getCrops() }, [hasFarm])

  const handleAdd = async (form) => { await addCrop(form); setModalOpen(false) }
  const handleEdit = (crop) => { setEditTarget(crop); setModalOpen(true) }
  const handleUpdate = async (form) => { await updateCrop(editTarget.crop_id, form); setModalOpen(false); setEditTarget(null) }
  const handleModalClose = () => { setModalOpen(false); setEditTarget(null) }

  return (
    <div className="min-h-screen">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <FarmerSidebar />

        <main className="flex-1 p-6 bg-gray-50">

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
                  <h2 className="text-2xl font-bold text-gray-800">My Produce</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Farm: {farm?.farm_name}</p>

                   <button
                  onClick={() => { setEditTarget(null); setModalOpen(true) }}
                  className="mt-5 flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600
                    hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl
                    shadow-md shadow-green-200 active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Crop
                </button>

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

              {/* Crop Cards */}
              {cropsInitialized && crops.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crops.map((crop) => (
                    <CropCard
                      key={crop.crop_id}
                      crop={crop}
                      onEdit={handleEdit}
                      onDelete={deleteCrop}
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
      />
    </div>
  )
}

export default FarmerProduce