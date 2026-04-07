import React, { useState } from "react"
import { useCropstore } from "../../store/CropsStore.js"
import CommodityTable from "./components/CommoditiesTable.jsx"
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"

const PriceMonitoring = () => {
  const { vegetables, isLoading, error } = useCropstore()
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
          <CommodityTable
            categoryFilter={categoryFilter}
            searchTerm={searchTerm}
          />
        </main>
      </div>
    </div>
  )
}

export default PriceMonitoring