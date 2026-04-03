import { MapPin, X, Ruler, Mountain } from 'lucide-react';

// ─── Farm Detail Modal ────────────────────────────────────────────────────────
const FarmDetailModal = ({ farm, onClose }) => {
  if (!farm) return null;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
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

          {/* GPS */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4">
            <MapPin className="w-4 h-4 text-green-500 shrink-0" />
            <div>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-widest">GPS Coordinates</p>
              <p className="text-sm font-mono font-semibold text-green-800 mt-0.5">
                {farm.gps_coordinates || 'Not set'}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Area</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {farm.farm_area?.toLocaleString()}
                <span className="text-sm font-medium text-gray-400 ml-1">sqm</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Mountain className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Elevation</p>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {farm.farm_elevation ?? '—'}
                <span className="text-sm font-medium text-gray-400 ml-1">m</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailModal