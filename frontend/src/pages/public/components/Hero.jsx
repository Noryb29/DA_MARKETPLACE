import React from 'react'
import { Link } from 'react-router-dom'
import useUserStore from '../../../store/UserStore'

const Hero = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated)
  const user = useUserStore((state) => state.user)
  return (
    <section className="bg-linear-to-r from-green-900 to-green-700 text-white py-24 px-8 text-center mb-8">
      <div className="hero-content">
        <h2 className="text-5xl font-bold mb-4">Fresh from Farm to Table</h2>
        <p className="text-xl mb-8 opacity-95">Discover authentic, organic produce directly from local farmers</p>
        
        {!isAuthenticated || (user?.role !== 'farmer' && user?.role !== 'admin' && user?.role !== 'user') ? (
          <Link to={"/shop/products"}><button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded transition-colors transform hover:-translate-y-0.5 hover:shadow-lg">Shop Now</button></Link>
        ) : (
          <>
          {user?.role === 'user' &&(
            <Link to={"/user/shop"}><button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded transition-colors transform hover:-translate-y-0.5 hover:shadow-lg">Shop Now</button></Link>
          )}
          {user?.role === 'farmer' &&(
            <Link to={"/farmer/dashboard/products"}><button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded transition-colors transform hover:-translate-y-0.5 hover:shadow-lg">See my Products</button></Link>
          )}
          </>
        )}


      </div>
    </section>
  )
}

export default Hero
