import { Loader2 ,X } from 'lucide-react'
import { useEffect,useState } from 'react'

const EMPTY_FORM = {
  crop_name: '', variety: '', volume: '', stock: '', farm_id: '',
  specification_1: '', specification_2: '', specification_3: '',
  specification_4: '', specification_5: '',
  planting_date: '', expected_harvest: '',
}

const CropModal = ({ isOpen, onClose, onSubmit, loading, initialData, farms = [] }) => {
    
  const isEdit = !!initialData
  const [form, setForm] = useState(EMPTY_FORM)
  useEffect(() => {
    setForm(initialData
      ? {
          ...EMPTY_FORM, ...initialData,
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

            {/* Farm */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Farm <span className="text-red-400">*</span>
              </label>
              <select
                value={form.farm_id ?? ''}
                onChange={(e) => setForm({ ...form, farm_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                  focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                  outline-none text-sm text-gray-800 font-medium transition-all duration-200 bg-white"
              >
                <option value="">Select a farm...</option>
                {farms.map((f) => (
                  <option key={f.farm_id} value={f.farm_id}>
                    {f.farm_name}
                  </option>
                ))}
              </select>
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
              disabled={loading || !form.crop_name || !form.farm_id}
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

export default CropModal