import { db } from '../../db.js'
import jwt from 'jsonwebtoken'

const verifyToken = (req, secret) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new Error('Unauthorized')
  const token = authHeader.split(' ')[1]
  return jwt.verify(token, secret)
}

export default async function handler(req, res) {
  const url = req.url

  if (url.startsWith('/placeOrder') || url.startsWith('/getMyOrders')) {
    let user
    try {
      user = verifyToken(req, process.env.JWT_SECRET_USER)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (req.method === 'POST' && url === '/placeOrder') {
      const { items } = req.body
      if (!items || items.length === 0)
        return res.status(400).json({ message: 'No items in order.' })

      try {
        const insertions = items.map(item =>
          db.query(
            `INSERT INTO crop_orders (crop_id, user_id, order_date, quantity, volume, farmer_id, farm_id, expected_arrival)
             VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)`,
            [item.crop_id, user.user_id, item.quantity, item.volume,
             item.farmer_id, item.farm_id, item.expected_arrival || null]
          )
        )
        await Promise.all(insertions)
        res.status(201).json({ message: 'Order placed successfully.' })
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
      }
    } else if (req.method === 'GET' && url === '/getMyOrders') {
      try {
        const rows = await db.query(
          `SELECT 
              co.*,
              c.crop_name, c.variety,
              c.specification_1, c.specification_2, c.specification_3,
              c.specification_4, c.specification_5,
              c.planting_date, c.expected_harvest,
              f.farm_name, f.gps_coordinates,
              fa.firstname AS farmer_first_name,
              fa.lastname  AS farmer_last_name
          FROM crop_orders co
          LEFT JOIN crop_in_farm   c  ON co.crop_id   = c.crop_id
          LEFT JOIN farm    f  ON co.farm_id   = f.farm_id
          LEFT JOIN farmer fa ON co.farmer_id = fa.user_id
          WHERE co.user_id = $1
          ORDER BY co.order_date DESC`,
          [user.user_id]
        )
        res.status(200).json({ orders: rows.rows })
      } catch (error) {
        console.error('getMyOrders error:', error.message)
        res.status(500).json({ message: 'Database error', error: error.message })
      }
    }
  } else if (url.startsWith('/getFarmerOrders')) {
    let user
    try {
      user = verifyToken(req, process.env.JWT_SECRET_FARMER)
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (req.method === 'GET') {
      try {
        const rows = await db.query(
          `SELECT 
              co.*,
              c.crop_name, c.variety,
              c.specification_1, c.specification_2, c.specification_3,
              c.specification_4, c.specification_5,
              f.farm_name,
              u.firstname AS buyer_first_name,
              u.lastname  AS buyer_last_name
          FROM crop_orders co
          LEFT JOIN crop_in_farm  c ON co.crop_id  = c.crop_id
          LEFT JOIN farm   f ON co.farm_id  = f.farm_id
          LEFT JOIN users  u ON co.user_id  = u.user_id
          WHERE co.farmer_id = $1
          ORDER BY co.order_date DESC`,
          [user.user_id]
        )
        res.status(200).json({ orders: rows.rows })
      } catch (error) {
        console.error('getFarmerOrders error:', error.message)
        res.status(500).json({ message: 'Database error', error: error.message })
      }
    }
  } else {
    res.status(404).json({ message: 'Not found' })
  }
}