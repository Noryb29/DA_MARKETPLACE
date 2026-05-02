import { useState, useEffect, useRef } from "react";
import { MapPin, X, Image, FileText, Loader2, Search, Navigation } from 'lucide-react';
import regionData from '../../../assets/REGION_X.json';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER = [12.8797, 121.774];
const DEFAULT_ZOOM = 5;

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    },
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  return null;
}

const MapSelector = ({ onLocationSelect, selectedCoords }) => {
  const [marker, setMarker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    if (selectedCoords && typeof selectedCoords === 'string' && selectedCoords.includes(', ')) {
      const parts = selectedCoords.split(', ');
      if (parts.length === 2) {
        const lat = Number(parts[0]);
        const lng = Number(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          setMarker({ lat, lng });
        }
      }
    } else {
      setMarker(null);
    }
  }, [selectedCoords]);

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchLocation(searchQuery);
  };

  const selectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarker({ lat, lng });
    setSearchResults([]);
    setSearchQuery('');
    onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    mapRef.current?.setView([lat, lng], 15);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarker({ lat, lng });
          onLocationSelect(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location access.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleLocationSelect = ({ lat, lng }) => {
    const coordsStr = `${lat}, ${lng}`;
    setMarker({ lat, lng });
    onLocationSelect(coordsStr);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search location in Philippines..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-800 text-sm font-medium outline-none focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        {searchResults.length > 0 && (
          <div className="absolute z-[1000] w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-green-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
              >
                <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-medium">{result.display_name.split(',')[0]}</p>
                  <p className="text-xs text-gray-500 truncate">{result.display_name.replace(result.display_name.split(',')[0] + ', ', '')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={getCurrentLocation}
        className="w-full py-2.5 rounded-xl border-2 border-green-500 bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
      >
        <Navigation className="w-4 h-4" />
        Use My Current GPS Location
      </button>
      <div className="rounded-xl overflow-hidden border-2 border-gray-200">
        <MapContainer
          center={marker ? [marker.lat, marker.lng] : DEFAULT_CENTER}
          zoom={marker ? 15 : DEFAULT_ZOOM}
          style={{ height: '250px', width: '100%' }}
          scrollWheelZoom={true}
          whenCreated={(map) => (mapRef.current = map)}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {marker && <Marker position={[marker.lat, marker.lng]} />}
          {marker && <MapUpdater center={marker} />}
        </MapContainer>
      </div>
      {selectedCoords && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium font-mono">{selectedCoords}</span>
          <button type="button" onClick={() => { setMarker(null); onLocationSelect(''); }} className="ml-auto text-green-400 hover:text-green-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

const EditFarmModal = ({ isOpen, onClose, onSubmit, farm, loading }) => {
  const [form, setForm] = useState({});
  const [focused, setFocused] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { 
    if (isOpen && farm) {
      setForm({
        farm_name: farm.farm_name || '',
        gps_coordinates: farm.gps_coordinates || '',
        farm_location: farm.farm_location || '',
        farm_area: farm.farm_area || '',
        farm_elevation: farm.farm_elevation || '',
        province: farm.province || '',
        municipality: farm.municipality || '',
        barangay: farm.barangay || '',
        farm_hectares: farm.farm_hectares || '',
        plot_boundaries: farm.plot_boundaries || '',
        farm_image: null,
      });
      setImagePreview(farm.farm_image ? `${import.meta.env.VITE_BASE_URL || "http://localhost:3000"}${farm.farm_image}` : null);
    }
  }, [isOpen, farm]);

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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh]">
        <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-20px)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Edit Farm</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update farm details.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-5">
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

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">GPS Location</label>
              <MapSelector
                selectedCoords={form.gps_coordinates}
                onLocationSelect={(coords) => setForm({ ...form, gps_coordinates: coords })}
              />
            </div>

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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Hectares</label>
                <div className="relative">
                  <input
                    type="number" placeholder="0" step="0.01"
                    className={inputClass('farm_hectares') + ' pr-14'} value={form.farm_hectares}
                    onFocus={() => setFocused('farm_hectares')} onBlur={() => setFocused('')}
                    onChange={(e) => setForm({ ...form, farm_hectares: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">ha</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Elevation (masl)</label>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Province</label>
              <select
                className={inputClass('province')} value={form.province}
                onFocus={() => setFocused('province')} onBlur={() => setFocused('')}
                onChange={(e) => {
                  const prov = e.target.value;
                  setForm({ 
                    ...form, 
                    province: prov,
                    municipality: '',
                    barangay: ''
                  });
                }}
              >
                <option value="">Select Province</option>
                {Object.keys(regionData).map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Municipality</label>
                <select
                  className={inputClass('municipality')} value={form.municipality}
                  onFocus={() => setFocused('municipality')} onBlur={() => setFocused('')}
                  onChange={(e) => {
                    const mun = e.target.value;
                    setForm({ 
                      ...form, 
                      municipality: mun,
                      barangay: ''
                    });
                  }}
                  disabled={!form.province}
                >
                  <option value="">Select Municipality</option>
                  {form.province && regionData[form.province] && 
                    Object.keys(regionData[form.province]).map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))
                  }
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Barangay</label>
                <select
                  className={inputClass('barangay')} value={form.barangay}
                  onFocus={() => setFocused('barangay')} onBlur={() => setFocused('')}
                  onChange={(e) => setForm({ ...form, barangay: e.target.value })}
                  disabled={!form.municipality}
                >
                  <option value="">Select Barangay</option>
                  {form.province && form.municipality && 
                    regionData[form.province]?.[form.municipality]?.map(bgy => (
                      <option key={bgy} value={bgy}>{bgy}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Additional Address</label>
              <input
                type="text" placeholder="Street or Landmark"
                className={inputClass('farm_location')} value={form.farm_location}
                onFocus={() => setFocused('farm_location')} onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, farm_location: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Plot Boundaries</label>
              <textarea
                placeholder="(e.g., North: River, East: Road, etc.)"
                className={inputClass('plot_boundaries') + ' min-h-[80px] resize-none'}
                value={form.plot_boundaries}
                onFocus={() => setFocused('plot_boundaries')}
                onBlur={() => setFocused('')}
                onChange={(e) => setForm({ ...form, plot_boundaries: e.target.value })}
              />
            </div>

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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFarmModal;