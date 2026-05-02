import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useFarmerStore from '../../store/FarmsStore.js';
import useProduceStore from '../../store/ProduceStore.js';
import Sidebar from '../public/components/SideBar';
import AddFarmModal from './components/AddFarmModal.jsx';
import CropModal from './components/CropModal.jsx';
import EditFarmModal from './components/EditFarmModal.jsx';
import { getDaysUntilHarvest } from '../public/shopComponents/HarvestBadge';
import { Search, Loader2, Sprout, Leaf, MapPin, Ruler, X, Calendar, SlidersHorizontal, User, FileText, MapPinned, Grid3X3, Droplets, Package } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmerFarm = () => {
  const navigate = useNavigate();
  const { addFarm, loading, getFarm, getFarms, getCrops, farm, farms, hasFarm, crops, deleteFarm, updateFarm } = useFarmerStore();
  const { addCrop, cropsLoading } = useProduceStore();

  const [selectedCrop, setSelectedCrop] = useState(null);
  const [editFarm, setEditFarm] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropModalFarmId, setCropModalFarmId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [filterArea, setFilterArea] = useState('');

  const getCropsForFarm = (farmId) => crops.filter(c => c.farm_id === farmId) || [];

  useEffect(() => {
    getFarm();
    getFarms();
  }, [getFarm, getFarms]);

  useEffect(() => {
    if (hasFarm) getCrops();
  }, [hasFarm]);

  const filtered = useMemo(() => {
    let result = farms.filter((farm) => {
      const matchSearch =
        !search ||
        farm.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        farm.gps_coordinates?.toLowerCase().includes(search.toLowerCase()) ||
        `${farm.barangay || ''} ${farm.municipality || ''} ${farm.province || ''}`.toLowerCase().includes(search.toLowerCase())

      const matchArea = (() => {
        if (!filterArea) return true
        const area = parseFloat(farm.farm_area) || 0
        if (filterArea === 'small') return area < 5000
        if (filterArea === 'medium') return area >= 5000 && area < 20000
        if (filterArea === 'large') return area >= 20000
        return true
      })()

      return matchSearch && matchArea
    })

    if (sortBy === 'name') {
      result.sort((a, b) => a.farm_name.localeCompare(b.farm_name))
    } else if (sortBy === 'area') {
      result.sort((a, b) => (b.farm_area || 0) - (a.farm_area || 0))
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return result
  }, [farms, search, sortBy, filterArea])

  const activeFilterCount = [filterArea].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setSortBy('name')
    setFilterArea('')
  }

  const handleAddFarm = async (formData) => {
    await addFarm(formData);
    setAddModalOpen(false);
  };

  const handleAddCrop = async (form) => {
    await addCrop(form);
    setCropModalOpen(false);
    setCropModalFarmId(null);
  };

  const openAddCropModal = (farmId = null) => {
    setCropModalFarmId(farmId);
    setCropModalOpen(true);
  };

  const handleModalUpdate = () => {
    getFarms();
  };

  const handleModalDelete = () => {
    setSelectedFarm(null);
    getFarms();
    getFarm();
    getCrops();
  };

  const openEditFarm = (f) => {
    setEditFarm(f);
  };

  const handleEditFarm = async (form) => {
    if (!editFarm) return;
    await updateFarm(editFarm.farm_id, form);
    setEditFarm(null);
    getFarms();
    getFarm();
  };

  const handleQuickDelete = async (farmId) => {
    await deleteFarm(farmId);
    getFarms();
    getFarm();
    getCrops();
  };

  const getDocsCount = (farm) => {
    if (!farm.farm_docs) return 0
    if (Array.isArray(farm.farm_docs)) return farm.farm_docs.length
    if (typeof farm.farm_docs === 'string' && farm.farm_docs.startsWith('[')) {
      try { return JSON.parse(farm.farm_docs).length } catch (e) { return 0 }
    }
    return 0
  }

  const location = (farm) => [farm.barangay, farm.municipality, farm.province].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
                  <p className="text-gray-500 text-sm">Track and manage all your farm properties</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                + Add New Farm
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search farms, locations, or farmers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] outline-none text-sm text-gray-800 font-medium transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all shrink-0 ${showFilters || activeFilterCount > 0 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="area">Largest Area</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase">Farm Size:</span>
                    <button onClick={() => setFilterArea('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterArea ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      All
                    </button>
                    <button onClick={() => setFilterArea('small')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'small' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      Small (Under 5k m²)
                    </button>
                    <button onClick={() => setFilterArea('medium')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'medium' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      Medium (5k-20k m²)
                    </button>
                    <button onClick={() => setFilterArea('large')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterArea === 'large' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      Large (20k+ m²)
                    </button>
                    {(search || filterArea) && (
                      <button onClick={clearFilters} className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium">
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!loading && (
              <p className="text-xs text-gray-400 font-medium mb-4">
                {filtered.length === farms.length ? `${farms.length} farms` : `${filtered.length} of ${farms.length} farms`}
              </p>
            )}

            {loading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Leaf className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No farms found</p>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
                {(search || filterArea) && (
                  <button onClick={clearFilters} className="mt-2 text-xs text-green-600 font-semibold hover:underline">
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {filtered.map((f) => (
                  <div key={f.farm_id} onClick={() => navigate(`/farmer/dashboard/farm/${f.farm_id}`)} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gradient-to-br from-green-400 to-emerald-600 relative">
                      {f.farm_image ? (
                        <img src={`${BASE_URL}${f.farm_image}`} alt={f.farm_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sprout className="w-12 h-12 text-white/40" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-semibold rounded-full">Active</span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h1 className="text-xl font-bold text-gray-900 mb-1">{f.farm_name}</h1>

                      {location(f) && (
                        <div className="flex items-start gap-2 bg-green-50 px-3 py-2 rounded-lg mb-4">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-sm text-green-800">{location(f)}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        {f.farm_hectares && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MapPinned className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-[10px] text-blue-700 font-semibold uppercase">Hectares</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{f.farm_hectares} ha</p>
                          </div>
                        )}
                        {f.farm_elevation && (
                          <div className="bg-amber-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Leaf className="w-3.5 h-3.5 text-amber-600" />
                              <span className="text-[10px] text-amber-700 font-semibold uppercase">Elevation</span>
                            </div>
                            <p className="text-base font-bold text-gray-900">{parseFloat(f.farm_elevation).toFixed(0)}m</p>
                          </div>
                        )}
                        {f.created_at && (
                          <div className="bg-purple-50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              <span className="text-[10px] text-purple-700 font-semibold uppercase">Since</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">{new Date(f.created_at).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openAddCropModal(f.farm_id)}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          Add Crop
                        </button>

                        <button
                          onClick={() => openEditFarm(f)}
                          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleQuickDelete(f.farm_id)}
                          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <AddFarmModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddFarm}
        loading={loading}
      />

      <EditFarmModal
        isOpen={!!editFarm}
        onClose={() => setEditFarm(null)}
        onSubmit={handleEditFarm}
        farm={editFarm}
        loading={loading}
      />

      <CropModal
        isOpen={cropModalOpen}
        onClose={() => {
          setCropModalOpen(false);
          setCropModalFarmId(null);
        }}
        onSubmit={handleAddCrop}
        loading={cropsLoading}
        farms={farms}
      />

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCrop.crop_name}</h2>
                <button onClick={() => setSelectedCrop(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4">
                {selectedCrop.harvest_photo ? (
                  <img src={selectedCrop.harvest_photo} alt={selectedCrop.crop_name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Sprout className="w-12 h-12 text-green-300" />
                  </div>
                )}
              </div>

              {selectedCrop.variety && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Variety</p>
                  <p className="text-sm text-gray-800">{selectedCrop.variety}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {selectedCrop.volume && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] text-green-700 font-semibold uppercase">Volume</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.volume).toLocaleString()} kg</p>
                  </div>
                )}
                {selectedCrop.stock && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[10px] text-blue-700 font-semibold uppercase">Stock</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.stock).toLocaleString()} pcs</p>
                  </div>
                )}
                {selectedCrop.expected_volume && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-[10px] text-purple-700 font-semibold uppercase">Expected</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.expected_volume).toLocaleString()} kg</p>
                  </div>
                )}
                {selectedCrop.maturity_days && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-[10px] text-amber-700 font-semibold uppercase">Maturity</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{selectedCrop.maturity_days} days</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-4">
                {selectedCrop.planting_date && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Planting Date</span>
                    <span className="text-sm font-medium text-gray-800">{new Date(selectedCrop.planting_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.expected_harvest && (
                  <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-amber-700">Expected Harvest</span>
                    <span className="text-sm font-bold text-amber-700">{new Date(selectedCrop.expected_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.actual_harvest && (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-green-700">Actual Harvest</span>
                    <span className="text-sm font-bold text-green-700">{new Date(selectedCrop.actual_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {selectedCrop.location && (
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-500">Harvest Location</span>
                    <span className="text-sm font-medium text-gray-800">{selectedCrop.location}</span>
                  </div>
                )}
              </div>

              {[1, 2, 3, 4, 5].some(n => selectedCrop[`specification_${n}`]) && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(n => selectedCrop[`specification_${n}`] && (
                      <span key={n} className="text-xs bg-gray-100 text-gray-600 px-2 py-1.5 rounded-lg">
                        {selectedCrop[`specification_${n}`]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCrop.total_harvest && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs text-green-700 font-medium">Total Harvest</span>
                  <span className="text-sm font-bold text-green-700">{Number(selectedCrop.total_harvest).toLocaleString()} kg</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerFarm;