import { db } from "../db.js"

export const getVegetables = async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        message: "Database connection not initialized"
      })
    }

   const query = `
  SELECT 
    c.id AS commodity_id,
    c.name,
    c.specification,
    cat.name AS category,
    pr.price_date,
    m.name AS market_name,
    pr.prevailing_price,
    pr.high_price,
    pr.low_price,
    pr.respondent_1,
    pr.respondent_2,
    pr.respondent_3,
    pr.respondent_4,
    pr.respondent_5,
    (
      SELECT COUNT(*) 
      FROM price_records 
      WHERE commodity_id = c.id
    ) AS price_count,
    (
      SELECT COUNT(*) 
      FROM price_records
      WHERE commodity_id = c.id
        AND (
          respondent_1 IS NOT NULL OR
          respondent_2 IS NOT NULL OR
          respondent_3 IS NOT NULL OR
          respondent_4 IS NOT NULL OR
          respondent_5 IS NOT NULL
        )
    ) AS respondent_count
  FROM commodities c
  JOIN categories cat ON c.category_id = cat.id
  LEFT JOIN price_records pr ON pr.commodity_id = c.id
  LEFT JOIN markets m ON pr.market_id = m.id
  ORDER BY c.name;
`

    const [rows] = await db.query(query)

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false })
    }

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    })

  } catch (error) {
    console.error("Vegetable Controller Error:", error)

    if (error.code === "ER_BAD_FIELD_ERROR") {
      return res.status(400).json({ success: false, message: "Invalid database column" })
    }
    if (error.code === "ER_NO_SUCH_TABLE") {
      return res.status(500).json({ success: false, message: "Database table missing" })
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    })
  }
}

export const getMarkets = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM markets ORDER BY name")
    return res.status(200).json({ success: true, count: rows.length, data: rows })
  } catch (error) {
    console.error("Get Markets Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch markets" })
  }
}

export const getCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY name")
    return res.status(200).json({ success: true, count: rows.length, data: rows })
  } catch (error) {
    console.error("Get Categories Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch categories" })
  }
}

export const getCommodities = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.specification,
        cat.name AS category
      FROM commodities c
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.name
    `
    const [rows] = await db.query(query)
    return res.status(200).json({ success: true, count: rows.length, data: rows })
  } catch (error) {
    console.error("Get Commodities Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch commodities" })
  }
}

export const getCommodityPrices = async (req, res) => {
  try {
    const { id } = req.params
    const query = `
      SELECT 
        c.name,
        m.name AS market,
        pr.price_date,
        pr.prevailing_price,
        pr.high_price,
        pr.low_price,
        pr.respondent_1,
        pr.respondent_2,
        pr.respondent_3,
        pr.respondent_4,
        pr.respondent_5
      FROM price_records pr
      JOIN commodities c ON pr.commodity_id = c.id
      JOIN markets m ON pr.market_id = m.id
      WHERE c.id = ?
      ORDER BY pr.price_date DESC
    `
    const [rows] = await db.query(query, [id])
    return res.status(200).json({ success: true, count: rows.length, data: rows })
  } catch (error) {
    console.error("Commodity Price Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch commodity prices" })
  }
}

export const getLatestPrices = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.name,
        m.name AS market,
        pr.prevailing_price,
        pr.high_price,
        pr.low_price,
        pr.price_date
      FROM price_records pr
      JOIN commodities c ON pr.commodity_id = c.id
      JOIN markets m ON pr.market_id = m.id
      WHERE pr.price_date = (
        SELECT MAX(price_date) FROM price_records
      )
      ORDER BY c.name
    `
    const [rows] = await db.query(query)
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Latest Price Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch latest prices" })
  }
}

export const addCommodity = async (req, res) => {
  try {
    const { category_id, name, specification } = req.body

    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: "Category and name are required" })
    }

    const [result] = await db.query(
      `INSERT INTO commodities (category_id, name, specification) VALUES (?, ?, ?)`,
      [category_id, name, specification || null]
    )

    return res.status(201).json({
      success: true,
      message: "Commodity added successfully",
      id: result.insertId
    })
  } catch (error) {
    console.error("Add Commodity Error:", error)
    return res.status(500).json({ success: false, message: "Failed to add commodity" })
  }
}

