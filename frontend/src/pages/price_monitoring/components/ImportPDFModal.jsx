import React, { useRef, useState, useEffect } from "react"
import Swal from "sweetalert2"
import { useAdminPriceStore } from "../../../store/AdminPriceStore"
import extractPDF from "../../../utils/extractPDF"

// ─── Sub-components ───────────────────────────────────────────────────────────

const Pill = ({ color, children }) => {
  const colors = {
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    yellow: "bg-amber-50  text-amber-700  border border-amber-200",
    red:    "bg-red-50    text-red-600    border border-red-200",
    blue:   "bg-sky-50    text-sky-600    border border-sky-200",
    gray:   "bg-slate-100 text-slate-500  border border-slate-200",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

const PriceCell = ({ value }) =>
  value != null
    ? <span className="font-mono text-xs font-medium text-slate-700">₱{value}</span>
    : <span className="font-mono text-xs text-slate-300">—</span>

const StatusBadge = ({ row }) => {
  if (row._errors.length > 0) {
    return (
      <span title={row._errors.join(" | ")}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200 cursor-help">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Error
      </span>
    )
  }
  if (row._willCreate.length > 0) {
    return (
      <span title={`Will create: ${row._willCreate.join(", ")}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Auto-create
      </span>
    )
  }
  if (row.prevailing_price == null && row.high_price == null && row.low_price == null) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-50 text-sky-600 border border-sky-200">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
        </svg>
        No price
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      Ready
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ImportPDFModal = ({ isOpen, OnClose }) => {
  if (!isOpen) return null

  const {
    commodities, markets, categories,
    fetchCommodities, fetchMarkets, fetchCategories,
    addPriceRecord, addCommodity, addCategory, addMarket, fetchVegetables,
  } = useAdminPriceStore()

  const fileInputRef = useRef(null)
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState("")
  const [metaInfo, setMetaInfo] = useState({ markets: [], priceDate: null })
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })
  const [step, setStep] = useState("upload")

  useEffect(() => {
    if (isOpen) { fetchCommodities(); fetchMarkets(); fetchCategories() }
  }, [isOpen])

  const findCategory = (name) =>
    categories.find((c) => c.name?.trim().toLowerCase() === name?.trim().toLowerCase()) ?? null

  const findCommodity = (name, categoryId) => {
    if (!name) return null
    const norm = name.trim().toLowerCase()
    if (categoryId) {
      const exact = commodities.find((c) => c.name?.trim().toLowerCase() === norm && c.category_id === categoryId)
      if (exact) return exact
    }
    return commodities.find((c) => c.name?.trim().toLowerCase() === norm) ?? null
  }

  const findMarket = (name) =>
    markets.find((m) => m.name?.trim().toLowerCase() === name?.trim().toLowerCase()) ?? null

  const annotateRows = (parsed) =>
    parsed.map((row, index) => {
      const category = findCategory(row.category)
      const categoryId = category?.id ?? null
      const commodity = findCommodity(row.commodity_name, categoryId)
      const market = findMarket(row.market_name)
      const willCreate = []
      if (!category) willCreate.push(`category "${row.category}"`)
      if (!commodity) willCreate.push(`commodity "${row.commodity_name}"`)
      if (!market) willCreate.push(`market "${row.market_name}"`)
      const errors = []
      if (!row.price_date) errors.push("Missing price date")
      if (!row.commodity_name?.trim()) errors.push("Blank commodity name")
      return {
        ...row,
        commodity_id: commodity?.id ?? null,
        market_id: market?.id ?? null,
        category_id: categoryId,
        _index: index + 1,
        _willCreate: willCreate,
        _errors: errors,
      }
    })

  const parseFile = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith(".pdf")) {
      Swal.fire({ icon: "warning", title: "Invalid File", text: "Please upload a PDF file." })
      return
    }
    setIsParsing(true)
    try {
      const extracted = await extractPDF(file)
      if (!extracted.rows || extracted.rows.length === 0) {
        Swal.fire({ icon: "warning", title: "No Data Found", text: "Could not extract any price rows from this PDF." })
        return
      }
      const rowsWithDate = extracted.rows.map((r) => ({ ...r, price_date: extracted.price_date }))
      setRows(annotateRows(rowsWithDate))
      setMetaInfo({ markets: extracted.markets ?? [], priceDate: extracted.price_date })
      setFileName(file.name)
      setStep("preview")
    } catch (err) {
      console.error(err)
      Swal.fire({ icon: "error", title: "Extraction Failed", text: err.message ?? "Failed to extract data from the PDF." })
    } finally {
      setIsParsing(false)
    }
  }

  const handleFileChange = (e) => parseFile(e.target.files[0])
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); parseFile(e.dataTransfer.files[0]) }

  const handleSubmit = async () => {
    const processableRows = rows.filter((r) => r._errors.length === 0)
    if (processableRows.length === 0) {
      Swal.fire({ icon: "warning", title: "No Valid Rows", text: "All rows have errors." })
      return
    }
    setIsSubmitting(true)
    setSubmitProgress({ current: 0, total: processableRows.length })
    const categoryCache = {}, commodityCache = {}, marketCache = {}
    let successCount = 0, failCount = 0, createdCount = 0

    for (let i = 0; i < processableRows.length; i++) {
      const row = processableRows[i]
      setSubmitProgress({ current: i + 1, total: processableRows.length })
      try {
        let category_id = row.category_id
        if (!category_id) {
          const catName = row.category
          if (categoryCache[catName]) { category_id = categoryCache[catName] }
          else {
            const res = await addCategory(catName)
            if (!res?.id) { failCount++; continue }
            category_id = res.id; categoryCache[catName] = category_id; createdCount++
          }
        }
        const commodityCacheKey = `${row.commodity_name}::${category_id}`
        let commodity_id = row.commodity_id ?? commodityCache[commodityCacheKey]
        if (!commodity_id) {
          const res = await addCommodity({ category_id, name: row.commodity_name, specification: row.specification || null })
          if (!res?.id) { failCount++; continue }
          commodity_id = res.id; commodityCache[commodityCacheKey] = commodity_id; createdCount++
        }
        let market_id = row.market_id ?? marketCache[row.market_name]
        if (!market_id) {
          const res = await addMarket(row.market_name)
          if (!res?.id) { failCount++; continue }
          market_id = res.id; marketCache[row.market_name] = market_id; createdCount++
        }
        const result = await addPriceRecord({
          commodity_id, market_id, price_date: row.price_date,
          respondent_1: null, respondent_2: null, respondent_3: null, respondent_4: null, respondent_5: null,
          prevailing_price: row.prevailing_price ?? null,
          high_price: row.high_price ?? null,
          low_price: row.low_price ?? null,
        })
        if (result?.success) successCount++; else failCount++
      } catch (err) { console.error("Row error:", err); failCount++ }
    }

    const skipped = rows.filter((r) => r._errors.length > 0).length
    setIsSubmitting(false); setSubmitProgress({ current: 0, total: 0 })
    Swal.fire({
      icon: failCount === 0 ? "success" : "warning",
      title: "Import Complete",
      html: `
        <p><strong>${successCount}</strong> price record(s) inserted.</p>
        ${createdCount > 0 ? `<p><strong>${createdCount}</strong> new entry/entries auto-created.</p>` : ""}
        ${failCount > 0 ? `<p><strong>${failCount}</strong> row(s) failed.</p>` : ""}
        ${skipped > 0 ? `<p><strong>${skipped}</strong> row(s) skipped due to errors.</p>` : ""}
      `,
    })
    fetchVegetables(); fetchCommodities(); fetchMarkets(); fetchCategories()
    handleClose()
  }

  const handleClose = () => {
    setRows([]); setFileName(""); setMetaInfo({ markets: [], priceDate: null })
    setStep("upload"); setIsParsing(false); setIsSubmitting(false)
    setSubmitProgress({ current: 0, total: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ""
    OnClose()
  }

  const validRows    = rows.filter((r) => r._errors.length === 0)
  const errorRows    = rows.filter((r) => r._errors.length > 0)
  const newEntryRows = validRows.filter((r) => r._willCreate.length > 0)
  const noPriceRows  = validRows.filter((r) => r.prevailing_price == null && r.high_price == null && r.low_price == null)
  const progressPct  = submitProgress.total > 0 ? Math.round((submitProgress.current / submitProgress.total) * 100) : 0

  const groupedByCategory = rows.reduce((acc, row) => {
    const cat = row.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(row)
    return acc
  }, {})

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .imp-pdf-overlay  { font-family: 'DM Sans', sans-serif; }
        .imp-pdf-panel    { animation: imp-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        .imp-pdf-overlay  { animation: imp-fadein 0.18s ease; }
        @keyframes imp-fadein  { from { opacity:0 } to { opacity:1 } }
        @keyframes imp-slidein { from { opacity:0; transform:translateY(18px) scale(0.97) } to { opacity:1; transform:none } }

        .imp-pdf-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          border-radius: 99px;
          transition: width 0.25s ease;
        }
        .imp-pdf-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: imp-spin 0.65s linear infinite;
          display: inline-block;
        }
        .imp-pdf-parsing-ring {
          width: 52px; height: 52px; border-radius: 50%;
          border: 3px solid #bbf7d0;
          border-top-color: #16a34a;
          animation: imp-spin 0.85s linear infinite;
        }
        @keyframes imp-spin { to { transform: rotate(360deg) } }
        .imp-pdf-cat-row td { font-family: 'DM Sans', sans-serif; }
        .imp-pdf-mono { font-family: 'DM Mono', monospace; }
      `}</style>

      {/* Overlay */}
      <div
        className="imp-pdf-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}
        onClick={(e) => e.target === e.currentTarget && !isParsing && !isSubmitting && handleClose()}
      >
        {/* Panel */}
        <div
          className="imp-pdf-panel bg-white rounded-2xl w-full shadow-2xl flex flex-col overflow-hidden"
          style={{ maxWidth: 960, maxHeight: "92vh", boxShadow: "0 32px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-7 pt-6 pb-5 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3.5">
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#16a34a 0%,#15803d 100%)", boxShadow: "0 4px 12px rgba(22,163,74,0.3)" }}
              >
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <div className="text-[1.0625rem] font-semibold text-slate-900 leading-snug">Import from PDF</div>
                <div className="text-xs text-slate-400 mt-0.5">DA Bantay Presyo — Retail Price Report</div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isParsing || isSubmitting}
              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-col gap-4 px-7 py-6 flex-1 min-h-0 overflow-hidden">

            {/* UPLOAD STEP */}
            {step === "upload" && (
              <>
                {/* Drop zone */}
                <div
                  className={`relative rounded-2xl border-2 border-dashed p-14 text-center transition-all overflow-hidden
                    ${isParsing
                      ? "border-emerald-400 bg-emerald-50 cursor-wait"
                      : isDragging
                      ? "border-emerald-500 bg-emerald-50 cursor-copy"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
                    }`}
                  onClick={() => !isParsing && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); if (!isParsing) setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={!isParsing ? handleDrop : undefined}
                >
                  {/* Subtle radial glow */}
                  <div className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(22,163,74,0.05) 0%,transparent 70%)" }} />

                  {isParsing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="imp-pdf-parsing-ring" />
                      <p className="text-[0.9375rem] font-semibold text-emerald-700">Reading PDF with AI…</p>
                      <p className="text-sm text-slate-400">Extracting price data, please wait</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <p className="text-[0.9375rem] font-semibold text-slate-700">Drop your PDF file here</p>
                      <p className="text-sm text-slate-400 mt-1">or click to browse from your computer</p>
                      <p className="imp-pdf-mono text-[0.6875rem] text-slate-300 mt-3 tracking-wider">.pdf only</p>
                    </>
                  )}
                </div>

                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />

                {/* Info card */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                  <div className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Expected Format</div>
                  {[
                    "Date and market names auto-extracted from the report header",
                    "Two markets per report — both imported simultaneously",
                    "Prevailing, High, and Low prices read directly from the PDF",
                    "Rows with blank prices are still imported — commodity is recorded",
                    "Missing categories, commodities, and markets are auto-created on import",
                  ].map((item, i) => (
                    <div key={i} className="flex gap-2 items-start py-0.5">
                      <span className="text-emerald-500 text-[0.625rem] mt-1 shrink-0">●</span>
                      <span className="text-[0.8125rem] text-slate-500">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PREVIEW STEP */}
            {step === "preview" && (
              <>
                {/* Meta bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {metaInfo.markets.map((m, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium border border-slate-200 bg-slate-50 text-slate-600">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                      {m}
                    </div>
                  ))}
                  {metaInfo.priceDate && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium border border-slate-200 bg-slate-50 text-slate-600">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {new Date(metaInfo.priceDate + "T00:00:00").toDateString()}
                    </div>
                  )}
                  <Pill color="green">✓ {validRows.length} valid</Pill>
                  {newEntryRows.length > 0 && <Pill color="yellow">+ {newEntryRows.length} auto-create</Pill>}
                  {noPriceRows.length > 0  && <Pill color="blue">— {noPriceRows.length} no price</Pill>}
                  {errorRows.length > 0    && <Pill color="red">✕ {errorRows.length} error{errorRows.length !== 1 ? "s" : ""}</Pill>}
                  <span className="imp-pdf-mono text-[0.6875rem] text-slate-400 ml-auto truncate max-w-45">{fileName}</span>
                  <button
                    className="text-xs text-emerald-600 font-medium hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer"
                    onClick={() => { setStep("upload"); setRows([]); setFileName("") }}
                  >
                    Change file
                  </button>
                </div>

                {/* Notice */}
                {newEntryRows.length > 0 && (
                  <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2.5 text-[0.8125rem] text-amber-800">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="shrink-0 mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>
                      <strong>{newEntryRows.length}</strong> row(s) reference missing categories, commodities, or markets — these will be <strong>auto-created</strong> during import.
                    </span>
                  </div>
                )}

                {/* Table */}
                <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-200">
                  <table className="w-full border-collapse text-[0.8125rem]">
                    <thead>
                      <tr className="bg-slate-50 sticky top-0 z-10">
                        {["#", "Commodity", "Spec", "Market", "Prevailing", "High", "Low", "Status"].map((h, i) => (
                          <th
                            key={h}
                            className={`px-3 py-2.5 text-[0.6875rem] font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-200 whitespace-nowrap
                              ${i >= 4 && i <= 6 ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedByCategory).map(([category, catRows]) => (
                        <React.Fragment key={category}>
                          {/* Category row */}
                          <tr className="imp-pdf-cat-row bg-emerald-50">
                            <td colSpan={8} className="px-3 py-1.75 text-[0.6875rem] font-bold uppercase tracking-widest text-emerald-700">
                              {category}
                            </td>
                          </tr>
                          {catRows.map((row) => (
                            <tr
                              key={row._index}
                              className={`border-b border-slate-100 last:border-0 transition-colors
                                ${row._errors.length > 0 ? "bg-red-50/60" : "hover:bg-slate-50"}`}
                            >
                              <td className="px-3 py-2 text-[0.6875rem] text-slate-300 imp-pdf-mono">{row._index}</td>
                              <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap">
                                {row.commodity_name}
                                {!row.commodity_id && row._errors.length === 0 && (
                                  <span className="inline-block text-[0.5625rem] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 border border-amber-200 rounded px-1 ml-1.5 align-middle">new</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-slate-400 text-xs">{row.specification || "—"}</td>
                              <td className="px-3 py-2 text-slate-500 text-xs whitespace-nowrap">{row.market_name}</td>
                              <td className="px-3 py-2 text-right">
                                <PriceCell value={row.prevailing_price} />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <PriceCell value={row.high_price} />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <PriceCell value={row.low_price} />
                              </td>
                              <td className="px-3 py-2">
                                <StatusBadge row={row} />
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Progress bar */}
                {isSubmitting && submitProgress.total > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>Importing records…</span>
                      <span>{submitProgress.current} / {submitProgress.total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="imp-pdf-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-2.5 px-7 pt-4 pb-5 border-t border-slate-100 shrink-0">
            <button
              onClick={handleClose}
              disabled={isParsing || isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-transparent border border-slate-200 hover:bg-slate-50 hover:text-slate-700 transition-all disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </button>
            {step === "preview" && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || validRows.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-50 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg,#16a34a 0%,#15803d 100%)",
                  boxShadow: "0 2px 8px rgba(22,163,74,0.3)"
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="imp-pdf-spinner" />
                    Importing…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Import {validRows.length} Record{validRows.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}

export default ImportPDFModal