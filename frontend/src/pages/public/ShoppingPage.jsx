import React, { useEffect, useState, useMemo } from 'react'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import MarketFilterPanel from './shopComponents/MarketFilterPanel'
import CartDrawer from './shopComponents/CartDrawer'
import useCartStore from '../../store/CartStore'
import useUserStore from '../../store/UserStore'
import { getDaysUntilHarvest } from './shopComponents/HarvestBadge'
import { Wheat, Search, SlidersHorizontal, X, Loader2, Sprout, ShoppingCart, Package, Archive, Calendar, MapPin, Leaf, ArrowUpDown, XCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import CropLocation from '../../components/CropLocation'
import CropCard from '../../components/CropCard'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

const ITEMS_PER_PAGE = 12

const ShoppingPage = () => {
  const { items, openCart, addToCart } = useCartStore()
  const { user } = useUserStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const { crops, initialized, getAllCrops } = useMarketStore()

  const [search, setSearch] = useState('')
  const [filterVariety, setFilterVariety] = useState('')
  const [filterHarvest, setFilterHarvest] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [filterMinVolume, setFilterMinVolume] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCrop, setSelectedCrop] = useState(null)

  useEffect(() => { getAllCrops() }, [])

  useEffect(() => { setCurrentPage(1) }, [search, filterVariety, filterHarvest, filterLocation, filterStock, filterMinVolume, sortBy])

  const varieties = useMemo(() => [...new Set(crops.map((c) => c.variety).filter(Boolean))].sort(), [crops])
  const locations = useMemo(() => [...new Set(crops.map((c) => c.location).filter(Boolean))].sort(), [crops])

  const filtered = useMemo(() => {
    let result = crops.filter((c) => {
      const matchSearch = !search ||
        c.crop_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.variety?.toLowerCase().includes(search.toLowerCase()) ||
        c.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        [1, 2, 3, 4, 5, 6, 7, 8].some(n => (c[`specification_${n}_name`] || c[`specification_${n}_value`] || '')?.toLowerCase().includes(search.toLowerCase()))

      const matchVariety = !filterVariety || c.variety === filterVariety
      const matchHarvest = (() => {
        if (!filterHarvest) return true
        const days = getDaysUntilHarvest(c.expected_harvest)
        if (days === null) return false
        if (filterHarvest === 'week') return days >= 0 && days <= 7
        if (filterHarvest === 'month') return days >= 0 && days <= 30
        if (filterHarvest === 'harvested') return days < 0
        return true
      })()
      const matchLocation = !filterLocation || c.location === filterLocation
      const matchStock = (() => {
        if (!filterStock) return true
        if (filterStock === 'in_stock') return c.stock > 0
        if (filterStock === 'out_of_stock') return !c.stock || c.stock <= 0
        return true
      })()
      const matchMinVolume = !filterMinVolume || (c.volume && c.volume >= parseFloat(filterMinVolume))

      return matchSearch && matchVariety && matchHarvest && matchLocation && matchStock && matchMinVolume
    })

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0)
      if (sortBy === 'name_asc') return (a.crop_name || '').localeCompare(b.crop_name || '')
      if (sortBy === 'name_desc') return (b.crop_name || '').localeCompare(a.crop_name || '')
      if (sortBy === 'volume') return (b.volume || 0) - (a.volume || 0)
      return 0
    })

    return result
  }, [crops, search, filterVariety, filterHarvest, filterLocation, filterStock, filterMinVolume, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedCrops = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const activeFilterCount = [filterVariety, filterHarvest, filterLocation, filterStock, filterMinVolume].filter(Boolean).length

  const clearFilters = () => {
    setFilterVariety('')
    setFilterHarvest('')
    setFilterLocation('')
    setFilterStock('')
    setFilterMinVolume('')
    setSearch('')
    setSortBy('newest')
    setCurrentPage(1)
  }

  const handleAddToCart = (crop) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in to add items to your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Maybe Later',
      }).then((result) => {
        if (result.isConfirmed) window.location.href = '/login'
      })
      return
    }
    addToCart(crop)
    Swal.fire({
      title: 'Added to Cart',
      text: `${crop.crop_name} has been added to your cart.`,
      icon: 'success',
      confirmButtonColor: '#16a34a',
      confirmButtonText: 'OK',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-7 flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                  <Sprout className="w-3.5 h-3.5" />
                  Public Marketplace
                </div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Produce</h1>
                <p className="text-gray-500 mt-1 text-sm">Fresh crops listed directly by registered farmers.</p>
              </div>
              <button onClick={openCart} className="relative flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-green-400 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 transition-all mt-1">
                <ShoppingCart className="w-4 h-4" />
                Cart
                {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">{totalItems}</span>}
              </button>
            </div>

            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" placeholder="Search by crop, variety, farm…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] outline-none text-sm text-gray-800 font-medium transition-all" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>}
              </div>

              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none px-4 py-2.5 pr-10 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-300 transition-all cursor-pointer">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="volume">Volume</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${showFilters || activeFilterCount > 0 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && <span className="bg-green-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>

            {showFilters && (
              <MarketFilterPanel varieties={varieties} filterVariety={filterVariety} setFilterVariety={setFilterVariety} filterHarvest={filterHarvest} setFilterHarvest={setFilterHarvest} locations={locations} filterLocation={filterLocation} setFilterLocation={setFilterLocation} filterStock={filterStock} setFilterStock={setFilterStock} filterMinVolume={filterMinVolume} setFilterMinVolume={setFilterMinVolume} activeFilterCount={activeFilterCount} clearFilters={clearFilters} />
            )}

            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-4">
                {filtered.length === crops.length ? `${crops.length} listings` : `${filtered.length} of ${crops.length} listings`}
                {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
              </p>
            )}

            {!initialized && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-7 h-7 animate-spin text-green-600" />
              </div>
            )}

            {initialized && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="bg-gray-100 p-5 rounded-full">
                  <Wheat className="w-10 h-10 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-500">No crops found</p>
                <p className="text-xs text-gray-400">Try adjusting your search or filters.</p>
                {(search || activeFilterCount > 0) && (
                  <button onClick={clearFilters} className="mt-1 text-xs text-green-600 font-semibold hover:underline">Clear all filters</button>
                )}
              </div>
            )}

            <CartDrawer />

            {initialized && filtered.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {paginatedCrops.map((crop) => (
                    <CropCard key={crop.crop_id} crop={crop} onClick={() => setSelectedCrop(crop)} variant="shop" showAddToCart={true} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pb-8">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />
            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCrop.crop_name}</h2>
                <button onClick={() => setSelectedCrop(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4">
                {selectedCrop.harvest_photo ? (
                  <img src={selectedCrop.harvest_photo.startsWith('http') ? selectedCrop.harvest_photo : `${BASE_URL}${selectedCrop.harvest_photo}`} alt={selectedCrop.crop_name} className="w-full h-44 object-cover" />
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
                      <Package className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] text-green-700 font-semibold uppercase">Volume</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{Number(selectedCrop.volume).toLocaleString()} kg</p>
                  </div>
                )}
                {selectedCrop.stock && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Archive className="w-3.5 h-3.5 text-blue-600" />
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

              {[1, 2, 3, 4, 5, 6, 7, 8].some(n => selectedCrop[`specification_${n}_name`] || selectedCrop[`specification_${n}_value`]) && (
                <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2">Specifications</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
                      const name = selectedCrop[`specification_${n}_name`]
                      const value = selectedCrop[`specification_${n}_value`]
                      return (name || value) && (
                        <span key={n} className="text-xs bg-white text-green-700 font-semibold px-3 py-1.5 rounded-lg border border-green-200">
                          {name}: <span className="font-normal">{value}</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedCrop.total_harvest && (
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs text-green-700 font-medium">Total Harvest</span>
                  <span className="text-sm font-bold text-green-700">{Number(selectedCrop.total_harvest).toLocaleString()} kg</span>
                </div>
              )}

              {selectedCrop.farm_name && (
                <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedCrop.farm_name}</span>
                  </div>
                  {(selectedCrop.province || selectedCrop.municipality || selectedCrop.barangay) && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-xs text-gray-500">
                        {selectedCrop.barangay}{selectedCrop.municipality && `, ${selectedCrop.municipality}`}{selectedCrop.province && `, ${selectedCrop.province}`}
                      </span>
                    </div>
                  )}
                  {selectedCrop.farm_location && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-xs text-gray-500">{selectedCrop.farm_location}</span>
                    </div>
                  )}
                  {selectedCrop.gps_coordinates && (
                    <div className="flex items-center gap-2 pl-6">
                      <span className="text-xs text-gray-400">GPS: {selectedCrop.gps_coordinates}</span>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => { handleAddToCart(selectedCrop); setSelectedCrop(null); }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold shadow-md shadow-green-200">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShoppingPage