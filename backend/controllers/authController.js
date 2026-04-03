import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// ─── USER REGISTER ────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { email, password, firstname, lastname, contact_number, address } = req.body

    if (!email || !password || !firstname || !lastname)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    if (password.trim().length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })

    const connection = await db.getConnection()
    try {
      const [existing] = await connection.query(
        'SELECT user_id FROM users WHERE email = ?',
        [email.trim()]
      )
      if (existing.length > 0)
        return res.status(400).json({ success: false, message: 'Email already registered' })

      const hashedPassword = await bcrypt.hash(password.trim(), 10)

      const [result] = await connection.query(
        `INSERT INTO users (email, password, firstname, lastname, address, contact_number, role)
         VALUES (?, ?, ?, ?, ?, ?, 'user')`,
        [email.trim(), hashedPassword, firstname.trim(), lastname.trim(), address || null, contact_number || null]
      )

      const [newUser] = await connection.query(
        `SELECT user_id, email, firstname, lastname, address, contact_number, role, created_at
         FROM users WHERE user_id = ?`,
        [result.insertId]
      )

      const token = jwt.sign(
        { user_id: newUser[0].user_id, email: newUser[0].email, role: 'user' },
        process.env.JWT_SECRET_USER,
        { expiresIn: '7d' }
      )

      res.status(201).json({ success: true, user: newUser[0], token })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('User register error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during registration' })
  }
}

// ─── FARMER REGISTER ──────────────────────────────────────────────────────────
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

    const connection = await db.getConnection()
    try {
      const [existing] = await connection.query(
        'SELECT user_id FROM farmer WHERE email = ?',
        [email.trim()]
      )
      if (existing.length > 0)
        return res.status(400).json({ success: false, message: 'Email already registered' })

      const hashedPassword = await bcrypt.hash(password.trim(), 10)

      const [result] = await connection.query(
        `INSERT INTO farmer (rsbsa_number, email, password, firstname, lastname, address, contact_number, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'farmer')`,
        [rsbsa_num.trim(), email.trim(), hashedPassword, firstname.trim(), lastname.trim(), address || null, contact_number || null]
      )

      const [newUser] = await connection.query(
        `SELECT user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at
         FROM farmer WHERE user_id = ?`,
        [result.insertId]
      )

      const token = jwt.sign(
        { user_id: newUser[0].user_id, email: newUser[0].email, role: 'farmer' },
        process.env.JWT_SECRET_FARMER,
        { expiresIn: '7d' }
      )

      res.status(201).json({ success: true, user: newUser[0], token })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Farmer register error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during registration' })
  }
}

// ─── USER LOGIN ───────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    const connection = await db.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT user_id, email, password, firstname, lastname, address, contact_number, role, created_at
         FROM users WHERE email = ? AND (role = 'user' OR role = 'admin')`,
        [email.trim()]
      )

      if (rows.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid email or password' })

      const user = rows[0]
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
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('User login error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during login' })
  }
}

// ─── FARMER LOGIN ─────────────────────────────────────────────────────────────
export const loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' })

    if (!isValidEmail(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    const connection = await db.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT user_id, rsbsa_number, email, password, firstname, lastname, address, contact_number, role, created_at
         FROM farmer WHERE email = ? AND role = 'farmer'`,
        [email.trim()]
      )

      if (rows.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid email or password' })

      const user = rows[0]
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
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Farmer login error:', error)
    res.status(500).json({ success: false, message: 'An error occurred during login' })
  }
}

// ─── GET CURRENT USER → /api/auth/me (UserStore) ─────────────────────────────
export const getCurrentUser = async (req, res) => {
  try {
    const connection = await db.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT user_id, email, firstname, lastname, address, contact_number, role, created_at
         FROM users WHERE user_id = ? AND (role = 'user' OR role = 'admin')`,
        [req.user.user_id]
      )
      if (rows.length === 0)
        return res.status(404).json({ success: false, message: 'User not found' })

      res.status(200).json({ success: true, user: rows[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

// ─── GET CURRENT FARMER → /api/auth/farmer/me (FarmerAuthStore) ──────────────
export const getCurrentFarmer = async (req, res) => {
  try {
    const connection = await db.getConnection()
    try {
      const [rows] = await connection.query(
        `SELECT user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at
         FROM farmer WHERE user_id = ? AND role = 'farmer'`,
        [req.user.user_id]
      )
      if (rows.length === 0)
        return res.status(404).json({ success: false, message: 'Farmer not found' })

      res.status(200).json({ success: true, user: rows[0] })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get current farmer error:', error)
    res.status(500).json({ success: false, message: 'An error occurred' })
  }
}

// ─── LOGOUT (stateless — just a confirmation) ─────────────────────────────────
export const logout = (req, res) => {
  res.status(200).json({ success: true, message: 'Logout successful' })
}