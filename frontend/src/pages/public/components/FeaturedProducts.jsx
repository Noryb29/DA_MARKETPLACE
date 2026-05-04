import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useMarketStore from '../../../store/MarketStore'
import { MapPin, Package, Wheat, ArrowRight, Calendar } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getDaysUntilHarvest = (date) => {
  if (!date) return null
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
}

const HarvestBadge = ({ date }) => {
  const days = getDaysUntilHarvest(date)
  if (days === null) return null
  if (days < 0)    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Harvested</span>
  if (days <= 7)   return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">In {days}d</span>
  if (days <= 30)  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100">In {days}d</span>
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">In {days}d</span>
}

// ─── Crop emoji map ───────────────────────────────────────────────────────────
const getCropEmoji = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('rice'))    return '🌾'
  if (n.includes('corn') || n.includes('mais')) return '🌽'
  if (n.includes('tomato'))  return '🍅'
  if (n.includes('mango'))   return '🥭'
  if (n.includes('banana'))  return '🍌'
  if (n.includes('carrot'))  return '🥕'
  if (n.includes('pepper'))  return '🌶️'
  if (n.includes('onion'))   return '🧅'
  if (n.includes('garlic'))  return '🧄'
  if (n.includes('potato'))  return '🥔'
  if (n.includes('eggplant') || n.includes('talong')) return '🍆'
  if (n.includes('cabbage')) return '🥬'
  if (n.includes('lettuce')) return '🥗'
  if (n.includes('pineapple')) return '🍍'
  if (n.includes('watermelon')) return '🍉'
  return '🌱'
}

// ─── Single Card ──────────────────────────────────────────────────────────────
const CropCard = ({ crop, index }) => {
  const specs = [1,2,3,4,5,6,7,8].map(n => {
    const name = crop[`specification_${n}_name`]
    const value = crop[`specification_${n}_value`]
    return (name || value) ? `${name}: ${value}` : null
  }).filter(Boolean)

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden
        hover:border-green-300 hover:shadow-xl transition-all duration-300
        flex flex-col"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card top color band */}
      <div className="h-1 w-full bg-linear-to-r from-green-400 via-emerald-400 to-teal-400" />

      {/* Emoji hero area */}
      <div className="relative bg-linear-to-br from-green-50 to-emerald-50 px-6 pt-6 pb-4 flex items-center justify-between">
        <span className="text-5xl select-none">{getCropEmoji(crop.crop_name)}</span>
        <HarvestBadge date={crop.expected_harvest} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 py-4 gap-3">

        {/* Name + variety */}
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">{crop.crop_name}</h3>
          {crop.variety && (
            <p className="text-xs text-gray-400 mt-0.5">{crop.variety}</p>
          )}
        </div>

        {/* Farm + Location */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span className="text-xs text-gray-500 font-medium truncate">{crop.farm_name}</span>
          </div>
          {(crop.province || crop.municipality || crop.barangay) && (
            <div className="flex items-center gap-1 pl-5">
              <span className="text-[10px] text-gray-400 truncate">
                {crop.barangay}{crop.municipality && `, ${crop.municipality}`}{crop.province && `, ${crop.province}`}
              </span>
            </div>
          )}
          {crop.farm_location && (
            <div className="flex items-center gap-1 pl-5">
              <span className="text-[10px] text-gray-400 truncate">{crop.farm_location}</span>
            </div>
          )}
          {crop.gps_coordinates && (
            <div className="flex items-center gap-1 pl-5">
              <span className="text-[10px] text-gray-300 truncate">GPS: {crop.gps_coordinates}</span>
            </div>
          )}
        </div>

        {/* Volume + Stock */}
        {(crop.volume || crop.stock) && (
          <div className="flex items-center gap-2 flex-wrap">
            {crop.volume && (
              <div className="flex items-center gap-1 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
                <Package className="w-3 h-3 text-green-500" />
                <span className="text-xs font-semibold text-green-700">
                  {Number(crop.volume).toLocaleString()} kg
                </span>
              </div>
            )}
            {crop.stock && (
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                <span className="text-xs font-semibold text-blue-700">
                  {Number(crop.stock).toLocaleString()} pcs
                </span>
              </div>
            )}
          </div>
        )}

        {/* Expected harvest date */}
        {crop.expected_harvest && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-gray-400">
              Harvest {new Date(crop.expected_harvest).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {specs.map((s, i) => (
              <span key={i} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold border border-green-200">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Spacer push button to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <Link
          to="/shop/products"
          className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
            bg-linear-to-r from-green-500 to-emerald-600
            hover:from-green-600 hover:to-emerald-700
            text-white text-xs font-bold
            active:scale-[0.98] transition-all shadow-sm shadow-green-200"
        >
          View in Shop
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-1 w-full bg-gray-200" />
    <div className="bg-gray-100 h-24" />
    <div className="px-5 py-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-8 bg-gray-200 rounded-xl mt-4" />
    </div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const FeaturedProducts = () => {
  const { crops, loading, initialized, getAllCrops } = useMarketStore()

  useEffect(() => { getAllCrops() }, [])

  // Show only the 6 most recent
  const featured = crops.slice(0, 6)

  return (
    <section className="py-16 px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <Wheat className="w-3.5 h-3.5" />
              Fresh from the Farm
            </div>
            <h2 className="text-4xl font-bold text-green-900 leading-tight">
              Featured Produce
            </h2>
            <p className="text-gray-500 mt-2">
              Handpicked fresh crops from registered local farmers.
            </p>
          </div>

          <Link
            to="/shop/products"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-green-700
              hover:text-green-800 border-2 border-green-200 hover:border-green-400
              px-5 py-2.5 rounded-xl transition-all"
          >
            Browse All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        {!initialized || loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="bg-gray-100 p-5 rounded-full">
              <Wheat className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-500">No crops listed yet</p>
            <p className="text-xs text-gray-400">Check back soon for fresh produce.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((crop, i) => (
              <CropCard key={crop.crop_id} crop={crop} index={i} />
            ))}
          </div>
        )}

        {/* Mobile browse all */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            to="/shop/products"
            className="flex items-center gap-2 text-sm font-semibold text-green-700
              border-2 border-green-200 px-6 py-3 rounded-xl hover:border-green-400 transition-all"
          >
            Browse All Produce
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}

export default FeaturedProducts