import { db } from "../db.js"

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
      WHERE pr.commodity_id = $1
    `
    const params = [commodity_id]

    if (market_id) {
      query += ` AND pr.market_id = $${params.length + 1}`
      params.push(market_id)
    }

    query += ` ORDER BY pr.price_date DESC LIMIT $${params.length + 1}`
    params.push(Number(limit))

    const result = await db.query(query, params)

    return res.status(200).json({ success: true, data: result.rows.reverse() })
  } catch (error) {
    console.error("Price Trend Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price trend" })
  }
}

export const getAveragePriceByMarket = async (req, res) => {
  try {
    const { commodity_id } = req.query

    if (!commodity_id) {
      return res.status(400).json({ success: false, message: "commodity_id is required" })
    }

    const result = await db.query(`
      SELECT
        m.name AS market_name,
        ROUND(AVG(pr.prevailing_price), 2) AS avg_prevailing,
        ROUND(AVG(pr.high_price), 2)       AS avg_high,
        ROUND(AVG(pr.low_price), 2)        AS avg_low,
        COUNT(pr.id)                        AS record_count
      FROM price_records pr
      JOIN markets m ON pr.market_id = m.id
      WHERE pr.commodity_id = $1
        AND pr.prevailing_price IS NOT NULL
      GROUP BY m.id, m.name
      ORDER BY avg_prevailing DESC
    `, [commodity_id])

    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Avg Price By Market Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch average prices by market" })
  }
}

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
      query += ` AND pr.market_id = $${params.length + 1}`
      params.push(market_id)
    }

    if (category_id) {
      query += ` AND c.category_id = $${params.length + 1}`
      params.push(category_id)
    }

    query += ` ORDER BY cat.name, c.name`

    const result = await db.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Price Comparison Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price comparison" })
  }
}

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
      query += ` AND pr.market_id = $${params.length + 1}`
      params.push(market_id)
    }

    if (category_id) {
      query += ` AND c.category_id = $${params.length + 1}`
      params.push(category_id)
    }

    query += `
      GROUP BY c.id, c.name, cat.name
      HAVING data_points > 1
      ORDER BY price_stddev DESC
      LIMIT $${params.length + 1}
    `
    params.push(Number(limit))

    const result = await db.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Price Volatility Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price volatility" })
  }
}

export const getMarketCoverage = async (req, res) => {
  try {
    const result = await db.query(`
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
    `)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Market Coverage Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch market coverage" })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const totals = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM commodities)    AS total_commodities,
        (SELECT COUNT(*) FROM markets)        AS total_markets,
        (SELECT COUNT(*) FROM categories)     AS total_categories,
        (SELECT COUNT(*) FROM price_records)  AS total_price_records,
        (SELECT MAX(price_date) FROM price_records) AS latest_price_date
    `)

    const topCommodities = await db.query(`
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

    const categoryBreakdown = await db.query(`
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
        totals: totals.rows[0],
        topCommodities: topCommodities.rows,
        categoryBreakdown: categoryBreakdown.rows
      }
    })
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" })
  }
}

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
      query += ` AND c.category_id = $${params.length + 1}`
      params.push(category_id)
    }

    query += ` ORDER BY c.name, m.name`

    const result = await db.query(query, params)
    return res.status(200).json({ success: true, data: result.rows })
  } catch (error) {
    console.error("Price Matrix Error:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch price matrix" })
  }
}

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totals = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM farmer) AS total_farmers,
        (SELECT COUNT(*) FROM farm) AS total_farms,
        (SELECT COUNT(*) FROM crop_in_farm) AS total_products,
        (SELECT COUNT(*) FROM crop_orders) AS total_orders
    `)

    const recentOrders = await db.query(`
      SELECT 
        co.crop_order_id,
        co.order_date,
        co.quantity,
        co.expected_arrival,
        u.firstname AS customer_firstname,
        u.lastname AS customer_lastname,
        fm.farm_name,
        cf.crop_name
      FROM crop_orders co
      JOIN users u ON co.user_id = u.user_id
      JOIN farmer f ON co.farmer_id = f.user_id
      JOIN farm fm ON co.farm_id = fm.farm_id
      JOIN crop_in_farm cf ON co.crop_id = cf.crop_id
      ORDER BY co.order_date DESC
      LIMIT 10
    `)

    const farmersByArea = await db.query(`
      SELECT 
        fm.farm_name,
        fm.farm_area,
        fm.gps_coordinates,
        f.firstname,
        f.lastname
      FROM farm fm
      JOIN farmer f ON fm.user_id = f.user_id
      ORDER BY fm.farm_area DESC
      LIMIT 10
    `)

    const topProducts = await db.query(`
      SELECT 
        cf.crop_name,
        cf.variety,
        cf.stock,
        cf.expected_harvest,
        fm.farm_name,
        fm.gps_coordinates
      FROM crop_in_farm cf
      JOIN farm fm ON cf.farm_id = fm.farm_id
      ORDER BY cf.stock DESC
      LIMIT 10
    `)

    const usersByDate = await db.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `)

    const ordersByDate = await db.query(`
      SELECT DATE(order_date) AS date, COUNT(*) AS count
      FROM crop_orders
      WHERE order_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(order_date)
      ORDER BY date
    `)

    return res.status(200).json({
      success: true,
      data: {
        totals: totals.rows[0],
        recentOrders: recentOrders.rows,
        farmersByArea: farmersByArea.rows,
        topProducts: topProducts.rows,
        usersByDate: usersByDate.rows,
        ordersByDate: ordersByDate.rows,
      }
    })
  } catch (error) {
    console.error("Admin Dashboard Stats Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const getFarmerDashboardStats = async (req, res) => {
  const user_id = req.user.user_id
  try {
    const totals = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM crop_in_farm cf 
         JOIN farm f ON cf.farm_id = f.farm_id 
         WHERE f.user_id = $1) AS total_crops,
        (SELECT COUNT(DISTINCT co.crop_order_id) FROM crop_orders co 
         WHERE co.farmer_id = $1) AS total_orders,
        (SELECT COALESCE(SUM(co.quantity), 0) FROM crop_orders co 
         WHERE co.farmer_id = $1) AS total_items_sold,
        (SELECT COALESCE(SUM(co.volume), 0) FROM crop_orders co 
         WHERE co.farmer_id = $1) AS total_volume_sold
    `, [user_id])

    const cropsByFarm = await db.query(`
      SELECT 
        f.farm_name,
        COUNT(cf.crop_id) AS crop_count,
        COALESCE(SUM(cf.stock), 0) AS total_stock,
        COALESCE(SUM(cf.volume), 0) AS total_volume
      FROM farm f
      LEFT JOIN crop_in_farm cf ON f.farm_id = cf.farm_id
      WHERE f.user_id = $1
      GROUP BY f.farm_id, f.farm_name
      ORDER BY crop_count DESC
    `, [user_id])

    const recentOrders = await db.query(`
      SELECT 
        co.crop_order_id,
        co.order_date,
        co.quantity,
        co.volume,
        co.expected_arrival,
        c.crop_name,
        c.variety,
        u.firstname || ' ' || u.lastname AS buyer_name
      FROM crop_orders co
      JOIN crop_in_farm c ON co.crop_id = c.crop_id
      JOIN users u ON co.user_id = u.user_id
      WHERE co.farmer_id = $1
      ORDER BY co.order_date DESC
      LIMIT 10
    `, [user_id])

    const ordersByMonth = await db.query(`
      SELECT 
        TO_CHAR(co.order_date, 'YYYY-MM') AS month,
        COUNT(*) AS order_count,
        COALESCE(SUM(co.quantity), 0) AS total_quantity,
        COALESCE(SUM(co.volume), 0) AS total_volume
      FROM crop_orders co
      WHERE co.farmer_id = $1
        AND co.order_date >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(co.order_date, 'YYYY-MM')
      ORDER BY month
    `, [user_id])

    const topCrops = await db.query(`
      SELECT 
        c.crop_name,
        c.variety,
        c.stock,
        c.volume,
        COUNT(co.crop_order_id) AS order_count,
        COALESCE(SUM(co.quantity), 0) AS times_ordered
      FROM crop_in_farm c
      LEFT JOIN crop_orders co ON c.crop_id = co.crop_id
      WHERE c.farm_id IN (SELECT farm_id FROM farm WHERE user_id = $1)
      GROUP BY c.crop_id, c.crop_name, c.variety, c.stock, c.volume
      ORDER BY order_count DESC
      LIMIT 5
    `, [user_id])

    return res.status(200).json({
      success: true,
      data: {
        totals: totals.rows[0],
        cropsByFarm: cropsByFarm.rows,
        recentOrders: recentOrders.rows,
        ordersByMonth: ordersByMonth.rows,
        topCrops: topCrops.rows,
      }
    })
  } catch (error) {
    console.error("Farmer Dashboard Stats Error:", error)
    return res.status(500).json({ success: false, message: error.message })
  }
}