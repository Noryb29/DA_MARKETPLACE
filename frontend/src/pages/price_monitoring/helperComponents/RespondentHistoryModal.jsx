import { useState, useEffect } from "react"
import { useCropstore } from "../../../store/CropsStore"

const formatDate = (raw) => {
  if (!raw) return "—"
  const d = new Date(String(raw).slice(0, 10) + "T00:00:00")
  return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
}

const fmtPrice = (val) => val != null ? `₱${Number(val).toFixed(2)}` : null

const RespondentHistoryModal = ({ commodity, isOpen, onClose }) => {
  const { fetchCommodityPrices, commodityPrices } = useCropstore()
  const [loading, setLoading]         = useState(false)
  const [activeMarket, setActiveMarket] = useState(null)

  useEffect(() => {
    if (isOpen && commodity) {
      setLoading(true)
      fetchCommodityPrices(commodity.id).finally(() => setLoading(false))
    }
  }, [isOpen, commodity])

  useEffect(() => {
    if (!loading && commodityPrices.length > 0) {
      const mkts = [...new Set(commodityPrices.map((r) => r.market).filter(Boolean))].sort()
      if (!activeMarket || !mkts.includes(activeMarket)) setActiveMarket(mkts[0] ?? null)
    }
  }, [loading, commodityPrices])

  if (!isOpen || !commodity) return null

  const markets    = [...new Set(commodityPrices.map((r) => r.market).filter(Boolean))].sort()
  const marketRows = commodityPrices
    .filter((r) => r.market === activeMarket)
    .sort((a, b) => new Date(b.price_date) - new Date(a.price_date))

  const allValues = marketRows
    .flatMap((r) => [1,2,3,4,5].map((n) => r[`respondent_${n}`]).filter((v) => v != null).map(Number))
  const hasStats  = allValues.length > 0
  const statsMin  = hasStats ? Math.min(...allValues) : null
  const statsMax  = hasStats ? Math.max(...allValues) : null
  const statsAvg  = hasStats
    ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 100) / 100 : null
  const fillRate  = marketRows.length > 0
    ? Math.round((allValues.length / (marketRows.length * 5)) * 100) : 0

  const stats = [
    { label: "Records",  value: marketRows.length, icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
    { label: "Avg Price", value: statsAvg != null ? `₱${statsAvg}` : "—", icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.589-1.202L5.25 4.971z" /></svg> },
    { label: "Range",     value: statsMin != null ? `₱${statsMin} – ₱${statsMax}` : "—", icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg> },
    { label: "Fill Rate", value: `${fillRate}%`, icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg> },
  ]

  const PriceCell = ({ val, highlight }) => {
    if (val == null) return <span className="text-slate-300 font-mono text-xs">—</span>
    if (highlight) return (
      <span className="inline-block px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-semibold">
        {fmtPrice(val)}
      </span>
    )
    return <span className="text-slate-600 font-mono text-xs">{fmtPrice(val)}</span>
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .rhm-overlay { font-family: 'DM Sans', sans-serif; animation: rhm-fadein 0.15s ease; }
        .rhm-panel   { animation: rhm-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes rhm-fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes rhm-slidein { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:none } }
        .rhm-spin { animation: rhm-rotate 0.7s linear infinite; }
        @keyframes rhm-rotate  { to { transform:rotate(360deg) } }
      `}</style>

      <div
        className="rhm-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="rhm-panel bg-white rounded-2xl w-full flex flex-col overflow-hidden"
          style={{ maxWidth: 760, maxHeight: "88vh", boxShadow: "0 32px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#16a34a 0%,#15803d 100%)", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <div className="text-[1rem] font-semibold text-slate-900 leading-snug">{commodity.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{commodity.specification || "Respondent History"}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
              <div className="rhm-spin w-8 h-8 rounded-full border-2 border-slate-100 border-t-emerald-500" />
              <span className="text-sm">Loading records…</span>
            </div>
          ) : commodityPrices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-1">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-500">No price records found</span>
              <span className="text-xs text-slate-400">Records will appear here once prices are added.</span>
            </div>
          ) : (
            <>
              {/* Market tabs */}
              <div className="flex gap-0.5 px-6 pt-4 border-b border-slate-100 flex-shrink-0">
                {markets.map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMarket(m)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all cursor-pointer border-b-2 -mb-px
                      ${activeMarket === m
                        ? "border-emerald-500 text-emerald-700"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 flex-shrink-0">
                {stats.map(({ label, value, icon }) => (
                  <div key={label} className="px-5 py-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-slate-300">{icon}</span>
                      <span className="text-[0.625rem] uppercase tracking-widest font-semibold text-slate-400">{label}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 font-mono">{value}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-y-auto flex-1 min-h-0">
                {marketRows.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-sm text-slate-400">
                    No records for this market.
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-50 z-10">
                      <tr>
                        {["Date","R1","R2","R3","R4","R5","Prevailing","High","Low"].map((h, i) => (
                          <th key={h} className={`px-3 py-2.5 text-[0.625rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 whitespace-nowrap ${i === 0 ? "text-left" : "text-right"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {marketRows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2.5 text-slate-400 whitespace-nowrap">{formatDate(r.price_date)}</td>
                          {[1,2,3,4,5].map((n) => (
                            <td key={n} className="px-3 py-2.5 text-right">
                              <PriceCell val={r[`respondent_${n}`]} />
                            </td>
                          ))}
                          <td className="px-3 py-2.5 text-right"><PriceCell val={r.prevailing_price} highlight /></td>
                          <td className="px-3 py-2.5 text-right"><PriceCell val={r.high_price} /></td>
                          <td className="px-3 py-2.5 text-right"><PriceCell val={r.low_price} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end px-6 pt-3 pb-5 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default RespondentHistoryModal