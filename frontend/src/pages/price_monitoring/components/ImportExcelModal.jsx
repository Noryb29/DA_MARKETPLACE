import React, { useRef, useState, useEffect } from "react"
import * as XLSX from "xlsx"
import Swal from "sweetalert2"
import { useAdminPriceStore } from "../../../store/AdminPriceStore"

// ─── Helper: robust numeric parsing ──────────────────────────────────────────
const parseNumeric = (val) => {
  if (val === null || val === undefined) return null
  const str = String(val).trim().toLowerCase()
  if (str === "" || str === "n/a" || str === "na" || str === "-" || str === "--" || str === "n.m." || str === "nm") return null
  const f = parseFloat(val)
  return isNaN(f) ? null : f
}

const isCategoryRow = (row) => {
  if (!row || row.length < 3) return false
  const commodity = row[0]
  const unit = row[2]
  const hasCommodity = commodity !== null && String(commodity).trim().length > 0
  const hasUnit = unit !== null && String(unit).trim().length > 0
  const respondents = [row[3], row[4], row[5], row[6], row[7]]
  const hasNumeric = respondents.some((v) => parseNumeric(v) !== null)
  return hasCommodity && !hasUnit && !hasNumeric
}

const findDataStartRow = (raw) => {
  for (let i = 0; i < Math.min(30, raw.length); i++) {
    const row = raw[i]
    if (!row || row.length < 3) continue
    const cell0 = String(row[0] ?? "").toLowerCase()
    if (cell0.includes("commodity") || cell0.includes("item") || cell0.includes("description")) {
      return i + 1
    }
  }
  return 8
}

const calcPrevailing = (values) => {
  const nums = values.map((v) => parseFloat(v)).filter((v) => !isNaN(v))
  if (nums.length === 0) return null
  if (nums.length === 1) return nums[0]
  const freq = {}
  for (const v of nums) freq[v] = (freq[v] || 0) + 1
  const maxFreq = Math.max(...Object.values(freq))
  const modes = Object.keys(freq).filter((k) => freq[k] === maxFreq).map(Number)
  if (modes.length > 1) {
    const sum = modes.reduce((a, b) => a + b, 0)
    return Math.round((sum / modes.length) * 100) / 100
  }
  if (maxFreq > 1) return modes[0]
  if (nums.length < 3) {
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100
  }
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100
}

