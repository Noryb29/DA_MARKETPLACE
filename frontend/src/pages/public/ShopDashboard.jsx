import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import useMarketStore from '../../store/MarketStore'
import {
  Sprout, MapPin, ArrowRight, Leaf, Search, ChevronRight,
  Package, Calendar, ShieldCheck, Truck, BadgeCheck, Star,
  Wheat, TreePine, Apple, Carrot, ChevronLeft
} from 'lucide-react'
import CropLocation from '../../components/CropLocation'
import CropCard from '../../components/CropCard'

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"

/* ─── Marquee ticker ─────────────────────────────────────────── */
const TICKER_ITEMS = [
  '🌾 Fresh harvest daily',
  '🥦 Straight from the farm',
  '🍅 Zero middlemen',
  '🌽 Local farmers, fair prices',
  '🥬 Organic options available',
  '🍠 Seasonal produce',
  '🫚 Farm-to-table guarantee',
]

const Marquee = () => (
  <div className="overflow-hidden bg-green-600 py-2.5 select-none">
    <style>{`
      @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      .marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
      .marquee-track:hover { animation-play-state: paused; }
    `}</style>
    <div className="marquee-track">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="text-white text-xs font-semibold px-8 tracking-wide whitespace-nowrap">
          {item} <span className="opacity-40 ml-8">✦</span>
        </span>
      ))}
    </div>
  </div>
)

/* ─── Stat card ───────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, bg, color }) => (
  <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${bg}`}>
      <span className={color}>{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 leading-none mt-0.5">{value}</p>
    </div>
  </div>
)

/* ─── Farm card ───────────────────────────────────────────────── */
const FarmCard = ({ farm, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
  >
    <div className="h-32 bg-gradient-to-br from-green-400 to-emerald-500 relative overflow-hidden">
      {farm.farm_image ? (
        <img
          src={farm.farm_image}
          alt={farm.farm_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Sprout className="w-10 h-10 text-white/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>

    <div className="p-4 space-y-2">
      <p className="font-bold text-gray-900 truncate">{farm.farm_name}</p>
      <CropLocation farm={farm} showGps={true} />
      {farm.farm_area && (
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full"
              style={{ width: `${Math.min((farm.farm_area / 20) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-green-700 flex-shrink-0">{farm.farm_area} ha</span>
        </div>
      )}
    </div>
  </div>
)

/* ─── How it works ────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse Crops',
    desc: 'Explore hundreds of fresh crops listed by verified local farmers in your region.',
    color: 'bg-green-500',
  },
  {
    step: '02',
    title: 'Choose a Farm',
    desc: 'View farm profiles, location, and available produce to find the right match.',
    color: 'bg-emerald-500',
  },
  {
    step: '03',
    title: 'Place Your Order',
    desc: 'Order directly from the farmer with transparent pricing and no hidden fees.',
    color: 'bg-teal-500',
  },
  {
    step: '04',
    title: 'Get It Fresh',
    desc: 'Receive your produce straight from the farm, as fresh as it gets.',
    color: 'bg-green-600',
  },
]

const HowItWorks = () => (
  <section className="px-6 py-16 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          Simple Process
        </span>
        <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
          Getting fresh produce from a local farm has never been this easy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {HOW_IT_WORKS.map((item, i) => (
          <div key={i} className="relative">
            {i < HOW_IT_WORKS.length - 1 && (
              <div className="hidden lg:block absolute top-6 left-[60%] w-full h-px bg-gradient-to-r from-green-200 to-transparent z-0" />
            )}
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                {item.step}
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)

/* ─── Testimonials ────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Maria Santos',
    role: 'Home Cook, Zamboanga',
    text: 'The freshest vegetables I\'ve ever bought. You can taste the difference when it comes straight from the farm!',
    rating: 5,
  },
  {
    name: 'Engr. Rodel Fuentes',
    role: 'Restaurant Owner',
    text: 'We source all our produce here now. The quality is consistent and farmers are always responsive. Highly recommended.',
    rating: 5,
  },
  {
    name: 'Liza Manalo',
    role: 'Community Organizer',
    text: 'Love that I can support local farmers directly. This platform is making a real difference in our community.',
    rating: 5,
  },
]


/* ─── Newsletter / CTA Banner ─────────────────────────────────── */
const CTABanner = ({ onShop, onFarm }) => (
  <section className="px-6 py-16">
    <div className="max-w-5xl mx-auto">
      <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-10 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-8 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-6 right-32 w-8 h-8 bg-white/20 rounded-full" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sprout size={12} /> Farm to Table
            </div>
            <h2 className="text-3xl font-bold mb-2 leading-tight">
              Ready to Eat Fresh?
            </h2>
            <p className="text-green-100 text-sm max-w-sm leading-relaxed">
              Join thousands of buyers getting the freshest produce straight from verified local farms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button
              onClick={onShop}
              className="px-7 py-3 bg-white text-green-700 hover:bg-green-50 font-bold rounded-xl transition-colors shadow-lg text-sm"
            >
              Start Shopping
            </button>
            <button
              onClick={onFarm}
              className="px-7 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-colors text-sm border border-white/30"
            >
              View Farms
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
)

/* ─── Main component ──────────────────────────────────────────── */
const ShopDashboard = () => {
  const navigate = useNavigate()
  const { crops, farms, loading, getAllCrops, getAllFarms } = useMarketStore()
  const [featuredCrops, setFeaturedCrops] = useState([])
  const [featuredFarms, setFeaturedFarms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    getAllCrops()
    getAllFarms()
  }, [])

  useEffect(() => {
    const filtered = searchTerm
      ? crops.filter(c =>
          c.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.farm_name?.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 6)
      : crops.slice(0, 6)
    setFeaturedCrops(filtered)
    setFeaturedFarms(farms.slice(0, 4))
  }, [crops, farms, searchTerm])

  const stats = [
    { label: 'Total Crops', value: crops.length, icon: <Sprout size={22} />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Farms', value: farms.length, icon: <MapPin size={22} />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Fresh Harvest', value: crops.filter(c => c.stock > 50).length, icon: <Leaf size={22} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Marquee */}
      <Marquee />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 px-6 pt-16 pb-20 overflow-hidden">
        {/* background decoration */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-green-100/50 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-100/60 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Sprout className="w-3.5 h-3.5" />
                Farm to Table Marketplace
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
                Fresh From <br />
                <span className="text-green-600">Local Farms</span>
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                Discover the finest crops grown by our community of farmers.
                Direct access to fresh, quality produce — no middlemen.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => navigate('/shop/products')}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-green-200 text-sm"
                >
                  Browse Marketplace <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/shop/farms')}
                  className="px-6 py-3 bg-white border border-gray-200 hover:border-green-300 text-gray-700 font-semibold rounded-xl flex items-center gap-2 transition-all text-sm"
                >
                  View All Farms <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* right – stat cards stacked */}
            <div className="grid grid-cols-1 gap-4">
              {stats.map((s, i) => (
                <StatCard key={i} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ── Search + Crops ───────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* header row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Crops</h2>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? `Results for "${searchTerm}"` : 'Latest harvest from our farms'}
              </p>
            </div>
            <button
              onClick={() => navigate('/shop/products')}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1 self-start md:self-auto"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {/* search */}
          <div className="relative max-w-lg mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops by name, variety, or farm..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border-2 border-gray-200 bg-white focus:border-green-500 focus:shadow-[0_0_0_4px_rgba(34,197,94,0.1)] outline-none text-sm text-gray-800 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
            </div>
          ) : featuredCrops.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <Sprout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No crops found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featuredCrops.map(crop => (
                <CropCard key={crop.crop_id} crop={crop} onClick={() => navigate('/shop/products')} variant="shop" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Featured Farms ───────────────────────────────────── */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Farms</h2>
              <p className="text-gray-500 text-sm mt-1">Meet the farmers behind your food</p>
            </div>
            <button
              onClick={() => navigate('/shop/farms')}
              className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {featuredFarms.map(farm => (
                <FarmCard
                  key={farm.farm_id}
                  farm={farm}
                  onClick={() => navigate(`/shop/farm/${farm.farm_id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      {/* ── CTA banner ───────────────────────────────────────── */}
      <CTABanner onShop={() => navigate('/shop/products')} onFarm={() =>navigate('/shop/farms')} />
    </div>
  )
}

export default ShopDashboard