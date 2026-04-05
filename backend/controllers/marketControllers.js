import { db } from '../db.js'

export const getAllCrops = async (req, res) => {
  const query = `
    SELECT 
      c.*,
      f.farm_name,
      f.gps_coordinates,
      f.farm_area,
      f.farm_elevation,
      f.user_id AS farmer_id
    FROM crop_in_farm c
    INNER JOIN farm f ON c.farm_id = f.farm_id
    ORDER BY c.crop_id DESC
  `
  try {
    const [rows] = await db.execute(query)
    res.status(200).json({ crops: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getAllFarms = async (req, res) => {
  const query = `
    SELECT 
      f.*,
      u.firstname,
      u.lastname,
      u.email
    FROM farm f
    LEFT JOIN users u ON f.user_id = u.user_id
    ORDER BY f.farm_id DESC
  `
  try {
    const [rows] = await db.execute(query)
    res.status(200).json({ farms: rows })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getFarmById = async (req, res) => {
  const { farmId } = req.params
  
  // Validate farmId
  if (!farmId || isNaN(farmId)) {
    return res.status(400).json({ message: 'Invalid farm ID' })
  }

  const query = `
    SELECT 
      f.*,
      u.firstname,
      u.lastname,
      u.email
    FROM farm f
    LEFT JOIN users u ON f.user_id = u.user_id
    WHERE f.farm_id = ?
  `
  try {
    const [rows] = await db.execute(query, [farmId])
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Farm not found' })
    }
    
    res.status(200).json({ farm: rows[0] })
  } catch (error) {
    console.error('Error fetching farm:', error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

export const getCropsByFarmId = async (req, res) => {
  const { farmId } = req.params
  
  // Validate farmId
  if (!farmId || isNaN(farmId)) {
    return res.status(400).json({ message: 'Invalid farm ID' })
  }

  const query = `
    SELECT 
      c.*,
      f.farm_name,
      f.gps_coordinates,
      f.farm_area,
      f.farm_elevation,
      f.user_id AS farmer_id
    FROM crop_in_farm c
    INNER JOIN farm f ON c.farm_id = f.farm_id
    WHERE c.farm_id = ?
    ORDER BY c.crop_id DESC
  `
  try {
    const [rows] = await db.execute(query, [farmId])
    res.status(200).json({ crops: rows })
  } catch (error) {
    console.error('Error fetching crops:', error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}