export const addPriceRecord = async (req, res) => {
  try {
    const {
      commodity_id, market_id, price_date,
      respondent_1, respondent_2, respondent_3, respondent_4, respondent_5,
      prevailing_price, high_price, low_price
    } = req.body

    if (!commodity_id || !market_id || !price_date) {
      return res.status(400).json({
        success: false,
        message: "commodity_id, market_id, and price_date are required"
      })
    }

    const [existing] = await db.query(
      "SELECT id FROM price_records WHERE commodity_id = ? AND market_id = ? AND price_date = ?",
      [commodity_id, market_id, price_date]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: `A price record for this commodity and market on ${price_date} already exists`
      })
    }

    const [result] = await db.query(
      `INSERT INTO price_records
        (commodity_id, market_id, price_date,
         respondent_1, respondent_2, respondent_3, respondent_4, respondent_5,
         prevailing_price, high_price, low_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        commodity_id, market_id, price_date,
        respondent_1 ?? null, respondent_2 ?? null, respondent_3 ?? null,
        respondent_4 ?? null, respondent_5 ?? null,
        prevailing_price ?? null, high_price ?? null, low_price ?? null
      ]
    )

    return res.status(201).json({ success: true, message: "Price record added", id: result.insertId })
  } catch (error) {
    console.error("Add Price Error:", error)
    return res.status(500).json({ success: false, message: "Failed to add price record" })
  }
}

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" })
    }

    const [existing] = await db.query(
      "SELECT id FROM categories WHERE LOWER(name) = LOWER(?)",
      [name.trim()]
    )

    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: "Category already exists", id: existing[0].id })
    }

    const [result] = await db.query(
      "INSERT INTO categories (name) VALUES (?)",
      [name.trim()]
    )

    return res.status(201).json({ success: true, message: "Category added successfully", id: result.insertId })
  } catch (error) {
    console.error("Add Category Error:", error)
    return res.status(500).json({ success: false, message: "Failed to add category" })
  }
}

export const addMarket = async (req, res) => {
  try {
    const { name, city } = req.body

    if (!name) {
      return res.status(400).json({ success: false, message: "Market name is required" })
    }

    const [existing] = await db.query(
      "SELECT id FROM markets WHERE LOWER(name) = LOWER(?)",
      [name.trim()]
    )

    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: "Market already exists", id: existing[0].id })
    }

    const [result] = await db.query(
      "INSERT INTO markets (name, city) VALUES (?, ?)",
      [name.trim(), city?.trim() || ""]
    )

    return res.status(201).json({ success: true, message: "Market added successfully", id: result.insertId })
  } catch (error) {
    console.error("Add Market Error:", error)
    return res.status(500).json({ success: false, message: "Failed to add market" })
  }
}

export const updateCommodity = async (req, res) => {
  try {
    const { id } = req.params
    const { category_id, name, specification } = req.body

    if (!category_id || !name) {
      return res.status(400).json({ success: false, message: "Category and name are required" })
    }

    const [result] = await db.query(
      `UPDATE commodities SET category_id = ?, name = ?, specification = ? WHERE id = ?`,
      [category_id, name.trim(), specification?.trim() || null, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Commodity not found" })
    }

    return res.status(200).json({ success: true, message: "Commodity updated successfully" })
  } catch (error) {
    console.error("Update Commodity Error:", error)
    return res.status(500).json({ success: false, message: "Failed to update commodity" })
  }
}

export const deleteCommodity = async (req, res) => {
  try {
    const { id } = req.params

    await db.query("DELETE FROM price_records WHERE commodity_id = ?", [id])

    const [result] = await db.query("DELETE FROM commodities WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Commodity not found" })
    }

    return res.status(200).json({ success: true, message: "Commodity deleted successfully" })
  } catch (error) {
    console.error("Delete Commodity Error:", error)
    return res.status(500).json({ success: false, message: "Failed to delete commodity" })
  }
}

// ==================================== ANALYTICS
// ─── Price Trend Over Time (per commodity, all markets or filtered) ───────────
export const getPriceTrend = async (req, res) => {
  try {
    const { commodity_id, market_id, limit = 30 } = req.query

    if (!commodity_id) {
      return res.status(400).json({ success: false, message: "commodity_id is required" })
    }

    let query = `
      SELECT
        pr.price_date,
        m.name AS market_name,
        pr.prevailing_price,
        pr.high_price,
        pr.low_price
      FROM price_records pr
      JOIN markets m ON pr.market_id = m.id
      WHERE pr.commodity_id = ?
    `
    const params = [commodity_id]

    if (market_id) {
      query += ` AND pr.market_id = ?`
      params.push(market_id)
    }

    query += ` ORDER BY pr.price_date DESC LIMIT ?`
    params.push(Number(limit))

    const [rows] = await db.query(query, params)

    // Reverse so chart shows oldest → newest
    return res.status(200).json({ success: true, data: rows.reverse() })
  } catch (error) {
    console.error("Price Trend Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price trend" })
  }
}

// ─── Average Price Per Market (for a given commodity) ────────────────────────
export const getAveragePriceByMarket = async (req, res) => {
  try {
    const { commodity_id } = req.query

    if (!commodity_id) {
      return res.status(400).json({ success: false, message: "commodity_id is required" })
    }

    const query = `
      SELECT
        m.name AS market_name,
        ROUND(AVG(pr.prevailing_price), 2) AS avg_prevailing,
        ROUND(AVG(pr.high_price), 2)       AS avg_high,
        ROUND(AVG(pr.low_price), 2)        AS avg_low,
        COUNT(pr.id)                        AS record_count
      FROM price_records pr
      JOIN markets m ON pr.market_id = m.id
      WHERE pr.commodity_id = ?
        AND pr.prevailing_price IS NOT NULL
      GROUP BY m.id, m.name
      ORDER BY avg_prevailing DESC
    `

    const [rows] = await db.query(query, [commodity_id])
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Avg Price By Market Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch average prices by market" })
  }
}

// ─── Price Comparison Across Commodities (latest date, one market) ───────────
export const getPriceComparison = async (req, res) => {
  try {
    const { market_id, category_id } = req.query

    let query = `
      SELECT
        c.id AS commodity_id,
        c.name AS commodity_name,
        cat.name AS category,
        m.name AS market_name,
        pr.prevailing_price,
        pr.high_price,
        pr.low_price,
        pr.price_date
      FROM price_records pr
      JOIN commodities c   ON pr.commodity_id = c.id
      JOIN categories cat  ON c.category_id   = cat.id
      JOIN markets m       ON pr.market_id     = m.id
      WHERE pr.price_date = (
        SELECT MAX(pr2.price_date)
        FROM price_records pr2
        WHERE pr2.commodity_id = pr.commodity_id
          AND pr2.market_id    = pr.market_id
      )
    `
    const params = []

    if (market_id) {
      query += ` AND pr.market_id = ?`
      params.push(market_id)
    }

    if (category_id) {
      query += ` AND c.category_id = ?`
      params.push(category_id)
    }

    query += ` ORDER BY cat.name, c.name`

    const [rows] = await db.query(query, params)
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Price Comparison Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price comparison" })
  }
}

// ─── Price Volatility (std dev of prevailing price per commodity) ─────────────
export const getPriceVolatility = async (req, res) => {
  try {
    const { market_id, category_id, limit = 10 } = req.query

    let query = `
      SELECT
        c.id AS commodity_id,
        c.name AS commodity_name,
        cat.name AS category,
        ROUND(STDDEV(pr.prevailing_price), 2)  AS price_stddev,
        ROUND(AVG(pr.prevailing_price), 2)     AS avg_price,
        ROUND(MAX(pr.prevailing_price), 2)     AS max_price,
        ROUND(MIN(pr.prevailing_price), 2)     AS min_price,
        COUNT(pr.id)                            AS data_points
      FROM price_records pr
      JOIN commodities c  ON pr.commodity_id = c.id
      JOIN categories cat ON c.category_id   = cat.id
      WHERE pr.prevailing_price IS NOT NULL
    `
    const params = []

    if (market_id) {
      query += ` AND pr.market_id = ?`
      params.push(market_id)
    }

    if (category_id) {
      query += ` AND c.category_id = ?`
      params.push(category_id)
    }

    query += `
      GROUP BY c.id, c.name, cat.name
      HAVING data_points > 1
      ORDER BY price_stddev DESC
      LIMIT ?
    `
    params.push(Number(limit))

    const [rows] = await db.query(query, params)
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Price Volatility Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price volatility" })
  }
}

// ─── Market Coverage (how many commodities each market tracks) ────────────────
export const getMarketCoverage = async (req, res) => {
  try {
    const query = `
      SELECT
        m.id AS market_id,
        m.name AS market_name,
        COUNT(DISTINCT pr.commodity_id)  AS commodity_count,
        COUNT(pr.id)                     AS total_records,
        MAX(pr.price_date)               AS latest_date,
        MIN(pr.price_date)               AS earliest_date
      FROM markets m
      LEFT JOIN price_records pr ON pr.market_id = m.id
      GROUP BY m.id, m.name
      ORDER BY commodity_count DESC
    `
    const [rows] = await db.query(query)
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Market Coverage Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch market coverage" })
  }
}

// ─── Summary / Dashboard Stats ───────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [[totals]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM commodities)    AS total_commodities,
        (SELECT COUNT(*) FROM markets)        AS total_markets,
        (SELECT COUNT(*) FROM categories)     AS total_categories,
        (SELECT COUNT(*) FROM price_records)  AS total_price_records,
        (SELECT MAX(price_date) FROM price_records) AS latest_price_date
    `)

    const [topCommodities] = await db.query(`
      SELECT
        c.name,
        cat.name AS category,
        COUNT(pr.id) AS record_count,
        ROUND(AVG(pr.prevailing_price), 2) AS avg_price
      FROM commodities c
      JOIN categories cat ON c.category_id = cat.id
      LEFT JOIN price_records pr ON pr.commodity_id = c.id
      GROUP BY c.id, c.name, cat.name
      ORDER BY record_count DESC
      LIMIT 5
    `)

    const [categoryBreakdown] = await db.query(`
      SELECT
        cat.name AS category,
        COUNT(DISTINCT c.id)  AS commodity_count,
        COUNT(pr.id)           AS record_count
      FROM categories cat
      LEFT JOIN commodities c   ON c.category_id = cat.id
      LEFT JOIN price_records pr ON pr.commodity_id = c.id
      GROUP BY cat.id, cat.name
      ORDER BY commodity_count DESC
    `)

    return res.status(200).json({
      success: true,
      data: {
        totals,
        topCommodities,
        categoryBreakdown
      }
    })
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" })
  }
}

// ─── Price Range Heatmap (commodity × market matrix, latest prices) ───────────
export const getPriceMatrix = async (req, res) => {
  try {
    const { category_id } = req.query

    let query = `
      SELECT
        c.id AS commodity_id,
        c.name AS commodity_name,
        m.id AS market_id,
        m.name AS market_name,
        pr.prevailing_price,
        pr.price_date
      FROM price_records pr
      JOIN commodities c  ON pr.commodity_id = c.id
      JOIN categories cat ON c.category_id   = cat.id
      JOIN markets m      ON pr.market_id     = m.id
      WHERE pr.price_date = (
        SELECT MAX(pr2.price_date)
        FROM price_records pr2
        WHERE pr2.commodity_id = pr.commodity_id
          AND pr2.market_id    = pr.market_id
      )
    `
    const params = []

    if (category_id) {
      query += ` AND c.category_id = ?`
      params.push(category_id)
    }

    query += ` ORDER BY c.name, m.name`

    const [rows] = await db.query(query, params)
    return res.status(200).json({ success: true, data: rows })
  } catch (error) {
    console.error("Price Matrix Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price matrix" })
  }
}