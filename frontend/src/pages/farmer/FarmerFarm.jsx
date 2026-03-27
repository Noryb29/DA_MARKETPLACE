import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../../store/UserStore';
import useFarmerStore from '../../store/FarmerStore';
import FarmerSidebar from './components/FarmerSidebar';
import FarmMap from './components/FarmMap';

const FarmerFarm = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { addFarm, loading, getMyFarm, hasFarm } = useFarmerStore();

  const [formData, setFormData] = useState({
    farm_name: '',
    gps_coordinates: '',
    farm_area: '',
    farm_elevation: ''
  });

  // Auto-redirect if farm already setup
  useEffect(() => {
    if (hasFarm) {
      navigate('/farmer/dashboard/products', { replace: true });
    }
  }, [hasFarm, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addFarm(formData);
    // addFarm already calls getMyFarm internally, then navigate happens via useEffect
  };

  // Don't render form if already has farm
  if (hasFarm) {
    return null;
  }

  return (
    <div className='min-h-screen'>

    <div className='flex' style={{ minHeight: 'calc(100vh - 65px)'}}>
      <FarmerSidebar/>
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Register Your Farm</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Farm Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, farm_name: e.target.value})}
            required
          />
        </div>

        {/* <FarmMap formData={formData} setFormData={setFormData}/> */}
        {/* <div>
          <label className="block text-sm font-medium">GPS Coordinates</label>
          <input
            type="text"
            placeholder="14.5995, 120.9842"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, gps_coordinates: e.target.value})}
            required
          />
        </div> */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Area (sqm)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, farm_area: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Elevation (m)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              onChange={(e) => setFormData({...formData, farm_elevation: e.target.value})}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save Farm Details'}
        </button>
      </form>
    </div>
    </div>
    </div>
  );
};

export default FarmerFarm;