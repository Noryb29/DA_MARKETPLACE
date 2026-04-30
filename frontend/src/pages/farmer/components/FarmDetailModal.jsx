import { MapPin, X, Ruler, Mountain, FileText, Sprout, MapPinned, Image } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmDetailModal = ({ farm, onClose }) => {
  if (!farm) return null;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const landUseColors = {
    pasture: 'bg-amber-100 text-amber-700',
    cultivated: 'bg-green-100 text-green-700',
    fallow: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-20px)]">
          {/* Header with Farm Image */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{farm.farm_name}</h2>
              {farm.created_at && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Registered {formatDate(farm.created_at)}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Farm Image */}
          {farm.farm_image ? (
            <div className="mb-5 rounded-xl overflow-hidden border border-gray-200">
              <img 
                src={`${BASE_URL}${farm.farm_image}`} 
                alt={farm.farm_name}
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <div className="mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 border border-gray-200 h-48 flex items-center justify-center">
              <Image className="w-12 h-12 text-green-300" />
            </div>
          )}

          {/* GPS & Land Use Type */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest">GPS</p>
                <p className="text-xs font-mono font-semibold text-green-800 truncate">
                  {farm.gps_coordinates || 'Not set'}
                </p>
              </div>
            </div>
            {farm.land_use_type && (
              <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${landUseColors[farm.land_use_type] || 'bg-gray-50 border-gray-100'}`}>
                <Sprout className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest">Land Use</p>
                  <p className="text-sm font-semibold capitalize">{farm.land_use_type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Ruler className="w-3 h-3 text-gray-400" />
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Area (sqm)</p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {farm.farm_area?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPinned className="w-3 h-3 text-gray-400" />
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Acres</p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {farm.total_acres || '—'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1">
                <Mountain className="w-3 h-3 text-gray-400" />
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Elevation</p>
              </div>
              <p className="text-lg font-bold text-gray-800">
                {farm.farm_elevation ?? '—'}
              </p>
            </div>
            {farm.farm_docs && (
              (() => {
                let docsArray = []
                if (Array.isArray(farm.farm_docs)) {
                  docsArray = farm.farm_docs
                } else if (typeof farm.farm_docs === 'string' && farm.farm_docs.startsWith('[')) {
                  try {
                    docsArray = JSON.parse(farm.farm_docs)
                  } catch (e) {
                    docsArray = []
                  }
                }
                if (docsArray.length === 0) return null
                return (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3 h-3 text-blue-400" />
                      <p className="text-[9px] text-blue-500 font-semibold uppercase tracking-widest">Documents</p>
                    </div>
                    <p className="text-lg font-bold text-blue-700">
                      {docsArray.length}
                    </p>
                  </div>
                )
              })()
            )}
          </div>

          {/* Plot Boundaries */}
          {farm.plot_boundaries && (
            <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPinned className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Plot Boundaries</p>
              </div>
              <p className="text-sm text-gray-600">{farm.plot_boundaries}</p>
            </div>
          )}

          {/* Documents - handle both array and string formats */}
          {farm.farm_docs && (
            (() => {
              let docsArray = []
              if (Array.isArray(farm.farm_docs)) {
                docsArray = farm.farm_docs
              } else if (typeof farm.farm_docs === 'string' && farm.farm_docs.startsWith('[')) {
                try {
                  docsArray = JSON.parse(farm.farm_docs)
                } catch (e) {
                  docsArray = []
                }
              }
              
              if (docsArray.length === 0) return null
              
              return (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Farm Documents</p>
                  </div>
                  <div className="space-y-2">
                    {docsArray.map((doc, idx) => (
                      <a
                        key={idx}
                        href={`${BASE_URL}${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-gray-600 truncate">Document {idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })()
          )}

          <button
            onClick={onClose}
            className="w-full mt-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailModal