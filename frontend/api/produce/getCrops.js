import { db } from '../../db.js'
import jwt from 'jsonwebtoken'

const verifyToken = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw new Error('Unauthorized')
  const token = authHeader.split(' ')[1]
  return jwt.verify(token, process.env.JWT_SECRET_FARMER)
}

export default async function handler(req, res) {
  let user
  try {
    user = verifyToken(req)
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }

  const user_id = user.user_id
  const { crop_name, variety, volume, stock, specification_1, specification_2, specification_3, specification_4, specification_5, planting_date, expected_harvest } = req.body

  if (req.method === 'GET') {
    try {
      const rows = await db.query(
        `SELECT c.* FROM crop_in_farm c
         INNER JOIN farm f ON c.farm_id = f.farm_id
         WHERE f.user_id = $1
         ORDER BY c.crop_id DESC`,
        [user_id]
      )
      res.status(200).json({ crops: rows.rows })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Database error', error: error.message })
    }
  } else if (req.method === 'POST') {
    if (!crop_name) return res.status(400).json({ message: 'Crop name is required.' })

    try {
      const farms = await db.query(`SELECT farm_id FROM farm WHERE user_id = $1 LIMIT 1`, [user_id])
      if (farms.rows.length === 0) return res.status(404).json({ message: 'No farm found. Please register a farm first.' })

      const farm_id = farms.rows[0].farm_id
      const result = await db.query(
        `INSERT INTO crop_in_farm (
            farm_id, crop_name, variety, volume, stock,
            specification_1, specification_2, specification_3, specification_4, specification_5,
            planting_date, expected_harvest
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING crop_id`,
        [farm_id, crop_name, variety || null, volume || null, stock || null,
         specification_1 || null, specification_2 || null, specification_3 || null,
         specification_4 || null, specification_5 || null,
         planting_date || null, expected_harvest || null]
      )

      res.status(201).json({ message: 'Crop added successfully', cropId: result.rows[0].crop_id })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Database error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}