import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const registerUser = async (req, res) => {
  try {
    const { email, password, firstname, lastname, contact_number, address } = req.body

    if (!email || !password || !firstname || !lastname)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    if (password.trim().length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

    const existing = await db.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email.trim()]
    )
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered' })

    const hashedPassword = await bcrypt.hash(password.trim(), 10)

    const result = await db.query(
      `INSERT INTO users (email, password, firstname, lastname, address, contact_number, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'user')
       RETURNING user_id, email, firstname, lastname, address, contact_number, role, created_at`,
      [email.trim(), hashedPassword, firstname.trim(), lastname.trim(), address || null, contact_number || null]
    )

    const newUser = result.rows[0]

    const token = jwt.sign(
      { user_id: newUser.user_id, email: newUser.email, role: 'user' },
      process.env.JWT_SECRET_USER,
      { expiresIn: '7d' }
    )

    res.status(201).json({ success: true, user: newUser, token })
  } catch (error) {
    console.error('User register error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during registration' })
  }
}

export const registerFarmer = async (req, res) => {
  try {
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

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    const rows = await db.query(
      `SELECT user_id, email, password, firstname, lastname, address, contact_number, role, created_at
       FROM users WHERE email = $1 AND (role = 'user' OR role = 'admin')`,
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
      process.env.JWT_SECRET_USER,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user
    res.status(200).json({ success: true, user: userWithoutPassword, token })
  } catch (error) {
    console.error('User login error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during login' })
  }
}

export const loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

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

export const getCurrentUser = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT user_id, email, firstname, lastname, address, contact_number, role, created_at
       FROM users WHERE user_id = $1 AND (role = 'user' OR role = 'admin')`,
      [req.user.user_id]
    )
    if (rows.rows.length === 0)
      return res.status(404).json({ success: false, message: 'User not found' })

    res.status(200).json({ success: true, user: rows.rows[0] })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const getCurrentFarmer = async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at
       FROM farmer WHERE user_id = $1 AND role = 'farmer'`,
      [req.user.user_id]
    )
    if (rows.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Farmer not found' })

    res.status(200).json({ success: true, user: rows.rows[0] })
  } catch (error) {
    console.error('Get current farmer error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

export const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' })
}