const parseDAExcel = (workbook) => {
  const sheetName = workbook.SheetNames.includes("FORM A1")
    ? "FORM A1"
    : workbook.SheetNames[0]
  const ws = workbook.Sheets[sheetName]
  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null })
  let marketName = null
  let priceDate = null
  for (let i = 0; i < Math.min(20, raw.length); i++) {
    const row = raw[i]
    if (!row) continue
    const cell0 = String(row[0] ?? "")
    const cell1 = String(row[1] ?? "")
    if (/MARKET:/i.test(cell0) || /MARKET\s*NAME/i.test(cell0)) {
      const rawVal = cell0.replace(/.*MARKET\s*:\s*/i, "").trim() || cell1.trim()
      marketName = rawVal.replace(/\s*market\s*$/i, "").trim()
    }
    if (/Date/i.test(cell0) || /Date/i.test(cell1)) {
      const datePart = cell0.replace(/.*Date\s*:\s*/i, "").trim() || cell1.replace(/Date\s*:\s*/i, "").trim()
      if (datePart) {
        const parsed = new Date(datePart)
        priceDate = !isNaN(parsed) ? parsed.toISOString().split("T")[0] : datePart
      }
    }
  }
  const dataStartRow = findDataStartRow(raw)
  let currentCategory = null
  const results = []
  for (let i = dataStartRow; i < raw.length; i++) {
    const row = raw[i]
    if (!row || !Array.isArray(row)) continue
    if (row.length < 13) continue
    if (row.every((c) => c === null || c === undefined || String(c).trim() === "")) continue
    const commodityRaw = row[0]
    if (commodityRaw === null || commodityRaw === undefined) continue
    const commodityName = String(commodityRaw).trim()
    if (!commodityName) continue
    const specification = row[1]
    const unit = row[2]
    const rawRespondents = [row[3], row[4], row[5], row[6], row[7]].map(v => v ?? null)
    const respondents = rawRespondents.map((v) => parseNumeric(v))
    const numericOnly = respondents.filter((v) => v !== null)
    if (isCategoryRow(row)) {
      currentCategory = commodityName.replace(/\s+/g, " ").trim()
      continue
    }
    const prevailing = numericOnly.length > 0 ? calcPrevailing(numericOnly) : null
    const high = numericOnly.length > 0 ? Math.max(...numericOnly) : null
    const low = numericOnly.length > 0 ? Math.min(...numericOnly) : null
    results.push({
      category: currentCategory,
      commodity_name: commodityName,
      specification: specification ? String(specification).trim() : "",
      unit: unit ? String(unit).trim() : "",
      market_name: marketName,
      price_date: priceDate,
      respondent_1: respondents[0],
      respondent_2: respondents[1],
      respondent_3: respondents[2],
      respondent_4: respondents[3],
      respondent_5: respondents[4],
      prevailing_price: prevailing,
      high_price: high,
      low_price: low,
    })
  }
  return { marketName, priceDate, rows: results }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Pill = ({ color, children }) => {
  const colors = {
    green:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
    yellow: "bg-amber-50  text-amber-700  border border-amber-200",
    red:    "bg-red-50    text-red-600    border border-red-200",
    gray:   "bg-slate-100 text-slate-500  border border-slate-200",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

const StatusBadge = ({ row }) => {
  if (row._errors.length > 0) {
    return (
      <span
        title={row._errors.join(" | ")}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-200 cursor-help"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        Error
      </span>
    )
  }
  if (row._willCreate.length > 0) {
    return (
      <span
        title={`Will create: ${row._willCreate.join(", ")}`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 cursor-help"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Auto-create
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      Ready
    </span>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ImportExcelModal = ({ isOpen, OnClose }) => {
  if (!isOpen) return null
  const {
    commodities, markets, categories,
    fetchCommodities, fetchMarkets, fetchCategories,
    addPriceRecord, addCommodity, addCategory, addMarket, fetchCrops,
  } = useAdminPriceStore()

  const fileInputRef = useRef(null)
  const [rows, setRows] = useState([])
  const [fileName, setFileName] = useState("")
  const [metaInfo, setMetaInfo] = useState({ marketName: null, priceDate: null })
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState({ current: 0, total: 0 })
  const [step, setStep] = useState("upload")

  useEffect(() => {
    if (isOpen) {
      fetchCommodities()
      fetchMarkets()
      fetchCategories()
    }
  }, [isOpen])

  const findCommodity = (name, categoryId) => {
    if (!name) return null
    const normalName = name.trim().toLowerCase()
    if (categoryId) {
      const exact = commodities.find(
        (c) => c.name?.trim().toLowerCase() === normalName && c.category_id === categoryId
      )
      if (exact) return exact
    }
    return commodities.find((c) => c.name?.trim().toLowerCase() === normalName) ?? null
  }

  const findMarket = (name) =>
    markets.find((m) => m.name?.trim().toLowerCase() === name?.trim().toLowerCase()) ?? null

  const findCategory = (name) =>
    categories.find((c) => c.name?.trim().toLowerCase() === name?.trim().toLowerCase()) ?? null

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

  const parseFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: "binary", cellDates: true })
        const { marketName, priceDate, rows: parsed } = parseDAExcel(workbook)
        if (parsed.length === 0) {
          Swal.fire({ icon: "warning", title: "No Data Found", text: "Could not extract any commodity rows." })
          return
        }
        setRows(annotateRows(parsed))
        setMetaInfo({ marketName, priceDate })
        setFileName(file.name)
        setStep("preview")
      } catch (err) {
        console.error(err)
        Swal.fire({ icon: "error", title: "Parse Error", text: "Failed to read the Excel file." })
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleFileChange = (e) => parseFile(e.target.files[0])
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    parseFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    const processableRows = rows.filter((r) => r._errors.length === 0)
    if (processableRows.length === 0) {
      Swal.fire({ icon: "warning", title: "No Valid Rows", text: "All rows have errors." })
      return
    }
    setIsSubmitting(true)
    setSubmitProgress({ current: 0, total: processableRows.length })
    const categoryCache = {}
    const commodityCache = {}
    const marketCache = {}
    let successCount = 0
    let failCount = 0
    let createdCount = 0

    for (let i = 0; i < processableRows.length; i++) {
      const row = processableRows[i]
      setSubmitProgress({ current: i + 1, total: processableRows.length })
      try {
        let category_id = row.category_id
        if (!category_id) {
          const catName = row.category
          if (categoryCache[catName]) {
            category_id = categoryCache[catName]
          } else {
            const res = await addCategory(catName)
            if (!res?.id) { failCount++; continue }
            category_id = res.id
            categoryCache[catName] = category_id
            createdCount++
          }
        }
        const commodityCacheKey = `${row.commodity_name}::${category_id}`
        let commodity_id = row.commodity_id ?? commodityCache[commodityCacheKey]
        if (!commodity_id) {
          const res = await addCommodity({ category_id, name: row.commodity_name, specification: row.specification || null })
          if (!res?.id) { failCount++; continue }
          commodity_id = res.id
          commodityCache[commodityCacheKey] = commodity_id
          createdCount++
        }
        let market_id = row.market_id ?? marketCache[row.market_name]
        if (!market_id) {
          const res = await addMarket(row.market_name)
          if (!res?.id) { failCount++; continue }
          market_id = res.id
          marketCache[row.market_name] = market_id
          createdCount++
        }
        const result = await addPriceRecord({
          commodity_id, market_id,
          price_date: row.price_date,
          respondent_1: row.respondent_1,
          respondent_2: row.respondent_2,
          respondent_3: row.respondent_3,
          respondent_4: row.respondent_4,
          respondent_5: row.respondent_5,
          prevailing_price: row.prevailing_price,
          high_price: row.high_price,
          low_price: row.low_price,
        })
        if (result?.success) successCount++
        else failCount++
      } catch (err) {
        console.error("Row error:", err)
        failCount++
      }
    }

    const skipped = rows.filter((r) => r._errors.length > 0).length
    setIsSubmitting(false)
    setSubmitProgress({ current: 0, total: 0 })
    Swal.fire({
      icon: failCount === 0 ? "success" : "warning",
      title: "Import Complete",
      html: `
        <p><strong>${successCount}</strong> price record(s) inserted.</p>
        ${createdCount > 0 ? `<p><strong>${createdCount}</strong> new entry/entries auto-created.</p>` : ""}
        ${failCount > 0 ? `<p><strong>${failCount}</strong> row(s) failed.</p>` : ""}
        ${skipped > 0 ? `<p><strong>${skipped}</strong> row(s) skipped.</p>` : ""}
      `,
    })
    fetchCrops(); fetchCommodities(); fetchMarkets(); fetchCategories()
    handleClose()
  }

  const handleClose = () => {
    setRows([]); setFileName(""); setMetaInfo({ marketName: null, priceDate: null })
    setStep("upload"); setIsSubmitting(false); setSubmitProgress({ current: 0, total: 0 })
    if (fileInputRef.current) fileInputRef.current.value = ""
    OnClose()
  }

  const errorRows = rows.filter((r) => r._errors.length > 0)
  const validRows = rows.filter((r) => r._errors.length === 0)
  const newEntryRows = validRows.filter((r) => r._willCreate.length > 0)
  const processableRows = validRows

  const groupedRows = rows.reduce((acc, row) => {
    const cat = row.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(row)
    return acc
  }, {})

  const progressPct = submitProgress.total > 0
    ? Math.round((submitProgress.current / submitProgress.total) * 100)
    : 0

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .imp-overlay {
          font-family: 'DM Sans', sans-serif;
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: imp-fadein 0.18s ease;
        }
        @keyframes imp-fadein { from { opacity: 0 } to { opacity: 1 } }

        .imp-panel {
          background: #ffffff;
          border-radius: 20px;
          width: 100%; max-width: 900px;
          max-height: 92vh;
          display: flex; flex-direction: column;
          box-shadow: 0 32px 80px -12px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06);
          animation: imp-slidein 0.22s cubic-bezier(0.34,1.56,0.64,1);
          overflow: hidden;
        }
        @keyframes imp-slidein {
          from { opacity: 0; transform: translateY(18px) scale(0.97) }
          to   { opacity: 1; transform: translateY(0)   scale(1)    }
        }

        /* Header */
        .imp-header {
          padding: 1.5rem 1.75rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-shrink: 0;
        }
        .imp-header-left { display: flex; align-items: center; gap: 0.875rem; }
        .imp-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(22,163,74,0.3);
          flex-shrink: 0;
        }
        .imp-title { font-size: 1.0625rem; font-weight: 600; color: #0f172a; line-height: 1.3; }
        .imp-subtitle { font-size: 0.75rem; color: #94a3b8; margin-top: 1px; }
        .imp-close {
          width: 32px; height: 32px; border-radius: 8px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s; color: #64748b;
          flex-shrink: 0;
        }
        .imp-close:hover { background: #f1f5f9; color: #0f172a; }

        /* Body */
        .imp-body {
          padding: 1.5rem 1.75rem;
          flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 1rem;
          overflow: hidden;
        }

        /* Upload zone */
        .imp-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 3.5rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.18s;
          background: #fafbfc;
          position: relative;
          overflow: hidden;
        }
        .imp-dropzone::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(22,163,74,0.04) 0%, transparent 70%);
          pointer-events: none;
        }
        .imp-dropzone:hover, .imp-dropzone.dragging {
          border-color: #16a34a;
          background: #f0fdf4;
        }
        .imp-dropzone-icon {
          width: 56px; height: 56px; margin: 0 auto 1rem;
          background: #f0fdf4; border: 1.5px solid #bbf7d0;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .imp-dropzone-title { font-size: 0.9375rem; font-weight: 600; color: #0f172a; }
        .imp-dropzone-sub   { font-size: 0.8125rem; color: #94a3b8; margin-top: 0.25rem; }
        .imp-dropzone-ext   { font-size: 0.6875rem; color: #cbd5e1; margin-top: 0.75rem;
                               font-family: 'DM Mono', monospace; letter-spacing: 0.05em; }

        /* Info card */
        .imp-info-card {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
          padding: 1rem 1.125rem;
        }
        .imp-info-title { font-size: 0.75rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.625rem; }
        .imp-info-item  { font-size: 0.8125rem; color: #64748b; padding: 0.1875rem 0; display: flex; gap: 0.5rem; }
        .imp-info-dot   { color: #16a34a; font-size: 0.625rem; margin-top: 0.3rem; flex-shrink: 0; }

        /* Meta bar */
        .imp-meta-bar {
          display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;
        }
        .imp-meta-tag {
          display: inline-flex; align-items: center; gap: 0.375rem;
          padding: 0.3125rem 0.75rem; border-radius: 8px;
          font-size: 0.8125rem; font-weight: 500; border: 1px solid #e2e8f0;
          background: #f8fafc; color: #334155;
        }
        .imp-meta-tag svg { color: #94a3b8; }
        .imp-filename {
          font-family: 'DM Mono', monospace; font-size: 0.6875rem; color: #94a3b8;
          margin-left: auto;
        }
        .imp-change-btn {
          font-size: 0.75rem; color: #16a34a; font-weight: 500;
          background: none; border: none; cursor: pointer; padding: 0;
          transition: opacity 0.15s;
        }
        .imp-change-btn:hover { opacity: 0.7; }

        /* Notice */
        .imp-notice {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
          padding: 0.625rem 0.875rem;
          display: flex; gap: 0.625rem; align-items: flex-start;
          font-size: 0.8125rem; color: #92400e;
        }

        /* Table wrapper */
        .imp-table-wrap {
          flex: 1; min-height: 0; overflow: auto;
          border: 1px solid #e2e8f0; border-radius: 12px;
        }
        .imp-table {
          width: 100%; border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .imp-table thead tr {
          background: #f8fafc;
          position: sticky; top: 0; z-index: 5;
        }
        .imp-table th {
          padding: 0.625rem 0.75rem;
          font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: #64748b; text-align: left;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .imp-table th.num { text-align: right; }
        .imp-table td {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
          vertical-align: middle;
        }
        .imp-table tr:last-child td { border-bottom: none; }
        .imp-table tr.cat-row td {
          background: #f0fdf4;
          font-size: 0.6875rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #15803d; padding: 0.4375rem 0.75rem;
        }
        .imp-table tr.error-row td { background: #fff8f8; }
        .imp-table tr:not(.cat-row):not(.error-row):hover td { background: #f8fafc; }
        .imp-table td.mono {
          font-family: 'DM Mono', monospace; font-size: 0.75rem;
          text-align: right; color: #475569;
        }
        .imp-table td.mono.null { color: #cbd5e1; }
        .imp-table td.mono.bold { color: #0f172a; font-weight: 500; }
        .imp-new-badge {
          display: inline-block; font-size: 0.5625rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em;
          background: #fef3c7; color: #b45309; border: 1px solid #fde68a;
          border-radius: 4px; padding: 0 4px; margin-left: 4px; vertical-align: middle;
        }

        /* Progress */
        .imp-progress-wrap { padding: 0.25rem 0; }
        .imp-progress-label {
          display: flex; justify-content: space-between;
          font-size: 0.75rem; color: #64748b; margin-bottom: 0.375rem;
        }
        .imp-progress-track {
          height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden;
        }
        .imp-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #16a34a, #22c55e);
          border-radius: 99px;
          transition: width 0.25s ease;
        }

        /* Footer */
        .imp-footer {
          padding: 1rem 1.75rem 1.25rem;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: flex-end; gap: 0.625rem;
          flex-shrink: 0;
        }
        .imp-btn {
          display: inline-flex; align-items: center; gap: 0.4375rem;
          padding: 0.5625rem 1.125rem; border-radius: 10px;
          font-size: 0.875rem; font-weight: 500; cursor: pointer;
          border: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .imp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .imp-btn-ghost {
          background: transparent; color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .imp-btn-ghost:hover:not(:disabled) { background: #f8fafc; color: #334155; }
        .imp-btn-primary {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .imp-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          box-shadow: 0 4px 14px rgba(22,163,74,0.4);
          transform: translateY(-1px);
        }
        .imp-btn-primary:active:not(:disabled) { transform: translateY(0); }

        .imp-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          animation: imp-spin 0.65s linear infinite;
        }
        @keyframes imp-spin { to { transform: rotate(360deg) } }
      `}</style>

      <div className="imp-overlay" onClick={(e) => e.target === e.currentTarget && !isSubmitting && handleClose()}>
        <div className="imp-panel">

          {/* ── Header ── */}
          <div className="imp-header">
            <div className="imp-header-left">
              <div className="imp-icon-wrap">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <div>
                <div className="imp-title">Import from Excel</div>
                <div className="imp-subtitle">DA Bantay Presyo — Form A1</div>
              </div>
            </div>
            <button className="imp-close" onClick={handleClose} disabled={isSubmitting}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="imp-body">

            {/* UPLOAD STEP */}
            {step === "upload" && (
              <>
                <div
                  className={`imp-dropzone${isDragging ? " dragging" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="imp-dropzone-icon">
                    <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
                    </svg>
                  </div>
                  <div className="imp-dropzone-title">Drop your Excel file here</div>
                  <div className="imp-dropzone-sub">or click to browse from your computer</div>
                  <div className="imp-dropzone-ext">.xlsx · .xls</div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                <div className="imp-info-card">
                  <div className="imp-info-title">Expected Format</div>
                  {[
                    "Market name and date auto-extracted from header rows",
                    "Respondent prices (columns D–H) parsed individually",
                    "Prevailing price computed via DA formula: mode → median → average",
                    "Missing categories, commodities, and markets are auto-created on import",
                  ].map((item, i) => (
                    <div className="imp-info-item" key={i}>
                      <span className="imp-info-dot">●</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PREVIEW STEP */}
            {step === "preview" && (
              <>
                {/* Meta bar */}
                <div className="imp-meta-bar">
                  {metaInfo.marketName && (
                    <div className="imp-meta-tag">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 2.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                      </svg>
                      {metaInfo.marketName}
                    </div>
                  )}
                  {metaInfo.priceDate && (
                    <div className="imp-meta-tag">
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {new Date(metaInfo.priceDate).toDateString()}
                    </div>
                  )}
                  <Pill color="green">✓ {validRows.length} valid</Pill>
                  {newEntryRows.length > 0 && <Pill color="yellow">+ {newEntryRows.length} auto-create</Pill>}
                  {errorRows.length > 0 && <Pill color="red">✕ {errorRows.length} error{errorRows.length > 1 ? "s" : ""}</Pill>}
                  <span className="imp-filename">{fileName}</span>
                  <button className="imp-change-btn" onClick={() => { setStep("upload"); setRows([]); setFileName("") }}>
                    Change file
                  </button>
                </div>

                {/* Notice */}
                {newEntryRows.length > 0 && (
                  <div className="imp-notice">
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <span>
                      <strong>{newEntryRows.length}</strong> row(s) reference missing categories, commodities, or markets — these will be <strong>auto-created</strong> during import.
                    </span>
                  </div>
                )}

                {/* Table */}
                <div className="imp-table-wrap">
                  <table className="imp-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}>#</th>
                        <th>Commodity</th>
                        <th>Spec</th>
                        <th className="num">R1</th>
                        <th className="num">R2</th>
                        <th className="num">R3</th>
                        <th className="num">R4</th>
                        <th className="num">R5</th>
                        <th className="num">Prevailing</th>
                        <th className="num">High</th>
                        <th className="num">Low</th>
                        <th style={{ width: 110 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedRows).map(([category, catRows]) => (
                        <React.Fragment key={category}>
                          <tr className="cat-row">
                            <td colSpan={12}>{category}</td>
                          </tr>
                          {catRows.map((row) => (
                            <tr key={row._index} className={row._errors.length > 0 ? "error-row" : ""}>
                              <td style={{ color: "#cbd5e1", fontSize: "0.6875rem" }}>{row._index}</td>
                              <td style={{ fontWeight: 500, color: "#0f172a" }}>
                                {row.commodity_name}
                                {!row.commodity_id && row._errors.length === 0 && (
                                  <span className="imp-new-badge">new</span>
                                )}
                              </td>
                              <td style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{row.specification || "—"}</td>
                              {[row.respondent_1, row.respondent_2, row.respondent_3, row.respondent_4, row.respondent_5].map((r, i) => (
                                <td key={i} className={`mono${r == null ? " null" : ""}`}>
                                  {r ?? "—"}
                                </td>
                              ))}
                              <td className="mono bold">{row.prevailing_price ?? "—"}</td>
                              <td className="mono">{row.high_price ?? "—"}</td>
                              <td className="mono">{row.low_price ?? "—"}</td>
                              <td><StatusBadge row={row} /></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Progress */}
                {isSubmitting && submitProgress.total > 0 && (
                  <div className="imp-progress-wrap">
                    <div className="imp-progress-label">
                      <span>Importing records…</span>
                      <span>{submitProgress.current} / {submitProgress.total}</span>
                    </div>
                    <div className="imp-progress-track">
                      <div className="imp-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="imp-footer">
            <button className="imp-btn imp-btn-ghost" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </button>
            {step === "preview" && (
              <button
                className="imp-btn imp-btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || processableRows.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <span className="imp-spinner" />
                    Importing…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Import {processableRows.length} Record{processableRows.length !== 1 ? "s" : ""}
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

export default ImportExcelModal