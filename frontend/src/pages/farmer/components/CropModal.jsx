import { Loader2 ,X, MapPin, Upload, Image as ImageIcon, AlertTriangle, Info, Plus, Trash2 } from 'lucide-react'
import { useEffect,useState } from 'react'
import cropData from '../../../assets/CROP_NAMES.json'

const EMPTY_FORM = {
  crop_name: '', variety: '', volume: '', stock: '', farm_id: '',
  specifications: [],
  maturity_days: '', expected_volume: '',
  planting_date: '', expected_harvest: '',
  actual_harvest: '', total_harvest: '',
  harvest_photo: '', location: '',
}

const CropModal = ({ isOpen, onClose, onSubmit, loading, initialData, farms = [] }) => {

  const isEdit = initialData && (initialData.crop_id || initialData.crop_name)
  const [form, setForm] = useState(initialData && initialData.farm_id ? { ...EMPTY_FORM, farm_id: initialData.farm_id } : EMPTY_FORM)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [warnings, setWarnings] = useState({})

  const addSpecification = () => {
    if (form.specifications.length < 8) {
      setForm({ ...form, specifications: [...form.specifications, { name: '', value: '' }] })
    }
  }

  const removeSpecification = (index) => {
    setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== index) })
  }

  const updateSpecification = (index, field, value) => {
    const updated = form.specifications.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    )
    setForm({ ...form, specifications: updated })
  }

  const getSubmitForm = () => {
    const submitForm = { ...form }
    for (let i = 1; i <= 8; i++) {
      submitForm[`specification_${i}`] = null
    }
    form.specifications.forEach((spec, index) => {
      if (spec.name || spec.value) {
        submitForm[`specification_${index + 1}`] = { name: spec.name, value: spec.value }
      }
    })
    delete submitForm.specifications
    return submitForm
  }

  const commodities = cropData.commodities || []
  
  const getCropRanges = (cropName) => {
    const crop = commodities.find(c => c.name.toLowerCase() === cropName?.toLowerCase())
    if (!crop) return null
    return {
      avgYieldKg: crop.average_yield_kg,
      avgYieldTons: crop.average_yield_tons,
      maturityDays: crop.days_to_maturity
    }
  }

  const getRange = (rangeStr) => {
    if (!rangeStr) return { min: 0, max: Infinity }
    const parts = rangeStr.split('-').map(s => parseFloat(s.trim()))
    return { min: parts[0] || 0, max: parts[1] || Infinity }
  }

  const validateField = (field, value) => {
    if (!value) return null
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return null
    
    const crop = getCropRanges(form.crop_name)
    if (!crop) return null
    
    let range, fieldName
    if (field === 'volume' || field === 'expected_volume' || field === 'total_harvest') {
      range = getRange(crop.avgYieldKg)
      fieldName = 'yield (kg)'
    } else if (field === 'maturity_days') {
      range = getRange(crop.maturityDays)
      fieldName = 'maturity days'
    }
    
    if (range && (numValue < range.min * 0.5 || numValue > range.max * 1.5)) {
      return `Value outside typical range (${range.min}-${range.max})`
    }
    return null
  }

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value })
    const warning = validateField(key, value)
    setWarnings(prev => ({ ...prev, [key]: warning }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setPhotoPreview(previewUrl)
      setForm({ ...form, harvest_photo: file })
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setForm({ ...form, harvest_photo: '' })
  }

  useEffect(() => {
    if (initialData) {
      const specs = []
      for (let i = 1; i <= 8; i++) {
        const nameKey = `specification_${i}_name`
        const valueKey = `specification_${i}_value`
        if (initialData[nameKey] || initialData[valueKey]) {
          specs.push({ name: initialData[nameKey] || '', value: initialData[valueKey] || '' })
        }
      }
      setForm({
        ...EMPTY_FORM, ...initialData,
        specifications: specs,
        planting_date: initialData.planting_date?.slice(0, 10) || '',
        expected_harvest: initialData.expected_harvest?.slice(0, 10) || '',
      })
      if (initialData?.harvest_photo) {
        setPhotoPreview(initialData.harvest_photo)
      } else {
        setPhotoPreview(null)
      }
    } else {
      setForm({ ...EMPTY_FORM, farm_id: farms.length === 1 ? farms[0].farm_id : '', specifications: [] })
      setPhotoPreview(null)
    }
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
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Crop Name <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.crop_name}
                  onChange={(e) => handleChange('crop_name', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200 bg-white"
                >
                  <option value="">Select crop...</option>
                  {commodities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {form.crop_name && getCropRanges(form.crop_name) && (
                  <div className="text-[10px] text-blue-600 bg-blue-50 rounded-lg p-2 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Avg: {getCropRanges(form.crop_name).avgYieldTons} tons/ha • {getCropRanges(form.crop_name).maturityDays} days
                  </div>
                )}
              </div>
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
                    onChange={(e) => handleChange('volume', e.target.value)}
                    className={`w-full px-3 py-2.5 pr-10 rounded-xl border-2 hover:border-gray-300
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                      outline-none text-sm text-gray-800 font-medium transition-all duration-200
                      ${warnings.volume ? 'border-orange-400' : 'border-gray-200'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">kg</span>
                </div>
                {warnings.volume && (
                  <p className="text-[10px] text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {warnings.volume}
                  </p>
                )}
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

            {/* Actual Harvest + Total Harvest */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Actual Harvest
                </label>
                <input
                  type="date"
                  value={form.actual_harvest || ''}
                  onChange={(e) => setForm({ ...form, actual_harvest: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Harvest</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0" step="0.01"
                    value={form.total_harvest}
                    onChange={(e) => handleChange('total_harvest', e.target.value)}
                    className={`w-full px-3 py-2.5 pr-10 rounded-xl border-2 hover:border-gray-300
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                      outline-none text-sm text-gray-800 font-medium transition-all duration-200
                      ${warnings.total_harvest ? 'border-orange-400' : 'border-gray-200'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">kg</span>
                </div>
                {warnings.total_harvest && (
                  <p className="text-[10px] text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {warnings.total_harvest}
                  </p>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Specifications</label>
                {form.specifications.length < 8 && (
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Specification
                  </button>
                )}
              </div>
              {form.specifications.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2">No specifications added. Click "Add Specification" to add.</p>
              ) : (
                <div className="space-y-2">
                  {form.specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Name (e.g. Color)"
                        value={spec.name}
                        onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 hover:border-gray-300
                          focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                          outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Green)"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 hover:border-gray-300
                          focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                          outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maturity Days + Expected Volume */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Maturity Days</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0"
                    value={form.maturity_days}
                    onChange={(e) => handleChange('maturity_days', e.target.value)}
                    className={`w-full px-3 py-2.5 pr-12 rounded-xl border-2 hover:border-gray-300
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                      outline-none text-sm text-gray-800 font-medium transition-all duration-200
                      ${warnings.maturity_days ? 'border-orange-400' : 'border-gray-200'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">days</span>
                </div>
                {warnings.maturity_days && (
                  <p className="text-[10px] text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {warnings.maturity_days}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Expected Volume</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0" step="0.01"
                    value={form.expected_volume}
                    onChange={(e) => handleChange('expected_volume', e.target.value)}
                    className={`w-full px-3 py-2.5 pr-10 rounded-xl border-2 hover:border-gray-300
                      focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                      outline-none text-sm text-gray-800 font-medium transition-all duration-200
                      ${warnings.expected_volume ? 'border-orange-400' : 'border-gray-200'}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">kg</span>
                </div>
                {warnings.expected_volume && (
                  <p className="text-[10px] text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {warnings.expected_volume}
                  </p>
                )}
              </div>
            </div>

            {/* Harvest Photo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Harvest Photo</label>
              <div className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${photoPreview ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Harvest preview" className="w-full h-40 object-cover rounded-lg mx-auto" />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-green-600 mt-2 font-medium">Click to change photo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-2">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Click to upload harvest photo</p>
                    <p className="text-[10px] text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Harvest Location</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Purok 5, Brgy. San Jose, Quezon Province"
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-gray-200 hover:border-gray-300
                    focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]
                    outline-none text-sm text-gray-800 font-medium transition-all duration-200"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(getSubmitForm())}
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