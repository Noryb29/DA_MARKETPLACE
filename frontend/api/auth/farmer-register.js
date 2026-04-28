import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../../db.js'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, firstname, lastname, contact_number, address, rsbsa_num } = req.body

  if (!email || !password || !firstname || !lastname || !rsbsa_num)
    return res.status(400).json({ success: false, message: 'All required fields including RSBSA must be filled' })

  if (!isValidEmail(email.trim()))
    return res.status(400).json({ success: false, message: 'Invalid email address' })

  if (password.trim().length < 6)
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

  const rsbsaRegex = /^\d{2}-\d{3}-\d{2}-\d{3}-\d{6}$/
  if (!rsbsaRegex.test(rsbsa_num.trim()))
    return res.status(400).json({ success: false, message: 'Invalid RSBSA format (XX-XXX-XX-XXX-XXXXXX)' })

  try {
    const existing = await db.query(
      'SELECT user_id FROM farmer WHERE email = $1',
      [email.trim()]
    )
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password.trim(), 10)

    const result = await db.query(
      `INSERT INTO farmer (rsbsa_number, email, password, firstname, lastname, address, contact_number, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'farmer')
       RETURNING user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at`,
      [rsbsa_num.trim(), email.trim(), hashedPassword, firstname.trim(), lastname.trim(), address || null, contact_number || null]
    )

    const newUser = result.rows[0]

    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email, role: 'farmer' },
      process.env.JWT_SECRET_FARMER,
      { expiresIn: '7d' }
    )

    res.status(201).json({ success: true, user: newUser, token })
  } catch (error) {
    console.error('Farmer register error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during registration' })
  }
}