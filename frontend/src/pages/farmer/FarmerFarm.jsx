import React, { useState, useEffect } from 'react';
import useFarmerStore from '../../store/FarmsStore.js';
import useProduceStore from '../../store/ProduceStore.js';
import Sidebar from '../public/components/SideBar';
import AddFarmModal from './components/AddFarmModal.jsx';
import FarmDetailModal from './components/FarmDetailModal.jsx';
import CropModal from './components/CropModal.jsx';
import EditFarmModal from './components/EditFarmModal.jsx';

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmerFarm = () => {
  const { addFarm, loading, getFarm, getFarms, getCrops, farm, farms, hasFarm, crops, deleteFarm, updateFarm } = useFarmerStore();
  const { addCrop, cropsLoading } = useProduceStore();

  const [selectedFarm, setSelectedFarm] = useState(null);
  const [editFarm, setEditFarm] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropModalFarmId, setCropModalFarmId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getFarm();
    getFarms();
  }, [getFarm, getFarms]);

  useEffect(() => {
    if (hasFarm) getCrops();
  }, [hasFarm]);

  useEffect(() => {
    if (selectedFarm) {
      const updatedFarm = farms.find(f => f.farm_id === selectedFarm.farm_id);
      if (updatedFarm) setSelectedFarm(updatedFarm);
    }
  }, [farms, refreshKey]);

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

  const getCropsForFarm = (farmId) => {
    return crops.filter(c => c.farm_id === farmId) || [];
  };

  const handleModalUpdate = () => {
    setRefreshKey(k => k + 1);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar/>
        <main className="flex-1 overflow-y-auto">
          <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Farm Management</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage all your farm properties</p>
              </div>
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors"
              >
                + Add New Farm
              </button>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="space-y-4">
              {farms.map((f) => (
                <div
                  key={f.farm_id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{f.farm_name}</h3>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          {(f.province || f.municipality || f.barangay) ? (
                            <>
                              {f.barangay && `${f.barangay}, `}
                              {f.municipality && `${f.municipality}, `}
                              {f.province && f.province}
                            </>
                          ) : (
                            <span className="text-gray-500">{f.gps_coordinates || 'No location'}</span>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {f.farm_area && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold mb-1">Area</p>
                            <p className="text-lg font-bold text-gray-900">{(f.farm_area / 1000).toFixed(1)}k m²</p>
                          </div>
                        )}

                        {f.farm_hectares && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold mb-1">Hectares</p>
                            <p className="text-lg font-bold text-gray-900">{f.farm_hectares} ha</p>
                          </div>
                        )}

                        {f.farm_elevation && (
                          <div>
                            <p className="text-xs text-gray-500 font-semibold mb-1">Elevation</p>
                            <p className="text-lg font-bold text-gray-900">{f.farm_elevation}m</p>
                          </div>
                        )}
                      </div>

                      <div className="inline-block px-3 py-1 bg-green-50 border border-green-200 rounded text-sm text-green-700 font-semibold mb-4">
                        {getCropsForFarm(f.farm_id).length} crops
                      </div>
                    </div>

                    {f.farm_image && (
                      <div className="w-48 h-32 rounded-lg overflow-hidden ml-6 flex-shrink-0">
                        <img 
                          src={`${BASE_URL}${f.farm_image}`} 
                          alt={f.farm_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setSelectedFarm(f)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded text-sm transition-colors"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => openAddCropModal(f.farm_id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-sm transition-colors"
                    >
                      Add Crop
                    </button>

                    <button
                      onClick={() => openEditFarm(f)}
                      className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-semibold rounded text-sm transition-colors"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleQuickDelete(f.farm_id)}
                      className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 font-semibold rounded text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <FarmDetailModal
        farm={selectedFarm}
        onClose={() => setSelectedFarm(null)}
        onUpdate={handleModalUpdate}
        onDelete={handleModalDelete}
      />

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
    </div>
  );
};

export default FarmerFarm;