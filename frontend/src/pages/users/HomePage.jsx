import React from 'react'
import Header from './Header'
import Hero from './Hero'
import Categories from './Categories'
import FeaturedProducts from './FeaturedProducts'
import Footer from './Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Footer />
    </div>
  )
}

export default HomePage
