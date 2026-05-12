import { db } from '../db.js'
import fs from 'fs'
import path from 'path'

const handleFileUpload = (req) => {
  if (req.file) {
    return fs.readFileSync(req.file.path)
  }
  return null
}

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
    const { bio, gender, date_of_birth } = req.body
    const user_id = req.user.user_id

    const existing = await db.query(
      'SELECT detail_id FROM user_details WHERE user_id = $1',
      [user_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User details already exist' })
    }

    const profilePictureData = handleFileUpload(req)

    const result = await db.query(
      `INSERT INTO user_details (user_id, profile_picture, profile_picture_data, bio, gender, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, null, profilePictureData, bio || null, gender || null, date_of_birth || null]
    )

    res.status(201).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Create user details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const updateUserDetails = async (req, res) => {
  try {
    const { bio, gender, date_of_birth } = req.body
    const user_id = req.user.user_id

    const profilePictureData = handleFileUpload(req)

    let query = `
       UPDATE user_details
       SET bio = COALESCE($1, bio),
           gender = COALESCE($2, gender),
           date_of_birth = COALESCE($3, date_of_birth),
           updated_at = CURRENT_TIMESTAMP
    `
    const params = [bio, gender, date_of_birth]

    if (profilePictureData) {
      query += `, profile_picture = null, profile_picture_data = $${params.length + 1}`
      params.push(profilePictureData)
    }

    query += ` WHERE user_id = $${params.length + 1} RETURNING *`
    params.push(user_id)

    const result = await db.query(query, params)

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
    const { gender, age, farmer_organization, date_of_birth } = req.body
    const user_id = req.user.user_id

    const existing = await db.query(
      'SELECT detail_id FROM farmer_details WHERE user_id = $1',
      [user_id]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Farmer details already exist' })
    }

    const profilePictureData = handleFileUpload(req)

    const result = await db.query(
      `INSERT INTO farmer_details (user_id, profile_picture, profile_picture_data, gender, age, farmer_organization, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, null, profilePictureData, gender || null, age || null, farmer_organization || null, date_of_birth || null]
    )

    res.status(201).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Create farmer details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const updateFarmerDetails = async (req, res) => {
  try {
    const { gender, age, farmer_organization, date_of_birth } = req.body
    const user_id = req.user.user_id

    const profilePictureData = handleFileUpload(req)

    let query = `
       UPDATE farmer_details
       SET gender = COALESCE($1, gender),
           age = COALESCE($2, age),
           farmer_organization = COALESCE($3, farmer_organization),
           date_of_birth = COALESCE($4, date_of_birth),
           updated_at = CURRENT_TIMESTAMP
    `
    const params = [gender, age, farmer_organization, date_of_birth]

    if (profilePictureData) {
      query += `, profile_picture = null, profile_picture_data = $${params.length + 1}`
      params.push(profilePictureData)
    }

    query += ` WHERE user_id = $${params.length + 1} RETURNING *`
    params.push(user_id)

    const result = await db.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer details not found' })
    }

    res.status(200).json({ success: true, details: result.rows[0] })
  } catch (error) {
    console.error('Update farmer details error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}