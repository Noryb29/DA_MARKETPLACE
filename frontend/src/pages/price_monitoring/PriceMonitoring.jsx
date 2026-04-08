import React, { useState, useEffect } from "react"
import { useAdminPriceStore } from "../../store/AdminPriceStore.js"
import CommodityTable from "./components/CommoditiesTable.jsx"
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"

const PriceMonitoring = () => {
  const { isLoading, error } = useAdminPriceStore()
  const [categoryFilter, setCategoryFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex" style={{ minHeight: 'calc(100vh - 65px)' }}>
        <Sidebar
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Price Monitoring</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search commodities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-green-500"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-green-500"
              >
                <option value="">All Categories</option>
                <option value="LOWLAND VEGETABLES">Lowland Vegetables</option>
                <option value="HIGHLAND VEGETABLES">Highland Vegetables</option>
                <option value="FRUITS">Fruits</option>
                <option value="FISH">Fish</option>
                <option value="LIVESTOCK & POULTRY PRODUCTS">Livestock & Poultry</option>
                <option value="SPICES">Spices</option>
                <option value="ROOTCROPS">Rootcrops</option>
                <option value="CORN">Corn</option>
                <option value="LOCAL COMMERCIAL RICE">Local Commercial Rice</option>
                <option value="IMPORTED COMMERCIAL RICE">Imported Commercial Rice</option>
                <option value="OTHER BASIC COMMODITIES">Other Basic Commodities</option>
              </select>
            </div>
          </div>
          <CommodityTable
            search={searchTerm}
            categoryFilter={categoryFilter}
          />
        </main>
      </div>
    </div>
  )
}

export default PriceMonitoring