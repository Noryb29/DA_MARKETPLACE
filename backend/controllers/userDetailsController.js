import { db } from '../db.js'

export const getUserDetails = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM user_details WHERE user_id = $1',
      [req.user.user_id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User details not found' })
    }
    res.status(200).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Get user details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const createUserDetails = async (req, res) => {
  try {
    const { profile_picture, bio, gender, date_of_birth } = req.body
    const user_id = req.user.user_id

    const existing = await db.query(
      'SELECT detail_id FROM user_details WHERE user_id = $1',
      [user_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User details already exist' })
    }

    const result = await db.query(
      `INSERT INTO user_details (user_id, profile_picture, bio, gender, date_of_birth)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, profile_picture || null, bio || null, gender || null, date_of_birth || null]
    )

    res.status(201).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Create user details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const updateUserDetails = async (req, res) => {
  try {
    const { profile_picture, bio, gender, date_of_birth } = req.body
    const user_id = req.user.user_id

    const result = await db.query(
      `UPDATE user_details 
       SET profile_picture = COALESCE($1, profile_picture),
           bio = COALESCE($2, bio),
           gender = COALESCE($3, gender),
           date_of_birth = COALESCE($4, date_of_birth),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [profile_picture, bio, gender, date_of_birth, user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User details not found' })
    }

    res.status(200).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Update user details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const getFarmerDetails = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM farmer_details WHERE user_id = $1',
      [req.user.user_id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer details not found' })
    }
    res.status(200).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Get farmer details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const createFarmerDetails = async (req, res) => {
  try {
    const { profile_picture, bio, gender, date_of_birth, farm_name, farm_location, total_area_hectares, farming_type } = req.body
    const user_id = req.user.user_id

    const existing = await db.query(
      'SELECT detail_id FROM farmer_details WHERE user_id = $1',
      [user_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Farmer details already exist' })
    }

    const result = await db.query(
      `INSERT INTO farmer_details (user_id, profile_picture, bio, gender, date_of_birth, farm_name, farm_location, total_area_hectares, farming_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_id, profile_picture || null, bio || null, gender || null, date_of_birth || null, farm_name || null, farm_location || null, total_area_hectares || null, farming_type || null]
    )

    res.status(201).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Create farmer details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const updateFarmerDetails = async (req, res) => {
  try {
    const { profile_picture, bio, gender, date_of_birth, farm_name, farm_location, total_area_hectares, farming_type } = req.body
    const user_id = req.user.user_id

    const result = await db.query(
      `UPDATE farmer_details 
       SET profile_picture = COALESCE($1, profile_picture),
           bio = COALESCE($2, bio),
           gender = COALESCE($3, gender),
           date_of_birth = COALESCE($4, date_of_birth),
           farm_name = COALESCE($5, farm_name),
           farm_location = COALESCE($6, farm_location),
           total_area_hectares = COALESCE($7, total_area_hectares),
           farming_type = COALESCE($8, farming_type),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $9
       RETURNING *`,
      [profile_picture, bio, gender, date_of_birth, farm_name, farm_location, total_area_hectares, farming_type, user_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer details not found' })
    }

    res.status(200).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Update farmer details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}