import { useState,useEffect,useRef } from "react";
import { MapPin, X, Image, FileText, Upload } from 'lucide-react';


const MapSelector = ({ onLocationSelect, selectedCoords }) => {
  const mapRef = useRef(null);
  const [pin, setPin] = useState(null);

  const handleClick = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const lat = (14.5995 + (50 - y) * 0.01).toFixed(6);
    const lng = (120.9842 + (x - 50) * 0.01).toFixed(6);
    setPin({ x, y, lat, lng });
    onLocationSelect(`${lat}, ${lng}`);
  };

  return (
    <div className="space-y-2">
      <div
        ref={mapRef} onClick={handleClick}
        className="relative w-full h-48 rounded-xl overflow-hidden cursor-crosshair border-2 border-gray-200 hover:border-green-400 transition-colors"
        style={{
          background: `
            linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px),
            linear-gradient(135deg, #e8f5e9 0%, #f0fdf4 40%, #dcfce7 70%, #d1fae5 100%)
          `,
          backgroundSize: '30px 30px, 30px 30px, 100% 100%',
        }}
      >
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          <line x1="0" y1="60%" x2="100%" y2="55%" stroke="#4ade80" strokeWidth="2" />
          <line x1="0" y1="35%" x2="100%" y2="40%" stroke="#4ade80" strokeWidth="1.5" />
          <line x1="30%" y1="0" x2="35%" y2="100%" stroke="#4ade80" strokeWidth="2" />
          <line x1="65%" y1="0" x2="60%" y2="100%" stroke="#4ade80" strokeWidth="1.5" />
          <rect x="28%" y="25%" width="25%" height="20%" fill="rgba(74,222,128,0.1)" rx="2" />
          <rect x="55%" y="55%" width="20%" height="15%" fill="rgba(74,222,128,0.1)" rx="2" />
        </svg>
        {!pin && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <MapPin className="w-7 h-7 text-green-400 mb-2 opacity-60" />
            <p className="text-xs text-green-700 font-medium opacity-70">Click to drop a pin</p>
            <p className="text-xs text-gray-400 mt-0.5 opacity-60">Google Maps will be enabled soon</p>
          </div>
        )}
        {pin && (
          <div className="absolute -translate-x-1/2 -translate-y-full pointer-events-none" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
            <div className="flex flex-col items-center">
              <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg whitespace-nowrap">{pin.lat}, {pin.lng}</div>
              <div className="w-0.5 h-3 bg-green-600" />
              <div className="w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow-md" />
            </div>
          </div>
        )}
      </div>
      {selectedCoords && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium font-mono">{selectedCoords}</span>
          <button type="button" onClick={() => { setPin(null); onLocationSelect(''); }} className="ml-auto text-green-400 hover:text-green-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const EMPTY_FARM_FORM = { 
  farm_name: '', 
  gps_coordinates: '', 
  farm_area: '', 
  farm_elevation: '',
  total_acres: '',
  plot_boundaries: '',
  land_use_type: '',
  farm_image: null,
  farm_docs: []
};

const AddFarmModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(EMPTY_FARM_FORM);
  const [focused, setFocused] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { 
    if (isOpen) setForm(EMPTY_FARM_FORM); 
    setImagePreview(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const inputClass = (field) => `
    w-full px-4 py-3 rounded-xl border-2 bg-white text-gray-800 text-sm font-medium
    outline-none transition-all duration-200
    ${focused === field
      ? 'border-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]'
      : 'border-gray-200 hover:border-gray-300'}
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Register New Farm</h2>
              <p className="text-xs text-gray-400 mt-0.5">Add another farm to your account.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
            {/* Farm Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Farm Name</label>
              <input
                type="text" placeholder="e.g. Dela Cruz Family Farm"
                className={inputClass('farm_name')} value={form.farm_name}
                onFocus={() => setFocused('farm_name')} onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, farm_name: e.target.value })}
                required
              />
            </div>

            {/* Map */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">GPS Location</label>
              <MapSelector
                selectedCoords={form.gps_coordinates}
                onLocationSelect={(coords) => setForm({ ...form, gps_coordinates: coords })}
              />
            </div>

            {/* Area + Elevation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Area (sqm)</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0"
                    className={inputClass('farm_area') + ' pr-14'} value={form.farm_area}
                    onFocus={() => setFocused('farm_area')} onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, farm_area: e.target.value })}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">sqm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Acres</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0"
                    className={inputClass('total_acres') + ' pr-14'} value={form.total_acres}
                    onFocus={() => setFocused('total_acres')} onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, total_acres: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">acres</span>
                </div>
              </div>
            </div>

            {/* Elevation + Land Use Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Elevation</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0"
                    className={inputClass('farm_elevation') + ' pr-8'} value={form.farm_elevation}
                    onFocus={() => setFocused('farm_elevation')} onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, farm_elevation: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">m</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Land Use Type</label>
                <select
                  className={inputClass('land_use_type')}
                  value={form.land_use_type}
                  onFocus={() => setFocused('land_use_type')}
                  onBlur={() => setFocused('')}
                  onChange={(e) => setForm({ ...form, land_use_type: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="pasture">Pasture</option>
                  <option value="cultivated">Cultivated</option>
                  <option value="fallow">Fallow</option>
                </select>
              </div>
            </div>

            {/* Plot Boundaries */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Plot Boundaries</label>
              <textarea
                placeholder="Describe the boundaries of your farm (e.g., North: River, East: Road, etc.)"
                className={inputClass('plot_boundaries') + ' min-h-[80px] resize-none'}
                value={form.plot_boundaries}
                onFocus={() => setFocused('plot_boundaries')}
                onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, plot_boundaries: e.target.value })}
              />
            </div>

            {/* Farm Image */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Farm Image</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-green-400 transition-colors">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg mx-auto" />
                    <button
                      type="button"
                      onClick={() => { setForm({ ...form, farm_image: null }); setImagePreview(null); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setForm({ ...form, farm_image: file });
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Click to upload farm image</p>
                  </label>
                )}
              </div>
            </div>

            {/* Farm Documents */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Farm Documents (Max 3 PDFs)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-green-400 transition-colors">
                {form.farm_docs && form.farm_docs.length > 0 ? (
                  <div className="space-y-2">
                    {form.farm_docs.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newDocs = form.farm_docs.filter((_, i) => i !== idx);
                            setForm({ ...form, farm_docs: newDocs });
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {form.farm_docs.length < 3 && (
                      <label className="cursor-pointer flex items-center justify-center gap-2 py-2 text-green-600 hover:text-green-700">
                        <Upload className="w-4 h-4" />
                        <span className="text-xs font-medium">Add more documents</span>
                        <input
                          type="file"
                          accept="application/pdf"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            const remaining = 3 - form.farm_docs.length;
                            const newDocs = [...form.farm_docs, ...files.slice(0, remaining)];
                            setForm({ ...form, farm_docs: newDocs });
                          }}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files).slice(0, 3);
                        setForm({ ...form, farm_docs: files });
                      }}
                    />
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Click to upload up to 3 PDF documents</p>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={loading || !form.farm_name || !form.farm_area}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-green-500 to-emerald-600
                hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-md shadow-green-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : 'Register Farm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFarmModal