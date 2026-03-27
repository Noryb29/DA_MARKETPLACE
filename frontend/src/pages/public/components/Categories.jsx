import React from 'react'

const Categories = () => {
  const categories = [
    { id: 1, name: 'Vegetables', emoji: '🥬', count: 24 },
    { id: 2, name: 'Fruits', emoji: '🍎', count: 18 },
    { id: 3, name: 'Dairy', emoji: '🥛', count: 12 },
    { id: 4, name: 'Grains', emoji: '🌾', count: 15 },
    { id: 5, name: 'Honey', emoji: '🍯', count: 8 },
    { id: 6, name: 'Eggs', emoji: '🥚', count: 10 }
  ]

  return (
    <section className="py-16 px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-green-900 text-center mb-12">Browse by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map(category => (
            <div 
              key={category.id} 
              className="bg-linear-to-br from-green-700 to-green-900 text-white p-8 rounded-lg text-center cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 shadow-md"
            >
              <span className="text-5xl block mb-4">{category.emoji}</span>
              <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
              <p className="opacity-90">{category.count} items</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories
