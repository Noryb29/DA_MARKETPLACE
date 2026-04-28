import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../../db.js'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' })

  if (!isValidEmail(email.trim()))
    return res.status(400).json({ success: false, message: 'Invalid email address' })

  try {
    const rows = await db.query(
      `SELECT user_id, rsbsa_number, email, password, firstname, lastname, address, contact_number, role, created_at
       FROM farmer WHERE email = $1 AND role = 'farmer'`,
      [email.trim()]
    )

    if (rows.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const user = rows.rows[0]
    const isMatch = await bcrypt.compare(password.trim(), user.password)
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' })

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET_FARMER,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user
    res.status(200).json({ success: true, user: userWithoutPassword, token })
  } catch (error) {
    console.error('Farmer login error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during login' })
  }
}