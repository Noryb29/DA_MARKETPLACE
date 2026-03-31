import { useState, useEffect } from "react"
import { useCropstore } from "../../../store/CropsStore"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

const MARKET_COLORS = [
  { border: "#16a34a", bg: "rgba(22,163,74,0.10)"   },
  { border: "#3b82f6", bg: "rgba(59,130,246,0.10)"  },
  { border: "#f97316", bg: "rgba(249,115,22,0.10)"  },
  { border: "#a855f7", bg: "rgba(168,85,247,0.10)"  },
  { border: "#ef4444", bg: "rgba(239,68,68,0.10)"   },
]
const getColor = (i) => MARKET_COLORS[i % MARKET_COLORS.length]

const PriceHistoryModal = ({ commodity, isOpen, onClose }) => {
  const { fetchCommodityPrices, commodityPrices } = useCropstore()
  const [loading, setLoading]     = useState(false)
  const [activeTab, setActiveTab] = useState("table")
  const [priceField, setPriceField] = useState("prevailing_price")

  useEffect(() => {
    if (isOpen && commodity) {
      setLoading(true)
      fetchCommodityPrices(commodity.id).finally(() => setLoading(false))
    }
  }, [isOpen, commodity])

  if (!isOpen || !commodity) return null

  const fmt = (val) => val != null ? `₱${Number(val).toFixed(2)}` : "—"
  const formatDate = (raw) => {
    if (!raw) return "—"
    const d = new Date(String(raw).slice(0, 10) + "T00:00:00")
    return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
  }

  const markets  = [...new Set(commodityPrices.map((r) => r.market).filter(Boolean))].sort()
  const allDates = [...new Set(commodityPrices.map((r) => new Date(r.price_date).toISOString().split("T")[0]))].sort()
  const dateLabels = allDates.map((d) => new Date(d + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" }))

  const marketDateMap = {}
  for (const r of commodityPrices) {
    const mkt  = r.market
    const date = new Date(r.price_date).toISOString().split("T")[0]
    if (!marketDateMap[mkt]) marketDateMap[mkt] = {}
    marketDateMap[mkt][date] = r
  }

  const lineData = {
    labels: dateLabels,
    datasets: markets.map((mkt, i) => {
      const color = getColor(i)
      return {
        label: mkt,
        data: allDates.map((d) => {
          const rec = marketDateMap[mkt]?.[d]
          return rec?.[priceField] != null ? Number(rec[priceField]) : null
        }),
        borderColor: color.border, backgroundColor: color.bg,
        borderWidth: 2.5, pointRadius: 4, pointHoverRadius: 6,
        pointBackgroundColor: color.border, tension: 0.35,
        fill: false, spanGaps: true,
      }
    }),
  }

  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top", labels: { boxWidth: 12, font: { size: 12, family: "DM Sans" } } },
      tooltip: { callbacks: { label: (ctx) => ctx.parsed.y != null ? `${ctx.dataset.label}: ₱${ctx.parsed.y.toFixed(2)}` : `${ctx.dataset.label}: —` } },
    },
    scales: {
      x: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11, family: "DM Sans" }, maxTicksLimit: 10, maxRotation: 30 } },
      y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11, family: "DM Sans" }, callback: (v) => `₱${v}` } },
    },
  }

  const marketAvgs = markets.map((mkt) => {
    const recs = commodityPrices.filter((r) => r.market === mkt && r.prevailing_price != null)
    if (!recs.length) return 0
    return Number((recs.reduce((a, r) => a + Number(r.prevailing_price), 0) / recs.length).toFixed(2))
  })

  const barData = {
    labels: markets,
    datasets: [{
      label: "Avg Prevailing Price",
      data: marketAvgs,
      backgroundColor: markets.map((_, i) => getColor(i).bg.replace("0.10", "0.75")),
      borderColor:     markets.map((_, i) => getColor(i).border),
      borderWidth: 1, borderRadius: 6, borderSkipped: false,
    }],
  }

  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `Avg: ₱${ctx.parsed.y.toFixed(2)}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11, family: "DM Sans" }, maxRotation: 30 } },
      y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { font: { size: 11, family: "DM Sans" }, callback: (v) => `₱${v}` } },
    },
  }

  const tabs = [
    { key: "table", icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75H3.375m15 3.75h-15" /></svg>, label: "Table" },
    { key: "line",  icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>, label: "Trend" },
    { key: "bar",   icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, label: "By Market" },
  ]

  const priceFields = [
    { key: "high_price",       label: "High"       },
    { key: "low_price",        label: "Low"        },
    { key: "prevailing_price", label: "Prevailing" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .phm-overlay { font-family: 'DM Sans', sans-serif; animation: phm-fadein 0.15s ease; }
        .phm-panel   { animation: phm-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes phm-fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes phm-slidein { from { opacity:0; transform:translateY(16px) scale(0.97) } to { opacity:1; transform:none } }
        .phm-spin { animation: phm-rotate 0.7s linear infinite; }
        @keyframes phm-rotate  { to { transform:rotate(360deg) } }
      `}</style>

      <div
        className="phm-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="phm-panel bg-white rounded-2xl w-full flex flex-col overflow-hidden"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <div className="text-[1rem] font-semibold text-slate-900 leading-snug">{commodity.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{commodity.specification || "Price History"}</div>
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

          {/* Tabs */}
          <div className="flex gap-0.5 px-6 pt-4 flex-shrink-0">
            {tabs.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border
                  ${activeTab === key
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-transparent text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600"
                  }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-auto px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
                <div className="phm-spin w-8 h-8 rounded-full border-2 border-slate-100 border-t-emerald-500" />
                <span className="text-sm">Loading records…</span>
              </div>
            ) : commodityPrices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-1">
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-slate-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500">No price records found</span>
                <span className="text-xs text-slate-400">Records will appear here once prices are added.</span>
              </div>
            ) : (
              <>
                {/* TABLE */}
                {activeTab === "table" && (
                  <div className="flex flex-col gap-5">
                    {markets.map((mkt) => {
                      const mktRows = commodityPrices
                        .filter((r) => r.market === mkt)
                        .sort((a, b) => new Date(b.price_date) - new Date(a.price_date))
                      return (
                        <div key={mkt}>
                          <div className="flex items-center gap-2 mb-2">
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                            </svg>
                            <span className="text-[0.6875rem] font-bold uppercase tracking-widest text-emerald-700">{mkt}</span>
                          </div>
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-[0.8125rem]">
                              <thead>
                                <tr className="bg-slate-50">
                                  {["Date", "High", "Low", "Prevailing"].map((h, i) => (
                                    <th key={h} className={`px-3 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 ${i === 0 ? "text-left" : "text-right"}`}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {mktRows.map((r, i) => (
                                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2.5 text-slate-400 text-xs">{formatDate(r.price_date)}</td>
                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-600">{fmt(r.high_price)}</td>
                                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-600">{fmt(r.low_price)}</td>
                                    <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold text-emerald-700">{fmt(r.prevailing_price)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* LINE CHART */}
                {activeTab === "line" && (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      {priceFields.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setPriceField(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border
                            ${priceField === key
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                      <span className="text-xs text-slate-300 ml-1">— one line per market</span>
                    </div>
                    <div style={{ position: "relative", height: 300 }}>
                      <Line data={lineData} options={lineOptions} />
                    </div>
                  </>
                )}

                {/* BAR CHART */}
                {activeTab === "bar" && (
                  <div style={{ position: "relative", height: 300 }}>
                    <Bar data={barData} options={barOptions} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 pt-2 pb-5 border-t border-slate-100 flex-shrink-0">
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

export default PriceHistoryModal