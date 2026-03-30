import { db } from '../db.js'

export const getAllCrops = async (req, res) => {
    const query = `
        SELECT 
            c.*,
            f.farm_name,
            f.gps_coordinates,
            f.farm_area,
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