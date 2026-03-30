import React from 'react'
import { ChevronDown, X } from 'lucide-react'

const MarketFilterPanel = ({ varieties, filterVariety, setFilterVariety, filterHarvest, setFilterHarvest, activeFilterCount, clearFilters }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">

        {/* Variety filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Variety</label>
          <div className="relative">
            <select
              value={filterVariety}
              onChange={(e) => setFilterVariety(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border-2 border-gray-200
                focus:border-green-500 outline-none text-sm text-gray-700 font-medium bg-white transition-all"
            >
              <option value="">All varieties</option>
              {varieties.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Harvest window filter */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest">Harvest Window</label>
          <div className="relative">
            <select
              value={filterHarvest}
              onChange={(e) => setFilterHarvest(e.target.value)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border-2 border-gray-200
                focus:border-green-500 outline-none text-sm text-gray-700 font-medium bg-white transition-all"
            >
              <option value="">Any time</option>
              <option value="week">Within 7 days</option>
              <option value="month">Within 30 days</option>
              <option value="harvested">Already harvested</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" /> Clear all filters
        </button>
      )}
    </div>
  )
}

export default MarketFilterPanel