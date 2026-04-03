import React, { useState, useEffect, useRef } from 'react';
import useFarmerStore from '../../store/FarmsStore.js';
import { MapPin, Wheat, ChevronRight, Plus, X, List, LayoutGrid, Calendar, Ruler, Mountain } from 'lucide-react';
import Sidebar from '../public/components/SideBar';

// ─── Map Placeholder ──────────────────────────────────────────────────────────
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
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

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

// ─── Add Farm Modal ───────────────────────────────────────────────────────────
const EMPTY_FARM_FORM = { farm_name: '', gps_coordinates: '', farm_area: '', farm_elevation: '' };

const AddFarmModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState(EMPTY_FARM_FORM);
  const [focused, setFocused] = useState('');

  useEffect(() => { if (isOpen) setForm(EMPTY_FARM_FORM); }, [isOpen]);

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
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Area</label>
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
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => onSubmit(form)}
              disabled={loading || !form.farm_name || !form.farm_area}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
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

// ─── Main Component ───────────────────────────────────────────────────────────
const FarmerFarm = () => {
  const { addFarm, loading, getFarm, getFarms, getCrops, farm, farms, hasFarm, crops } = useFarmerStore();

  const [activeTab, setActiveTab] = useState('all-farms');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    getFarm();
    getFarms();
  }, [getFarm,getFarms]);

  useEffect(() => {
    if (hasFarm) getCrops();
  }, [hasFarm]);

  const handleAddFarm = async (formData) => {
    await addFarm(formData);
    setAddModalOpen(false);
  };

  const tabs = [
    { id: 'all-farms', label: 'All Farms', icon: LayoutGrid },
    { id: 'my-farm', label: 'Farm Details', icon: MapPin, disabled: !hasFarm },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>
        <main className="flex-1 px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Farm Management
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Farms</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your farms and registered crops.</p>
              </div>

              {/* Add Farm Button */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl
                  shadow-md shadow-green-200 active:scale-[0.98] transition-all mt-1"
              >
                <Plus className="w-4 h-4" />
                Add Farm
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-200/70 p-1 rounded-xl mb-6 w-fit">
              {tabs.map(({ id, label, icon: Icon, disabled }) => (
                <button
                  key={id} type="button" disabled={disabled}
                  onClick={() => !disabled && setActiveTab(id)}
                  className={`
                    flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                    ${activeTab === id
                      ? 'bg-white text-green-700 shadow-sm'
                      : disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-700'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {id === 'all-farms' && farms?.length > 0 && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {farms.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── TAB: All Farms ────────────────────────────────── */}
            {activeTab === 'all-farms' && (
              <div className="space-y-3">
                {!farms?.length ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                    <div className="bg-gray-100 p-5 rounded-full">
                      <List className="w-10 h-10 text-gray-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-500">No farms registered yet</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Add Farm" to register your first farm.</p>
                    </div>
                  </div>
                ) : (
                  farms.map((f, index) => (
                    <button
                      key={f.farm_id}
                      type="button"
                      onClick={() => setSelectedFarm(f)}
                      className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden
                        hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4 p-5">
                        {/* Index badge */}
                        <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                          <span className="text-sm font-bold text-green-600">{index + 1}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{f.farm_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="text-xs text-gray-400 font-mono truncate">
                              {f.gps_coordinates || 'No coordinates'}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Area</p>
                            <p className="text-sm font-bold text-gray-700">{f.farm_area?.toLocaleString()} <span className="text-xs font-normal text-gray-400">sqm</span></p>
                          </div>
                          <div className="w-px h-8 bg-gray-100" />
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Elev.</p>
                            <p className="text-sm font-bold text-gray-700">{f.farm_elevation ?? '—'} <span className="text-xs font-normal text-gray-400">m</span></p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors ml-1" />
                        </div>
                      </div>

                      {f.created_at && (
                        <div className="px-5 pb-3">
                          <span className="text-[10px] text-gray-400">
                            Registered {new Date(f.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: Farm Details ─────────────────────────────── */}
            {activeTab === 'my-farm' && hasFarm && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{farm.farm_name}</h2>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-xs text-gray-500 font-mono">{farm.gps_coordinates || 'No coordinates set'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Area</p>
                        <p className="text-2xl font-bold text-gray-800">{farm.farm_area?.toLocaleString()}<span className="text-sm font-medium text-gray-400 ml-1">sqm</span></p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">Elevation</p>
                        <p className="text-2xl font-bold text-gray-800">{farm.farm_elevation ?? '—'}<span className="text-sm font-medium text-gray-400 ml-1">m</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Crops */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-green-600" />
                      <h3 className="font-bold text-gray-800">Registered Crops</h3>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
                      {crops.length} {crops.length === 1 ? 'crop' : 'crops'}
                    </span>
                  </div>
                  {crops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
                      <div className="bg-gray-100 p-4 rounded-full">
                        <Wheat className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-semibold text-gray-500">No crops added yet</p>
                      <p className="text-xs text-gray-400">Head to My Produce to add your first crop.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {crops.map((crop) => (
                        <div key={crop.crop_id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="bg-green-100 p-2.5 rounded-xl">
                            <Wheat className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm">{crop.crop_name}</p>
                            <p className="text-xs text-gray-400 truncate">{crop.variety || 'No variety specified'}</p>
                          </div>
                          {crop.specification_1 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium shrink-0">
                              {crop.specification_1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Farm Detail Modal */}
      <FarmDetailModal farm={selectedFarm} onClose={() => setSelectedFarm(null)} />

      {/* Add Farm Modal */}
      <AddFarmModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddFarm}
        loading={loading}
      />
    </div>
  );
};

export default FarmerFarm;