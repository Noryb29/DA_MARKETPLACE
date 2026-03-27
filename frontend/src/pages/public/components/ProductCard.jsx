import React from 'react'

const ProductCard = ({ image, name, price, farmer, rating }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center text-5xl overflow-hidden">
        {image}
        <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">Fresh</span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-3">by {farmer}</p>
        <div className="text-sm text-gray-600 mb-4">
          {'⭐'.repeat(rating)} <span>({rating}/5)</span>
        </div>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-bold text-green-900">${price}</span>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold transition-colors">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
