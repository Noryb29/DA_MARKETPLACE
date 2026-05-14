import React, { useEffect, useState, useMemo } from 'react'
import Header from '../public/components/Header'
import useMarketStore from '../../store/MarketStore'
import MarketFilterPanel from '../public/shopComponents/MarketFilterPanel'
import CartDrawer from '../public/shopComponents/CartDrawer'
import useCartStore from '../../store/CartStore'
import useUserStore from '../../store/UserStore'
import { getDaysUntilHarvest } from '../public/shopComponents/HarvestBadge'
import { Wheat, Search, SlidersHorizontal, X, Loader2, Sprout, ShoppingCart, MapPin, Package, Archive, Calendar } from 'lucide-react'
import Sidebar from '../public/components/SideBar'
import Swal from 'sweetalert2'
import CropLocation from '../../components/CropLocation'
import CropCard from '../../components/CropCard'
import { getImageSrc } from '../../utils/imageUtils'

const UserShoppingPage = () => {
  const { items, openCart, addToCart } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const { crops, initialized, getAllCrops, resetCrops } = useMarketStore()
  const { user } = useUserStore()

  const [search, setSearch] = useState('')
  const [filterVariety, setFilterVariety] = useState('')
  const [filterHarvest, setFilterHarvest] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [filterMinVolume, setFilterMinVolume] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCrop, setSelectedCrop] = useState(null)
  const selectedCropImg = useMemo(() => selectedCrop ? getImageSrc(selectedCrop) : null, [selectedCrop])

  useEffect(() => { 
    resetCrops()
    getAllCrops()
  }, [])

  const varieties = useMemo(() =>
    [...new Set(crops.map((c) => c.variety).filter(Boolean))].sort()
  , [crops])

  const locations = useMemo(() =>
    [...new Set(crops.map((c) => c.farm_location || c.location).filter(Boolean))].sort()
  , [crops])

  const filtered = useMemo(() => {
    return crops.filter((c) => {
      const matchSearch =
        !search ||
        c.crop_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.variety?.toLowerCase().includes(search.toLowerCase()) ||
        c.farm_name?.toLowerCase().includes(search.toLowerCase()) ||
        [1, 2, 3, 4, 5].some(n => c[`specification_${n}`]?.toLowerCase().includes(search.toLowerCase()))

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

      const matchLocation = !filterLocation || c.farm_location === filterLocation || c.location === filterLocation

      const matchStock = (() => {
        if (!filterStock) return true
        if (filterStock === 'in_stock') return c.stock > 0
        if (filterStock === 'out_of_stock') return !c.stock || c.stock <= 0
        return true
      })()

      const matchMinVolume = !filterMinVolume || (c.volume && c.volume >= parseFloat(filterMinVolume))

      return matchSearch && matchVariety && matchHarvest && matchLocation && matchStock && matchMinVolume
    })
  }, [crops, search, filterVariety, filterHarvest, filterLocation, filterStock, filterMinVolume])

  const activeFilterCount = [filterVariety, filterHarvest, filterLocation, filterStock, filterMinVolume].filter(Boolean).length

  const clearFilters = () => {
    setFilterVariety('')
    setFilterHarvest('')
    setFilterLocation('')
    setFilterStock('')
    setFilterMinVolume('')
    setSearch('')
  }

  const handleAddToCart = (crop) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please log in or create an account to add items to your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Log In',
        cancelButtonText: 'Maybe Later',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login'
        }
      })
      return
    }
    addToCart(crop)
    setSelectedCrop(null)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar />

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            <div className="mb-7 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                    <Sprout className="w-3.5 h-3.5" />
                    Public Marketplace
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Browse Produce</h1>
                  <p className="text-gray-500 mt-1 text-sm">Fresh crops listed directly by registered farmers.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-semibold transition-all mt-1 ${showFilters ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:border-green-400'}`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={openCart}
                    className="relative flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 hover:border-green-400 rounded-xl text-sm font-semibold text-gray-700 hover:text-green-700 transition-all mt-1"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {totalItems}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search crops, varieties, farms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:shadow-[0_0_0_4px_rgba(34,197,94,0.12)] text-sm text-gray-800 font-medium transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <CartDrawer />

            {showFilters && (
              <MarketFilterPanel 
                varieties={varieties} 
                filterVariety={filterVariety} 
                setFilterVariety={setFilterVariety} 
                filterHarvest={filterHarvest} 
                setFilterHarvest={setFilterHarvest} 
                locations={locations} 
                filterLocation={filterLocation} 
                setFilterLocation={setFilterLocation} 
                filterStock={filterStock} 
                setFilterStock={setFilterStock} 
                filterMinVolume={filterMinVolume} 
                setFilterMinVolume={setFilterMinVolume} 
                activeFilterCount={activeFilterCount} 
                clearFilters={clearFilters} 
              />
            )}

            {initialized && (
              <p className="text-xs text-gray-400 font-medium mb-4">
                {filtered.length === crops.length ? `${crops.length} listings` : `${filtered.length} of ${crops.length} listings`}
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

            {initialized && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {filtered.map((crop) => (
                  <CropCard 
                    key={crop.crop_id} 
                    crop={crop} 
                    onClick={() => setSelectedCrop(crop)} 
                    variant="shop" 
                    showAddToCart={true} 
                    onAddToCart={handleAddToCart} 
                  />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCrop(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="h-1.5 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-400" />

            <div className="p-5 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">{selectedCrop.crop_name}</h2>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="rounded-xl overflow-hidden mb-4">
                {selectedCropImg ? (
                  <img src={selectedCropImg} alt={selectedCrop.crop_name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Wheat className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                {selectedCrop.variety && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Variety</span>
                    <span className="text-sm text-gray-800">{selectedCrop.variety}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Farm</span>
                  <span className="text-sm text-gray-800">{selectedCrop.farm_name}</span>
                </div>

                {selectedCrop.planting_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Planting Date</span>
                    <span className="text-sm text-gray-800">{formatDate(selectedCrop.planting_date)}</span>
                  </div>
                )}

                {selectedCrop.expected_harvest && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Expected Harvest</span>
                    <span className="text-sm text-gray-800">{formatDate(selectedCrop.expected_harvest)}</span>
                  </div>
                )}

                {selectedCrop.volume !== null && selectedCrop.volume !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Volume</span>
                    <span className="text-sm font-semibold text-green-700">{Number(selectedCrop.volume).toLocaleString()} kg</span>
                  </div>
                )}

                {selectedCrop.stock && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Stock</span>
                    <span className="text-sm font-semibold text-blue-700">{Number(selectedCrop.stock).toLocaleString()} pcs</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleAddToCart(selectedCrop)}
                className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
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

export default UserShoppingPage