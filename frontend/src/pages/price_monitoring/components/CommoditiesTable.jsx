import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useCropstore } from "../../../store/CropsStore"
import Swal from "sweetalert2"
import EditCommodityModal from "../helperComponents/EditCommodityModal.jsx"
import PriceHistoryModal from "../helperComponents/PriceHistoryModal.jsx"
import RespondentHistoryModal from "../helperComponents/RespondentHistoryModal.jsx"
import AddPriceRecordModal from "./AddPriceRecordModal.jsx"

const fmt = (val) => (val != null ? `₱${Number(val).toFixed(2)}` : null)

const fmtDate = (dateStr) => {
  if (!dateStr) return "—"
  try {
    const [y, m, d] = String(dateStr).split("T")[0].split("-")
    return new Date(+y, +m - 1, +d).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

// Count badge component
const CountBadge = ({ count }) => {
  const n = Number(count ?? 0)
  if (n === 0) return <span className="text-[10px] text-slate-300 leading-none font-mono">0</span>
  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold leading-none">
      {n > 99 ? "99+" : n}
    </span>
  )
}

// Action button component
const ActionBtn = ({ onClick, title, children, danger, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border font-medium
      ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : danger
          ? "text-red-400 border-transparent hover:bg-red-50 hover:border-red-100 hover:text-red-600"
          : "text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-600"
      }`}
    aria-label={title}
  >
    {children}
  </button>
)

// FIX: Accept props from parent component
const CommodityTable = ({ crops = [], categories = [], markets = [], totalCount = 0 }) => {
  const {
    deleteCommodity,
    updateCommodity,
    fetchCrops,
  } = useCropstore()

  // Modal states
  const [editTarget, setEditTarget] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)
  const [addPriceTarget, setAddPriceTarget] = useState(null)
  const [respondentTarget, setRespondentTarget] = useState(null)

  // Filter and pagination states
  const [selectedMarket, setSelectedMarket] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteLoading, setDeleteLoading] = useState(null)
  const rowsPerPage = 10

  // Get all unique markets from crops
  const allMarkets = useMemo(
    () =>
      [...new Set(crops.flatMap((v) => Object.keys(v.markets ?? {})))]
        .filter(Boolean)
        .sort(),
    [crops]
  )

  // Initialize selected market
  useEffect(() => {
    if (allMarkets.length > 0 && !selectedMarket) {
      setSelectedMarket(allMarkets[0])
    }
  }, [allMarkets, selectedMarket])

  // Group crops by category
  const grouped = useMemo(() => {
    return crops.reduce((acc, v) => {
      const cat = v.categories || "Uncategorized"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(v)
      return acc
    }, {})
  }, [crops])

  // Flatten and paginate
  const flattenedRows = useMemo(
    () =>
      Object.entries(grouped).flatMap(([category, rows]) =>
        rows.map((row) => ({ ...row, category }))
      ),
    [grouped]
  )

  const totalPages = Math.ceil(flattenedRows.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedRows = useMemo(
    () => flattenedRows.slice(startIndex, endIndex),
    [flattenedRows, startIndex, endIndex]
  )

  const paginatedGrouped = useMemo(() => {
    return paginatedRows.reduce((acc, v) => {
      const cat = v.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(v)
      return acc
    }, {})
  }, [paginatedRows])

  // Reset page when crops change
  useEffect(() => {
    setCurrentPage(1)
  }, [crops])

  // Handlers
  const visibleMarkets = selectedMarket ? [selectedMarket] : []
  const colSpanTotal = 4 + visibleMarkets.length * 3 + 1

  const handleDelete = useCallback(
    async (commodity) => {
      const result = await Swal.fire({
        icon: "warning",
        title: "Delete Commodity?",
        html: `
          <p>This will permanently delete <strong>${commodity.name}</strong> and all its price records.</p>
          <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">This action cannot be undone.</p>
        `,
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
        confirmButtonColor: "#ef4444",
        cancelButtonText: "Cancel",
        preConfirm: () => {
          setDeleteLoading(commodity.id)
        },
      })

      if (result.isConfirmed) {
        try {
          await deleteCommodity(commodity.id)
          setDeleteLoading(null)
          await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: `${commodity.name} has been deleted.`,
            confirmButtonColor: "#15803d",
          })
          await fetchCrops()
        } catch (error) {
          setDeleteLoading(null)
          await Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: error?.message || "Failed to delete commodity. Please try again.",
            confirmButtonColor: "#dc2626",
          })
        }
      }
    },
    [deleteCommodity, fetchCrops]
  )

  const handleSaveEdit = useCallback(
    async (id, form) => {
      try {
        await updateCommodity(id, form)
        setEditTarget(null)
        await fetchCrops()
      } catch (error) {
        await Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: error?.message || "Failed to update commodity. Please try again.",
          confirmButtonColor: "#dc2626",
        })
      }
    },
    [updateCommodity, fetchCrops]
  )

  const handleAddPriceClose = useCallback(async () => {
    setAddPriceTarget(null)
    try {
      await fetchCrops()
    } catch (error) {
      console.error("Failed to refresh data:", error)
    }
  }, [fetchCrops])

  // Empty state
  if (crops.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12">
        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
          <svg
            width="32"
            height="32"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-slate-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
            />
          </svg>
          <div className="text-center">
            <p className="font-semibold text-slate-600">No commodities found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add your first commodity.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .ctbl-wrap { font-family: 'DM Sans', sans-serif; }
        .ctbl-mono { font-family: 'DM Mono', monospace; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .ctbl-fade-in { animation: fadeIn 0.2s ease-in; }
      `}</style>

      <div className="ctbl-wrap flex flex-col gap-4 w-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500 font-medium">
            {crops.length} commodit{crops.length !== 1 ? "ies" : "y"}
            {crops.length > 0 && (
              <span className="text-slate-400 ml-3">
                (showing {startIndex + 1}–{Math.min(endIndex, crops.length)} per page)
              </span>
            )}
          </span>
          <div className="text-xs text-slate-400">
            Page {currentPage} of {totalPages || 1}
          </div>
        </div>

        {/* Table */}
        <div
          className="ctbl-fade-in rounded-xl border border-slate-200 overflow-hidden bg-white"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8125rem]">
              <thead>
                {/* Header Row 1 */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600 align-bottom whitespace-nowrap"
                  >
                    Commodity
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600 align-bottom whitespace-nowrap"
                  >
                    Spec
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600 align-bottom whitespace-nowrap"
                  >
                    Category
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600 align-bottom whitespace-nowrap"
                  >
                    Last Updated
                  </th>
                  <th
                    colSpan={Math.max(visibleMarkets.length * 3, 1)}
                    className="px-4 py-2.5 text-center border-l border-slate-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600">
                        Market
                      </span>
                      {allMarkets.length > 1 && (
                        <div className="relative">
                          <select
                            className="appearance-none bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                            value={selectedMarket}
                            onChange={(e) => {
                              if (e.target.value) setSelectedMarket(e.target.value)
                            }}
                          >
                            {allMarkets.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </th>
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-center text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-600 align-bottom whitespace-nowrap border-l border-slate-200"
                  >
                    Actions
                  </th>
                </tr>

                {/* Header Row 2 — Price columns */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  {visibleMarkets.length > 0 ? (
                    visibleMarkets.map((m) => (
                      <React.Fragment key={m}>
                        <th className="px-3 py-2 text-[0.625rem] font-semibold uppercase tracking-widest text-slate-500 border-l border-slate-200 text-right">
                          High
                        </th>
                        <th className="px-3 py-2 text-[0.625rem] font-semibold uppercase tracking-widest text-slate-500 text-right">
                          Low
                        </th>
                        <th className="px-3 py-2 text-[0.625rem] font-semibold uppercase tracking-widest text-emerald-600 text-right">
                          Prevailing
                        </th>
                      </React.Fragment>
                    ))
                  ) : (
                    <th className="px-3 py-2 text-[0.625rem] font-semibold text-slate-400 border-l border-slate-200 text-center italic">
                      Select a market
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={colSpanTotal} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <svg
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          className="text-slate-300"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                          />
                        </svg>
                        <span className="text-sm font-medium text-slate-500">
                          Select a market
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  Object.entries(paginatedGrouped).map(([category, rows]) => (
                    <React.Fragment key={category}>
                      {/* Category Header */}
                      <tr className="bg-emerald-50">
                        <td
                          colSpan={colSpanTotal}
                          className="px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-widest text-emerald-700"
                        >
                          {category}
                        </td>
                      </tr>

                      {/* Commodity Rows */}
                      {rows.map((veg) => (
                        <tr
                          key={veg.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                        >
                          {/* Commodity Name */}
                          <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                            {veg.name}
                          </td>

                          {/* Specification */}
                          <td className="px-4 py-3 text-slate-500 text-xs">
                            {veg.specification || "—"}
                          </td>

                          {/* Category Badge */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border border-slate-200 bg-slate-50 text-slate-600">
                              {veg.categories}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap ctbl-mono">
                            {fmtDate(veg.price_date)}
                          </td>

                          {/* Price Columns */}
                          {visibleMarkets.map((m) => {
                            const prices = veg.markets?.[m]
                            return (
                              <React.Fragment key={m}>
                                <td className="px-3 py-3 text-right border-l border-slate-100">
                                  {prices?.high != null ? (
                                    <span className="ctbl-mono text-xs text-slate-700 font-medium">
                                      {fmt(prices.high)}
                                    </span>
                                  ) : (
                                    <span className="ctbl-mono text-xs text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-right">
                                  {prices?.low != null ? (
                                    <span className="ctbl-mono text-xs text-slate-700 font-medium">
                                      {fmt(prices.low)}
                                    </span>
                                  ) : (
                                    <span className="ctbl-mono text-xs text-slate-300">—</span>
                                  )}
                                </td>
                                <td className="px-3 py-3 text-right">
                                  {prices?.prevailing != null ? (
                                    <span className="ctbl-mono text-xs font-bold text-emerald-700">
                                      {fmt(prices.prevailing)}
                                    </span>
                                  ) : (
                                    <span className="ctbl-mono text-xs text-slate-300">—</span>
                                  )}
                                </td>
                              </React.Fragment>
                            )
                          })}

                          {/* Actions */}
                          <td className="px-4 py-3 border-l border-slate-100">
                            <div className="flex items-center justify-center gap-1">
                              {/* Respondent History */}
                              <div className="flex flex-col items-center gap-1">
                                <ActionBtn
                                  onClick={() => setRespondentTarget(veg)}
                                  title="View respondent history"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                                    />
                                  </svg>
                                </ActionBtn>
                                <CountBadge count={veg.respondent_count} />
                              </div>

                              {/* Price History */}
                              <div className="flex flex-col items-center gap-1">
                                <ActionBtn
                                  onClick={() => setHistoryTarget(veg)}
                                  title="View price history"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                                    />
                                  </svg>
                                </ActionBtn>
                                <CountBadge count={veg.price_count} />
                              </div>

                              {/* Add Price */}
                              <ActionBtn
                                onClick={() => setAddPriceTarget(veg)}
                                title="Add price record"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 4.5v15m7.5-7.5h-15"
                                  />
                                </svg>
                              </ActionBtn>

                              {/* Edit */}
                              <ActionBtn
                                onClick={() => setEditTarget(veg)}
                                title="Edit commodity"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                                  />
                                </svg>
                              </ActionBtn>

                              {/* Delete */}
                              <ActionBtn
                                onClick={() => handleDelete(veg)}
                                title="Delete commodity"
                                danger
                                disabled={deleteLoading === veg.id}
                              >
                                {deleteLoading === veg.id ? (
                                  <svg
                                    className="animate-spin"
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      fill="none"
                                      opacity="0.25"
                                    />
                                    <path
                                      d="M12 2a10 10 0 0110 10"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      fill="none"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                    />
                                  </svg>
                                )}
                              </ActionBtn>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {crops.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                aria-label="Previous page"
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                aria-label="Next page"
              >
                Next
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <EditCommodityModal
        commodity={editTarget}
        categories={categories}
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSaveEdit}
      />
      <PriceHistoryModal
        commodity={historyTarget}
        isOpen={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
      <AddPriceRecordModal
        isOpen={!!addPriceTarget}
        defaultCommodity={addPriceTarget}
        onClose={handleAddPriceClose}
      />
      <RespondentHistoryModal
        commodity={respondentTarget}
        isOpen={!!respondentTarget}
        onClose={() => setRespondentTarget(null)}
      />
    </>
  )
}

export default CommodityTable