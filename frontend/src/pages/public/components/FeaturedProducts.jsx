import React from 'react'
import ProductCard from './ProductCard'

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      image: '🥕',
      name: 'Organic Carrots',
      price: 3.99,
      farmer: 'John\'s Farm',
      rating: 5
    },
    {
      id: 2,
      image: '🥬',
      name: 'Fresh Lettuce',
      price: 2.49,
      farmer: 'Green Valley Farm',
      rating: 4
    },
    {
      id: 3,
      image: '🍅',
      name: 'Ripe Tomatoes',
      price: 4.99,
      farmer: 'Sunny Patch Farm',
      rating: 5
    },
    {
      id: 4,
      image: '🧅',
      name: 'Sweet Onions',
      price: 1.99,
      farmer: 'Valley Farms',
      rating: 4
    },
    {
      id: 5,
      image: '🥒',
      name: 'Pickled Cucumbers',
      price: 3.49,
      farmer: 'Harvest Moon Farm',
      rating: 5
    },
    {
      id: 6,
      image: '🌽',
      name: 'Sweet Corn',
      price: 2.99,
      farmer: 'Corn Country Farm',
      rating: 4
    }
  ]

  return (
    <section className="py-16 px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-green-900 text-center mb-2">Featured Products</h2>
        <p className="text-center text-gray-600 text-lg mb-12">Handpicked fresh produce from local farmers</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <ProductCard
              key={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
              farmer={product.farmer}
              rating={product.rating}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedProducts
