import { db } from '../../db.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const rows = await db.query(`
        SELECT 
          c.*,
          f.farm_name,
          f.gps_coordinates,
          f.farm_area,
          f.farm_elevation,
          f.user_id AS farmer_id
        FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        ORDER BY c.crop_id DESC`
      )
      res.status(200).json({ crops: rows.rows })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Database error', error: error.message })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}