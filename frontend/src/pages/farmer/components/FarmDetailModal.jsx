import { useState, useEffect } from 'react'
import useFarmerStore from '../../../store/FarmsStore'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmDetailModal = ({ farm, onClose, onUpdate, onDelete }) => {
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [newFiles, setNewFiles] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [initialData, setInitialData] = useState({})
  const { addFarmDocument, deleteFarmDocument, updateFarm, loading, getFarms, deleteFarm } = useFarmerStore()

  useEffect(() => {
    if (farm?.farm_id) {
      setLoadingDocs(true)
      const token = localStorage.getItem('farmer_token')
      fetch(`${BASE_URL}/api/farmers/farm/${farm.farm_id}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setDocuments(data.documents || [])
          setLoadingDocs(false)
        })
        .catch(err => {
          console.error('Failed to fetch documents:', err)
          setLoadingDocs(false)
        })
    }
  }, [farm?.farm_id])

  useEffect(() => {
    if (farm) {
      const data = {
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
      }
      setFormData(data)
      setInitialData(data)
    }
  }, [farm])

  const handleUploadDocs = async () => {
    if (newFiles.length === 0) return
    await addFarmDocument(farm.farm_id, newFiles)
    setNewFiles([])
    const res = await fetch(`${BASE_URL}/api/farmers/farm/${farm.farm_id}/documents`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('farmer_token')}` }
    })
    const data = await res.json()
    setDocuments(data.documents || [])
  }

  const handleDeleteDoc = async (doc_id) => {
    await deleteFarmDocument(doc_id, farm.farm_id)
    setDocuments(documents.filter(d => d.doc_id !== doc_id))
  }

  const handleUpdateFarm = async () => {
    await updateFarm(farm.farm_id, formData)
    await getFarms()
    setIsEditing(false)
    if (onUpdate) onUpdate()
  }

  const handleDelete = async () => {
    await deleteFarm(farm.farm_id)
    if (onDelete) onDelete()
  }

  const handleCancelEdit = () => {
    setFormData(initialData)
    setIsEditing(false)
  }

  if (!farm) return null;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const renderField = (key, label, type = 'text') => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>
      {isEditing ? (
        <input
          type={type}
          value={formData[key]}
          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-colors"
        />
      ) : (
        <p className="text-sm text-gray-800 font-medium">{formData[key] || '—'}</p>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex items-start justify-between bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{farm.farm_name}</h2>
            {farm.created_at && (
              <p className="text-xs text-gray-500 mt-1">
                Registered {formatDate(farm.created_at)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateFarm}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-sm transition-colors"
                >
                  Edit Farm
                </button>
              </>
            )}
            <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-sm transition-colors">
              Close
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Farm Image */}
          {!isEditing && farm.farm_image && (
            <div className="mb-8 rounded-lg overflow-hidden h-56">
              <img 
                src={`${BASE_URL}${farm.farm_image}`} 
                alt={farm.farm_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Edit Form or View Mode */}
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="col-span-2">{renderField('farm_name', 'Farm Name')}</div>
              {renderField('gps_coordinates', 'GPS Coordinates')}
              {renderField('farm_area', 'Area (sqm)', 'number')}
              {renderField('farm_elevation', 'Elevation (m)', 'number')}
              {renderField('province', 'Province')}
              {renderField('municipality', 'Municipality')}
              {renderField('barangay', 'Barangay')}
              {renderField('farm_hectares', 'Hectares', 'number')}
              <div className="col-span-2">{renderField('plot_boundaries', 'Plot Boundaries')}</div>
            </div>
          ) : (
            <>
              {/* View Mode: Info Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-2">GPS Coordinates</p>
                  <p className="text-sm font-mono font-semibold text-blue-900">
                    {farm.gps_coordinates || 'Not set'}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-600 font-semibold mb-2">Location</p>
                  <p className="text-sm font-medium text-amber-900">
                    {[farm.barangay, farm.municipality, farm.province].filter(Boolean).join(', ') || 'Not set'}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-semibold mb-2">Total Area</p>
                  <p className="text-sm font-bold text-green-900">
                    {farm.farm_area?.toLocaleString() || '—'} sqm
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-semibold mb-2">Hectares</p>
                  <p className="text-sm font-bold text-purple-900">
                    {farm.farm_hectares || '—'} ha
                  </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-xs text-indigo-600 font-semibold mb-2">Elevation</p>
                  <p className="text-sm font-bold text-indigo-900">
                    {farm.farm_elevation ?? '—'} m
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-600 font-semibold mb-2">Documents</p>
                  <p className="text-sm font-bold text-gray-900">
                    {documents.length} files
                  </p>
                </div>
              </div>

              {/* Plot Boundaries */}
              {farm.plot_boundaries && (
                <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Plot Boundaries</p>
                  <p className="text-sm text-gray-700">{farm.plot_boundaries}</p>
                </div>
              )}
            </>
          )}

          {/* Documents Section (only in view mode) */}
          {!isEditing && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Farm Documents</h3>
                  <p className="text-sm text-gray-600 mt-1">{documents.length} files uploaded</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-semibold cursor-pointer px-4 py-2 rounded hover:bg-green-50 transition-colors">
                  <span>+ Upload PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => setNewFiles(Array.from(e.target.files))}
                  />
                </label>
              </div>
              
              {newFiles.length > 0 && (
                <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded border border-green-200">
                  <span className="text-sm text-green-700 font-medium">{newFiles.length} file(s) selected</span>
                  <button
                    onClick={handleUploadDocs}
                    className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-semibold transition-colors"
                  >
                    Upload
                  </button>
                </div>
              )}

              {loadingDocs ? (
                <p className="text-sm text-gray-500 italic">Loading documents...</p>
              ) : documents.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const docUrl = `${BASE_URL}/api/farmers/documents/${doc.doc_id}`
                    return (
                      <div key={doc.doc_id} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium text-gray-700 truncate">{doc.file_name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-green-600 hover:text-green-700 font-semibold"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.doc_id)}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmDetailModal