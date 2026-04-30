import React, { useState, useEffect } from 'react';
import useFarmerStore from '../../store/FarmsStore.js';
import { MapPin, Wheat, ChevronRight, Plus, X, List, LayoutGrid,ClipboardList, Sprout, FileText, Image } from 'lucide-react';
import Sidebar from '../public/components/SideBar';
import AddFarmModal from './components/AddFarmModal.jsx';
import FarmDetailModal from './components/FarmDetailModal.jsx';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"


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
        <main className="flex-1 py-10 overflow-y-auto">
          <div className="px-10 mx-auto">

            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <ClipboardList className="w-3.5 h-3.5" />
                Farm Management
              </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Farms</h1>
                <p className="text-gray-500 mt-1 text-sm">Manage your farms and registered crops.</p>
              </div>

              {/* Add Farm Button */}
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600
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
                      <div className="flex">
                        {/* Farm Image */}
                        {f.farm_image ? (
                          <div className="w-24 h-full min-h-[100px] shrink-0">
                            <img 
                              src={`${BASE_URL}${f.farm_image}`} 
                              alt={f.farm_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-full min-h-[100px] bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shrink-0">
                            <Image className="w-8 h-8 text-green-300" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-800 text-sm truncate">{f.farm_name}</p>
                                {f.land_use_type && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                                    f.land_use_type === 'pasture' ? 'bg-amber-100 text-amber-700' :
                                    f.land_use_type === 'cultivated' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {f.land_use_type}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                                <span className="text-xs text-gray-400 font-mono truncate">
                                  {f.gps_coordinates || 'No coordinates'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors shrink-0" />
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Area</p>
                              <p className="text-sm font-bold text-gray-700">{f.farm_area?.toLocaleString()} <span className="text-xs font-normal text-gray-400">sqm</span></p>
                            </div>
                            {f.total_acres && (
                              <>
                                <div className="w-px h-6 bg-gray-200" />
                                <div className="text-right">
                                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Acres</p>
                                  <p className="text-sm font-bold text-gray-700">{f.total_acres}</p>
                                </div>
                              </>
                            )}
                            {f.farm_elevation && (
                              <>
                                <div className="w-px h-6 bg-gray-200" />
                                <div className="text-right">
                                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wide">Elev.</p>
                                  <p className="text-sm font-bold text-gray-700">{f.farm_elevation} <span className="text-xs font-normal text-gray-400">m</span></p>
                                </div>
                              </>
                            )}
                            {f.farm_docs && (
                              (() => {
                                let docsArray = []
                                if (Array.isArray(f.farm_docs)) {
                                  docsArray = f.farm_docs
                                } else if (typeof f.farm_docs === 'string' && f.farm_docs.startsWith('[')) {
                                  try {
                                    docsArray = JSON.parse(f.farm_docs)
                                  } catch (e) {
                                    docsArray = []
                                  }
                                }
                                if (docsArray.length === 0) return null
                                return (
                                  <>
                                    <div className="w-px h-6 bg-gray-200" />
                                    <div className="flex items-center gap-1">
                                      <FileText className="w-3 h-3 text-blue-400" />
                                      <span className="text-xs text-blue-600 font-medium">{docsArray.length} docs</span>
                                    </div>
                                  </>
                                )
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: Farm Details ─────────────────────────────── */}
            {activeTab === 'my-farm' && hasFarm && (
              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />
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