import { db } from '../db.js'

export const getAllCrops = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT 
        c.*,
        f.farm_name,
        f.farm_location,
        f.gps_coordinates,
        f.farm_area,
        f.farm_elevation,
        f.province,
        f.municipality,
        f.barangay,
        f.user_id AS farmer_id,
        s.specification_1_name, s.specification_1_value,
        s.specification_2_name, s.specification_2_value,
        s.specification_3_name, s.specification_3_value,
        s.specification_4_name, s.specification_4_value,
        s.specification_5_name, s.specification_5_value,
        s.specification_6_name, s.specification_6_value,
        s.specification_7_name, s.specification_7_value,
        s.specification_8_name, s.specification_8_value
      FROM crop_in_farm c
      INNER JOIN farm f ON c.farm_id = f.farm_id
      LEFT JOIN crop_specifications s ON c.crop_id = s.crop_id
      ORDER BY c.crop_id DESC
    `)
    res.status(200).json({ crops: rows.rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getAllFarms = async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT 
        f.*,
        u.firstname,
        u.lastname,
        u.email
      FROM farm f
      LEFT JOIN farmer u ON f.user_id = u.user_id
      ORDER BY f.farm_id DESC
    `)
    res.status(200).json({ farms: rows.rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getFarmById = async (req, res) => {
  const { farmId } = req.params

  if (!farmId || isNaN(farmId)) {
    return res.status(400).json({ message: 'Invalid farm ID' })
  }

  try {
    const rows = await db.query(`
      SELECT 
        f.*,
        u.firstname,
        u.lastname,
        u.email
      FROM farm f
      LEFT JOIN farmer u ON f.user_id = u.user_id
      WHERE f.farm_id = $1
    `, [farmId])
    
    if (rows.rows.length === 0) {
      return res.status(404).json({ message: 'Farm not found' })
    }
    
    res.status(200).json({ farm: rows.rows[0] })
  } catch (error) {
    console.error('Error fetching farm:', error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getCropsByFarmId = async (req, res) => {
  const { farmId } = req.params

  if (!farmId || isNaN(farmId)) {
    return res.status(400).json({ message: 'Invalid farm ID' })
  }

  try {
    const rows = await db.query(`
      SELECT 
        c.*,
        f.farm_name,
        f.farm_location,
        f.gps_coordinates,
        f.farm_area,
        f.farm_elevation,
        f.province,
        f.municipality,
        f.barangay,
        f.user_id AS farmer_id,
        s.specification_1_name, s.specification_1_value,
        s.specification_2_name, s.specification_2_value,
        s.specification_3_name, s.specification_3_value,
        s.specification_4_name, s.specification_4_value,
        s.specification_5_name, s.specification_5_value,
        s.specification_6_name, s.specification_6_value,
        s.specification_7_name, s.specification_7_value,
        s.specification_8_name, s.specification_8_value
      FROM crop_in_farm c
      INNER JOIN farm f ON c.farm_id = f.farm_id
      LEFT JOIN crop_specifications s ON c.crop_id = s.crop_id
      WHERE c.farm_id = $1
      ORDER BY c.crop_id DESC
    `, [farmId])
    res.status(200).json({ crops: rows.rows })
  } catch (error) {
    console.error('Error fetching crops:', error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}