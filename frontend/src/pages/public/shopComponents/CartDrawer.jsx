import React from 'react'
import useCartStore from '../../../store/CartStore'
import { X, ShoppingCart, Trash2, Plus, Minus, Wheat, PackageOpen } from 'lucide-react'
import useOrderStore from '../../../store/OrderStore'
import useUserStore from '../../../store/UserStore'

const CartDrawer = () => {
  const { placeOrder, loading } = useOrderStore()
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart } = useCartStore()
  const { user } = useUserStore()

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalVolume = items.reduce((sum, i) => sum + (Number(i.crop.volume) || 0) * i.quantity, 0)

  const handleCheckout = async () => {
  const orderItems = items.map(({ crop, quantity }) => ({
    crop_id:          crop.crop_id,
    quantity,
    volume:           (Number(crop.volume) || 0) * quantity,
    farmer_id:        crop.farmer_id,   // must be in your getAllCrops JOIN
    farm_id:          crop.farm_id,
    expected_arrival: crop.expected_harvest || null,
  }))

  const success = await placeOrder(orderItems)
  if (success) {
    clearCart()
    closeCart()
  }
}

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl
          flex flex-col transition-transform duration-300 ease-in-out mt-15
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400 shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h2 className="font-bold text-gray-900">My Cart</h2>
            {totalItems > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
            <div className="bg-gray-100 p-5 rounded-full">
              <PackageOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="font-semibold text-gray-500">Your cart is empty</p>
            <p className="text-xs text-gray-400">Add crops from the marketplace to get started.</p>
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map(({ crop, quantity }) => (
              <div
                key={crop.crop_id}
                className="bg-gray-50 rounded-2xl p-4 border border-gray-200"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-xl shrink-0">
                      <Wheat className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm leading-tight">{crop.crop_name}</p>
                      <p className="text-xs text-gray-400">{crop.variety || 'No variety'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{crop.farm_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(crop.crop_id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(crop.crop_id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(crop.crop_id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-green-50 hover:text-green-600 transition-colors text-gray-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {crop.volume && (
                    <span className="text-xs text-gray-400 font-medium">
                      {(Number(crop.volume) * quantity).toLocaleString()} kg total
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3 shrink-0">
            {/* Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 font-medium">Total items</span>
              <span className="font-bold text-gray-800">{totalItems}</span>
            </div>
            {totalVolume > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">Est. volume</span>
                <span className="font-bold text-gray-800">{totalVolume.toLocaleString()} kg</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-200 pt-3 space-y-2">
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
                  hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold
                  active:scale-[0.98] transition-all shadow-md shadow-green-200
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Placing Order...
                  </span>
                ) : 'Confirm & Place Order'}
              </button>
              <button
                onClick={clearCart}
                className="w-full py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold
                  text-gray-500 hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-all"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
        
      </div>
    </>
  )
}

export default CartDrawer