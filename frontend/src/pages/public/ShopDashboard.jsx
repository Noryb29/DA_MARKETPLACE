import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/SideBar'
import useMarketStore from '../../store/MarketStore'
import { 
  Sprout, MapPin, TrendingUp, Users, ArrowRight, 
  Leaf, Droplets, Sun, Search, ChevronRight, Star
} from 'lucide-react'

const ShopDashboard = () => {
  const navigate = useNavigate()
  const { crops, farms, loading, getAllCrops, getAllFarms } = useMarketStore()
  const [featuredCrops, setFeaturedCrops] = useState([])
  const [featuredFarms, setFeaturedFarms] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    getAllCrops()
    getAllFarms()
  }, [])

  useEffect(() => {
    // Get featured crops (first 6)
    setFeaturedCrops(crops.slice(0, 6))
    // Get featured farms (first 4)
    setFeaturedFarms(farms.slice(0, 4))
  }, [crops, farms])

  const stats = [
    { label: 'Total Crops', value: crops.length, icon: <Sprout size={24} />, color: 'text-green-600' },
    { label: 'Active Farms', value: farms.length, icon: <MapPin size={24} />, color: 'text-blue-600' },
    { label: 'Fresh Harvest', value: crops.filter(c => c.stock > 50).length, icon: <Leaf size={24} />, color: 'text-emerald-600' },
  ]

  const handleCropClick = (crop) => {
    navigate(`/shop/crop/${crop.crop_id}`)
  }

  const handleFarmClick = (farm) => {
    navigate(`/shop/farm/${farm.farm_id}`)
  }

  return (
    <div className='min-h-screen bg-white'>
      <Header />

      <main className='overflow-auto'>
        {/* Hero Section */}
        <section className='relative bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-6 py-20'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              {/* Left Content */}
              <div className='space-y-6'>
                <div className='space-y-3'>
                  <div className='inline-block'>
                    <span className='px-4 py-2 bg-green-100 text-green-700 text-sm font-semibold rounded-full'>
                      🌱 Farm to Table Marketplace
                    </span>
                  </div>
                  <h1 className='text-5xl lg:text-6xl font-bold text-gray-900'>
                    Fresh From Local Farms
                  </h1>
                  <p className='text-xl text-gray-600'>
                    Discover the finest crops grown by our community of farmers. Direct access to fresh, quality produce.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                  <button
                    onClick={() => navigate('/marketplace')}
                    className='px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors'
                  >
                    Browse Marketplace <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => document.getElementById('crops-section').scrollIntoView({ behavior: 'smooth' })}
                    className='px-8 py-3 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-lg font-semibold transition-colors'
                  >
                    View Featured Crops
                  </button>
                </div>
              </div>

              {/* Right - Hero Image/Illustration */}
              <div className='relative h-80 lg:h-96'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-300 to-blue-300 rounded-3xl opacity-20'></div>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <Sprout size={120} className='text-emerald-600 mx-auto mb-4 opacity-80' />
                    <p className='text-xl text-gray-600 font-semibold'>Sustainable Agriculture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='bg-white px-6 py-12 border-b border-gray-200'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {stats.map((stat, idx) => (
                <div key={idx} className='flex items-start gap-4'>
                  <div className={`p-3 bg-gray-100 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className='text-gray-600 text-sm font-medium'>{stat.label}</p>
                    <p className='text-4xl font-bold text-gray-900'>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className='bg-gray-50 px-6 py-12'>
          <div className='max-w-2xl mx-auto'>
            <h2 className='text-2xl font-bold text-gray-900 text-center mb-6'>Find Your Favorite Crops</h2>
            <div className='relative'>
              <Search className='absolute left-4 top-4 text-gray-400' size={20} />
              <input
                type='text'
                placeholder='Search crops by name, farm, or variety...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-12 pr-6 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 text-gray-900'
              />
            </div>
          </div>
        </section>

        {/* Featured Crops Section */}
        <section id='crops-section' className='px-6 py-16'>
          <div className='max-w-6xl mx-auto'>
            <div className='flex items-center justify-between mb-12'>
              <div>
                <h2 className='text-3xl font-bold text-gray-900'>Featured Crops</h2>
                <p className='text-gray-600 mt-2'>Explore our latest harvest</p>
              </div>
              <button
                onClick={() => navigate('/marketplace')}
                className='text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2'
              >
                View All <ChevronRight size={20} />
              </button>
            </div>

            {loading ? (
              <div className='flex justify-center py-12'>
                <div className='animate-spin'>
                  <div className='w-12 h-12 border-4 border-gray-300 border-t-emerald-600 rounded-full'></div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {featuredCrops.map((crop) => (
                  <div
                    key={crop.crop_id}
                    onClick={() => handleCropClick(crop)}
                    className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group'
                  >
                    {/* Crop Image Placeholder */}
                    <div className='h-40 bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:from-emerald-200 group-hover:to-green-200 transition-colors'>
                      <Leaf size={48} className='text-emerald-600 opacity-60' />
                    </div>

                    {/* Crop Info */}
                    <div className='p-5'>
                      <h3 className='font-bold text-gray-900 text-lg mb-1'>{crop.crop_name}</h3>
                      <p className='text-sm text-gray-600 mb-4'>{crop.variety}</p>

                      <div className='space-y-2 mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                          <MapPin size={16} className='text-gray-500' />
                          <span>{crop.farm_name}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                          <Droplets size={16} className='text-blue-500' />
                          <span>Stock: {crop.stock} units</span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className='flex items-center gap-2'>
                        <div className='flex-1 h-2 bg-gray-200 rounded-full overflow-hidden'>
                          <div
                            className='h-full bg-emerald-600 transition-all'
                            style={{ width: `${Math.min(crop.stock / 5, 100)}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-semibold ${crop.stock > 50 ? 'text-green-600' : crop.stock > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {crop.stock > 50 ? 'Abundant' : crop.stock > 10 ? 'Limited' : 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Farms Section */}
        <section className='bg-gray-50 px-6 py-16'>
          <div className='max-w-6xl mx-auto'>
            <div className='flex items-center justify-between mb-12'>
              <div>
                <h2 className='text-3xl font-bold text-gray-900'>Featured Farms</h2>
                <p className='text-gray-600 mt-2'>Meet the farmers behind your food</p>
              </div>
              <button
                onClick={() => navigate('/farms')}
                className='text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2'
              >
                View All <ChevronRight size={20} />
              </button>
            </div>

            {loading ? (
              <div className='flex justify-center py-12'>
                <div className='animate-spin'>
                  <div className='w-12 h-12 border-4 border-gray-300 border-t-emerald-600 rounded-full'></div>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {featuredFarms.map((farm) => (
                  <div
                    key={farm.farm_id}
                    onClick={() => handleFarmClick(farm)}
                    className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group'
                  >
                    {/* Farm Image Placeholder */}
                    <div className='h-32 bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-emerald-200 transition-colors relative'>
                      <Sun size={40} className='text-blue-600 opacity-60' />
                      <div className='absolute top-2 right-2 bg-white rounded-full p-2'>
                        <Star size={16} className='text-yellow-400 fill-yellow-400' />
                      </div>
                    </div>

                    {/* Farm Info */}
                    <div className='p-5'>
                      <h3 className='font-bold text-gray-900 text-lg mb-2'>{farm.farm_name}</h3>
                      
                      <div className='space-y-2 mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                          <MapPin size={16} className='text-gray-500 flex-shrink-0' />
                          <span className='line-clamp-1'>{farm.gps_coordinates || 'Location not set'}</span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                          <Leaf size={16} className='text-green-600 flex-shrink-0' />
                          <span>{farm.farm_area || 0} hectares</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFarmClick(farm)
                        }}
                        className='w-full py-2 text-sm font-semibold text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors'
                      >
                        View Farm
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className='bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-16'>
          <div className='max-w-4xl mx-auto text-center text-white'>
            <h2 className='text-4xl font-bold mb-4'>Ready to Get Fresh Produce?</h2>
            <p className='text-lg mb-8 opacity-90'>
              Connect directly with local farmers and get the freshest crops delivered to you.
            </p>
            <button
              onClick={() => navigate('/marketplace')}
              className='px-8 py-3 bg-white text-emerald-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors'
            >
              Start Shopping Now
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className='px-6 py-16'>
          <div className='max-w-6xl mx-auto'>
            <h2 className='text-3xl font-bold text-gray-900 text-center mb-12'>Why Choose Us</h2>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                { icon: <Sprout size={32} />, title: 'Fresh & Local', desc: 'Directly from local farms to your table' },
                { icon: <Users size={32} />, title: 'Support Farmers', desc: 'Help sustain local agriculture' },
                { icon: <TrendingUp size={32} />, title: 'Best Quality', desc: 'Premium crops with guaranteed freshness' },
              ].map((feature, idx) => (
                <div key={idx} className='text-center'>
                  <div className='flex justify-center mb-4 text-emerald-600'>
                    {feature.icon}
                  </div>
                  <h3 className='text-xl font-bold text-gray-900 mb-2'>{feature.title}</h3>
                  <p className='text-gray-600'>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-gray-900 text-white px-6 py-12'>
          <div className='max-w-6xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
              <div>
                <h4 className='font-bold mb-4'>FarmHub</h4>
                <p className='text-gray-400'>Connecting farmers with consumers</p>
              </div>
              <div>
                <h4 className='font-bold mb-4'>Quick Links</h4>
                <ul className='space-y-2 text-gray-400'>
                  <li><button onClick={() => navigate('/marketplace')} className='hover:text-white'>Marketplace</button></li>
                  <li><button onClick={() => navigate('/farms')} className='hover:text-white'>Farms</button></li>
                  <li><button className='hover:text-white'>About Us</button></li>
                </ul>
              </div>
              <div>
                <h4 className='font-bold mb-4'>Support</h4>
                <ul className='space-y-2 text-gray-400'>
                  <li><button className='hover:text-white'>Help Center</button></li>
                  <li><button className='hover:text-white'>Contact</button></li>
                  <li><button className='hover:text-white'>FAQ</button></li>
                </ul>
              </div>
              <div>
                <h4 className='font-bold mb-4'>Legal</h4>
                <ul className='space-y-2 text-gray-400'>
                  <li><button className='hover:text-white'>Privacy</button></li>
                  <li><button className='hover:text-white'>Terms</button></li>
                </ul>
              </div>
            </div>
            <div className='border-t border-gray-800 pt-8 text-center text-gray-400'>
              <p>&copy; 2024 FarmHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default ShopDashboard