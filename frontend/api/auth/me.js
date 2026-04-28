import jwt from 'jsonwebtoken'
import { db } from '../../db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authorization header missing or malformed' })

  const token = authHeader.split(' ')[1]
  if (!process.env.JWT_SECRET_USER)
    return res.status(500).json({ message: 'Server configuration error' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER)

    if (decoded.role !== 'user' && decoded.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Invalid Role detected' })

    const rows = await db.query(
      `SELECT user_id, email, firstname, lastname, address, contact_number, role, created_at
       FROM users WHERE user_id = $1 AND (role = 'user' OR role = 'admin')`,
      [decoded.user_id]
    )
    if (rows.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found' })

    res.status(200).json({ success: true, user: rows.rows[0] })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}