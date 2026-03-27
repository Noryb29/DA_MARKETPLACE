import React from 'react'
import Header from './pages/public/components/Header'
import Hero from './pages/public/components/Hero'
import Categories from './pages/public/components/Categories'
import FeaturedProducts from './pages/public/components/FeaturedProducts'
import Footer from './pages/public/components/Footer'

const App = () => {
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

export default App
