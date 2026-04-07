import React from 'react'
import { X, Sprout, Package, Calendar, FileText, AlertCircle } from 'lucide-react'

const ProductDetailModal = ({ isOpen, product, onClose }) => {
  if (!isOpen || !product) return null

  const getStockStatus = (stock) => {
    if (stock === 0) return { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Out of Stock' }
    if (stock < 10) return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Low Stock' }
    return { color: 'text-green-600', bgColor: 'bg-green-50', label: 'In Stock' }
  }

  const stockStatus = getStockStatus(product.stock)
  const daysUntilHarvest = Math.ceil(
    (new Date(product.expected_harvest) - new Date()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{product.crop_name}</h2>
            <p className="text-sm text-gray-500">{product.variety}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stock Status Alert */}
          {product.stock < 20 && (
            <div className={`p-4 rounded-lg border flex items-start gap-3 ${stockStatus.bgColor} border-opacity-30`}>
              <AlertCircle size={20} className={`flex-shrink-0 mt-0.5 ${stockStatus.color}`} />
              <div>
                <p className={`font-semibold ${stockStatus.color}`}>{stockStatus.label}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {product.stock === 0
                    ? 'This product is currently out of stock'
                    : `Only ${product.stock} units remaining in inventory`}
                </p>
              </div>
            </div>
          )}

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Crop Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sprout size={20} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Crop Details</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Crop Name</p>
                  <p className="text-gray-900 font-medium mt-1">{product.crop_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Variety</p>
                  <p className="text-gray-900 font-medium mt-1">{product.variety}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farm</p>
                  <p className="text-gray-900 font-medium mt-1">{product.farm_name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer</p>
                  <p className="text-gray-900 font-medium mt-1">
                    {product.firstname} {product.lastname}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory Information */}
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package size={20} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Inventory</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{product.volume}</p>
                  <p className="text-xs text-gray-500">units</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Stock</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-2xl font-bold ${stockStatus.color}`}>{product.stock}</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                      {stockStatus.label}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">{product.volume - product.stock}</span> units sold
                  </p>
                </div>
              </div>
            </div>
          </div>

           {/* Specifications */}
          {(product.specification_1 || product.specification_2 || product.specification_3 || product.specification_4 || product.specification_5) && (
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Specifications</h3>
              </div>
              <ul className="space-y-2">
                {product.specification_1 && (
                  <li className="flex gap-3 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{product.specification_1}</span>
                  </li>
                )}
                {product.specification_2 && (
                  <li className="flex gap-3 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{product.specification_2}</span>
                  </li>
                )}
                {product.specification_3 && (
                  <li className="flex gap-3 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{product.specification_3}</span>
                  </li>
                )}
                {product.specification_4 && (
                  <li className="flex gap-3 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{product.specification_4}</span>
                  </li>
                )}
                {product.specification_5 && (
                  <li className="flex gap-3 text-sm text-gray-700">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span>{product.specification_5}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Timeline Information */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">Timeline</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Planting Date</p>
                <p className="text-gray-900 font-medium mt-2">
                  {new Date(product.planting_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expected Harvest</p>
                <p className="text-gray-900 font-medium mt-2">
                  {new Date(product.expected_harvest).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {daysUntilHarvest > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">{daysUntilHarvest}</span> days until harvest
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Close
            </button>
            <button
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal