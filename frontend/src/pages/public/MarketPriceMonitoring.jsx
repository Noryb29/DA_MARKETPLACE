import React, { useState } from "react"
import { useVegetableStore } from "../../store/VegetableStore.js"
import AddPriceRecordModal from "./components/AddPriceRecordModal.jsx"
import AddCommodityModal from "./components/AddCommodityModal"
import CommodityTable from "./components/CommoditiesTable.jsx"
import ImportExcelModal from './components/ImportExcelModal.jsx'
import ImportPDFModal from './components/ImportPDFModal.jsx'
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"

const PriceMonitoring = () => {
  const { vegetables, isLoading, error } = useVegetableStore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false)
  const [isExcelUploadOpen, setExcelUploadOpen] = useState(false)
  const [isPDFuploadOpen, setPDFUploadOpen] = useState(false)

  const [categoryFilter, setCategoryFilter] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div>
        <Header />
      </div>

      {/* Sidebar + content row */}
      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddRecord={() => setIsAddOpen(true)}
          onAddCommodity={() => setIsAddCommodityOpen(true)}
          onImportExcel={() => setExcelUploadOpen(true)}
          onImportPDF={() => setPDFUploadOpen(true)}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-base-100 p-6">
          <CommodityTable
            categoryFilter={categoryFilter}
            searchTerm={searchTerm}
          />
        </main>
      </div>

      {/*
        Modals — native <dialog> uses the browser top layer,
        no portal needed, renders above all stacking contexts.
      */}
      <AddPriceRecordModal
        isOpen={isAddOpen}
        OnClose={() => setIsAddOpen(false)}
      />
      <AddCommodityModal
        isOpen={isAddCommodityOpen}
        OnClose={() => setIsAddCommodityOpen(false)}
      />
      <ImportExcelModal
        isOpen={isExcelUploadOpen}
        OnClose={() => setExcelUploadOpen(false)}
      />
      <ImportPDFModal
        isOpen={isPDFuploadOpen}
        OnClose={() => setPDFUploadOpen(false)}
      />
    </div>
  )
}

export default PriceMonitoring