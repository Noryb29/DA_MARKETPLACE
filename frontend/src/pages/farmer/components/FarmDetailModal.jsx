import { useState, useEffect } from 'react'
import { MapPin, X, Ruler, Mountain, FileText, Sprout, MapPinned, Image, Upload } from 'lucide-react'
import useFarmerStore from '../../../store/FarmsStore'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const FarmDetailModal = ({ farm, onClose }) => {
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [newFiles, setNewFiles] = useState([])
  const { getFarmDocuments, addFarmDocument, deleteFarmDocument } = useFarmerStore()

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

          {/* Documents Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Farm Documents ({documents.length})
                </p>
              </div>
              <label className="flex items-center gap-1 text-xs text-green-600 cursor-pointer hover:text-green-700">
                <Upload className="w-3 h-3" />
                <span>Add PDF</span>
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
              <div className="flex items-center gap-2 mb-3 p-2 bg-green-50 rounded-lg">
                <span className="text-xs text-green-700">{newFiles.length} file(s) selected</span>
                <button
                  onClick={handleUploadDocs}
                  className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Upload
                </button>
              </div>
            )}

            {loadingDocs ? (
              <p className="text-xs text-gray-400">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No documents uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => {
                  const docUrl = `${BASE_URL}/api/farmers/documents/${doc.doc_id}`
                  return (
                    <div key={doc.doc_id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-600 truncate">{doc.file_name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteDoc(doc.doc_id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <iframe
                        src={docUrl}
                        className="w-full h-64"
                        title={doc.file_name}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

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