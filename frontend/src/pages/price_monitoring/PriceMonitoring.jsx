import React, { useState } from "react"
import { useCropstore } from "../../store/CropsStore.js"
import AddPriceRecordModal from "./components/AddPriceRecordModal.jsx"
import AddCommodityModal from "./components/AddCommodityModal"
import CommodityTable from "./components/CommoditiesTable.jsx"
import ImportExcelModal from './components/ImportExcelModal.jsx'
import ImportPDFModal from './components/ImportPDFModal.jsx'
import Header from "../public/components/Header.jsx"
import Sidebar from "../public/components/SideBar.jsx"

const PriceMonitoring = () => {
  const { vegetables, isLoading, error } = useCropstore()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAddCommodityOpen, setIsAddCommodityOpen] = useState(false)
  const [isExcelUploadOpen, setExcelUploadOpen] = useState(false)
  const [isPDFuploadOpen, setPDFUploadOpen] = useState(false)

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
          onAddRecord={() => setIsAddOpen(true)}
          onAddCommodity={() => setIsAddCommodityOpen(true)}
          onImportExcel={() => setExcelUploadOpen(true)}
          onImportPDF={() => setPDFUploadOpen(true)}
        />
        <main className="flex-1 p-6">
          <CommodityTable
            categoryFilter={categoryFilter}
            searchTerm={searchTerm}
          />
        </main>
      </div>

      {/* ✅ Modals are outside the flex layout */}
      <AddPriceRecordModal isOpen={isAddOpen} OnClose={() => setIsAddOpen(false)} />
      <AddCommodityModal isOpen={isAddCommodityOpen} OnClose={() => setIsAddCommodityOpen(false)} />
      <ImportExcelModal isOpen={isExcelUploadOpen} OnClose={() => setExcelUploadOpen(false)} />
      <ImportPDFModal isOpen={isPDFuploadOpen} OnClose={() => setPDFUploadOpen(false)} />
    </div>
  )
}

export default PriceMonitoring