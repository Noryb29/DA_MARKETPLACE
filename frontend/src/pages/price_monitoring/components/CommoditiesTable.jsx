import React, { useEffect, useState } from "react"
import { useCropstore } from "../../../store/CropsStore"
import Swal from "sweetalert2"
import EditCommodityModal from "../helperComponents/EditCommodityModal.jsx"
import PriceHistoryModal from "../helperComponents/PriceHistoryModal.jsx"
import RespondentHistoryModal from "../helperComponents/RespondentHistoryModal.jsx"
import AddPriceRecordModal from "./AddPriceRecordModal.jsx"

const fmt = (val) => val != null ? `₱${Number(val).toFixed(2)}` : null

const fmtDate = (dateStr) => {
  if (!dateStr) return "—"
  const [y, m, d] = String(dateStr).split("T")[0].split("-")
  return new Date(+y, +m - 1, +d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
}

// Count badge
const CountBadge = ({ count }) => {
  const n = Number(count ?? 0)
  if (n === 0) return <span className="text-[10px] text-slate-300 leading-none font-mono">0</span>
  return (
    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold leading-none">
      {n > 99 ? "99+" : n}
    </span>
  )
}

// Icon button
const ActionBtn = ({ onClick, title, children, danger }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer border
      ${danger
        ? "text-red-400 border-transparent hover:bg-red-50 hover:border-red-100 hover:text-red-500"
        : "text-slate-400 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-slate-600"
      }`}
  >
    {children}
  </button>
)

const CommodityTable = ({ search = "", categoryFilter = "" }) => {
  const {
    crops, categories,
    fetchCrops, fetchCategories,
    deleteCommodity, updateCommodity,
  } = useCropstore()

  const [editTarget,       setEditTarget]       = useState(null)
  const [historyTarget,    setHistoryTarget]    = useState(null)
  const [addPriceTarget,   setAddPriceTarget]   = useState(null)
  const [respondentTarget, setRespondentTarget] = useState(null)
  const [marketFilter,     setMarketFilter]     = useState("")

  useEffect(() => { fetchCrops(); fetchCategories() }, [])

  const allMarkets = [...new Set(crops.flatMap((v) => Object.keys(v.markets ?? {})))]
    .filter(Boolean).sort()

  useEffect(() => {
    if (allMarkets.length > 0 && !marketFilter) setMarketFilter(allMarkets[0])
  }, [allMarkets.join(",")])

  const filtered = crops.filter((v) => {
    const matchSearch = search ? v.name?.toLowerCase().includes(search.toLowerCase()) : true
    const matchCat    = categoryFilter ? v.categories?.toLowerCase() === categoryFilter.toLowerCase() : true
    return matchSearch && matchCat
  })

  const grouped = filtered.reduce((acc, v) => {
    const cat = v.categories || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(v)
    return acc
  }, {})

  const visibleMarkets = allMarkets.filter((m) => m === marketFilter)
  const colSpanTotal   = 4 + visibleMarkets.length * 3 + 1

  const handleDelete = async (commodity) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Commodity?",
      html: `<p>This will permanently delete <strong>${commodity.name}</strong> and all its price records.</p>`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancel",
    })
    if (result.isConfirmed) await deleteCommodity(commodity.id)
  }

  const handleSaveEdit = async (id, form) => {
    await updateCommodity(id, form)
    setEditTarget(null)
  }

  const handleAddPriceClose = () => {
    setAddPriceTarget(null)
    fetchCrops()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .ctbl-wrap { font-family: 'DM Sans', sans-serif; }
        .ctbl-mono { font-family: 'DM Mono', monospace; }
      `}</style>

      <div className="ctbl-wrap flex flex-col gap-3 w-full">

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            {filtered.length} commodit{filtered.length !== 1 ? "ies" : "y"}
          </span>
        </div>

        {/* Table card */}
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[0.8125rem]">

              <thead>
                {/* Row 1 */}
                <tr className="bg-slate-50">
                  <th rowSpan={2} className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 align-bottom whitespace-nowrap">Commodity</th>
                  <th rowSpan={2} className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 align-bottom whitespace-nowrap">Spec</th>
                  <th rowSpan={2} className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 align-bottom whitespace-nowrap">Category</th>
                  <th rowSpan={2} className="px-4 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 align-bottom whitespace-nowrap">Date</th>
                  <th
                    colSpan={Math.max(visibleMarkets.length * 3, 1)}
                    className="px-4 py-2 text-center border-b border-slate-200 border-l border-l-slate-200"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400">Market</span>
                      <div className="relative">
                        <select
                          className="appearance-none bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 pr-6 cursor-pointer max-w-[200px]"
                          value={marketFilter}
                          onChange={(e) => { if (e.target.value) setMarketFilter(e.target.value) }}
                        >
                          {allMarkets.length === 0
                            ? <option value="">No markets</option>
                            : allMarkets.map((m) => <option key={m} value={m}>{m}</option>)
                          }
                        </select>
                        <svg className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th rowSpan={2} className="px-4 py-3 text-center text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 align-bottom whitespace-nowrap">Actions</th>
                </tr>

                {/* Row 2 — sub-headers */}
                <tr className="bg-slate-50">
                  {visibleMarkets.length > 0 ? (
                    visibleMarkets.map((m) => (
                      <React.Fragment key={m}>
                        <th className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-slate-300 border-b border-slate-200 border-l border-l-slate-200 text-right">High</th>
                        <th className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-slate-300 border-b border-slate-200 text-right">Low</th>
                        <th className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-widest text-emerald-400 border-b border-slate-200 text-right">Prevailing</th>
                      </React.Fragment>
                    ))
                  ) : (
                    <th className="px-3 pb-2 text-[0.625rem] font-semibold text-slate-300 border-b border-slate-200 border-l border-l-slate-200 text-center italic">No market</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={colSpanTotal} className="text-center py-14">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-1">
                          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-slate-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-500">No Market Selected</span>
                        <span className="text-xs text-slate-400">Select a market from the dropdown above to view prices.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {Object.entries(grouped).map(([category, rows]) => (
                      <React.Fragment key={category}>
                        {/* Category header */}
                        <tr className="bg-emerald-50">
                          <td colSpan={colSpanTotal} className="px-4 py-2 text-[0.6875rem] font-bold uppercase tracking-widest text-emerald-700">
                            {category}
                          </td>
                        </tr>

                        {rows.map((veg) => (
                          <tr key={veg.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{veg.name}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{veg.specification || "—"}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-medium border border-slate-200 bg-slate-50 text-slate-500">
                                {veg.categories}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap ctbl-mono">{fmtDate(veg.price_date)}</td>

                            {visibleMarkets.map((m) => {
                              const prices = veg.markets?.[m]
                              return (
                                <React.Fragment key={m}>
                                  <td className="px-3 py-3 text-right border-l border-slate-100">
                                    {prices?.high != null
                                      ? <span className="ctbl-mono text-xs text-slate-600">{fmt(prices.high)}</span>
                                      : <span className="ctbl-mono text-xs text-slate-300">—</span>}
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    {prices?.low != null
                                      ? <span className="ctbl-mono text-xs text-slate-600">{fmt(prices.low)}</span>
                                      : <span className="ctbl-mono text-xs text-slate-300">—</span>}
                                  </td>
                                  <td className="px-3 py-3 text-right">
                                    {prices?.prevailing != null
                                      ? <span className="ctbl-mono text-xs font-semibold text-emerald-700">{fmt(prices.prevailing)}</span>
                                      : <span className="ctbl-mono text-xs text-slate-300">—</span>}
                                  </td>
                                </React.Fragment>
                              )
                            })}

                            {/* Actions */}
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                {/* Respondent history */}
                                <div className="flex flex-col items-center gap-0.5">
                                  <ActionBtn onClick={() => setRespondentTarget(veg)} title="Respondent History">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                  </ActionBtn>
                                  <CountBadge count={veg.respondent_count} />
                                </div>

                                {/* Price history */}
                                <div className="flex flex-col items-center gap-0.5">
                                  <ActionBtn onClick={() => setHistoryTarget(veg)} title="Price History">
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                                    </svg>
                                  </ActionBtn>
                                  <CountBadge count={veg.price_count} />
                                </div>

                                {/* Add price */}
                                <ActionBtn onClick={() => setAddPriceTarget(veg)} title="Add Price Record">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                  </svg>
                                </ActionBtn>

                                {/* Edit */}
                                <ActionBtn onClick={() => setEditTarget(veg)} title="Edit">
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                  </svg>
                                </ActionBtn>

                                {/* Delete */}
                                <ActionBtn onClick={() => handleDelete(veg)} title="Delete" danger>
                                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
                                </ActionBtn>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={colSpanTotal} className="text-center py-14">
                          <div className="flex flex-col items-center gap-1.5 text-slate-400">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-slate-300 mb-1">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                            </svg>
                            <span className="text-sm font-medium text-slate-500">No commodities found</span>
                            <span className="text-xs">Try adjusting your search or category filter.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <EditCommodityModal
          commodity={editTarget} categories={categories}
          isOpen={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveEdit}
        />
        <PriceHistoryModal
          commodity={historyTarget}
          isOpen={!!historyTarget} onClose={() => setHistoryTarget(null)}
        />
        <AddPriceRecordModal
          isOpen={!!addPriceTarget} defaultCommodity={addPriceTarget} OnClose={handleAddPriceClose}
        />
        <RespondentHistoryModal
          commodity={respondentTarget}
          isOpen={!!respondentTarget} onClose={() => setRespondentTarget(null)}
        />
      </div>
    </>
  )
}

export default CommodityTable