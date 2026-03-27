import React from 'react'

const Hero = () => {
  return (
    <section className="bg-linear-to-r from-green-900 to-green-700 text-white py-24 px-8 text-center mb-8">
      <div className="hero-content">
        <h2 className="text-5xl font-bold mb-4">Fresh from Farm to Table</h2>
        <p className="text-xl mb-8 opacity-95">Discover authentic, organic produce directly from local farmers</p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded transition-colors transform hover:-translate-y-0.5 hover:shadow-lg">
          Shop Now
        </button>
      </div>
    </section>
  )
}

export default Hero
