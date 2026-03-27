import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

// Email validation regex
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation - Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Email and password are required`,
      })
    }

    // Trim whitespace
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    // Email format validation
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
    }

    // Password length validation
    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    // Get database connection
    const connection = await db.getConnection()

    try {
      // Check if user exists
      const [rows] = await connection.query(
        'SELECT user_id, rsbsa_number, email, password, firstname, lastname, address, contact_number, role, created_at FROM users WHERE email = ?',
        [trimmedEmail]
      )

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        })
      }

      const user = rows[0]

      // Check password
      const isPasswordMatch = await bcrypt.compare(trimmedPassword, user.password)

      if (!isPasswordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        })
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          user_id: user.user_id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      )

      // Return user data and token (excluding password)
      const { password: _, ...userWithoutPassword } = user

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user_id

    const connection = await db.getConnection()

    try {
      const [rows] = await connection.query(
        'SELECT user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at FROM users WHERE user_id = ?',
        [userId]
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      res.status(200).json({
        success: true,
        user: rows[0],
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred',
    })
  }
}

export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  })
}

export const register = async (req, res) => {
  try {
    const { rsbsa_num, email, password, firstname, lastname, contact_number, address, role } = req.body

    // Validation - Required fields
    if (!email || !password || !firstname || !lastname || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, firstname, lastname, and role are required',
      })
    }

    // RSBSA is required only for farmers
    if (role === 'farmer' && !rsbsa_num) {
      return res.status(400).json({
        success: false,
        message: 'RSBSA Number is required for farmers',
      })
    }

    // Validate role
    const validRoles = ['user', 'farmer']
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Role must be either "user" or "farmer"',
      })
    }

    // Trim whitespace
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedFirstname = firstname.trim()
    const trimmedLastname = lastname.trim()
    const trimmedRsbsa = rsbsa_num ? rsbsa_num.trim() : null

    // Validate RSBSA format only for farmers (should be XX-XXX-XX-XXX-XXXXXX)
    if (role === 'farmer' && trimmedRsbsa) {
      const rsbsaRegex = /^\d{2}-\d{3}-\d{2}-\d{3}-\d{6}$/
      if (!rsbsaRegex.test(trimmedRsbsa)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid RSBSA format. Please enter a valid RSBSA number',
        })
      }
    }

    // Email format validation
    if (!isValidEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
    }

    // Password length validation
    if (trimmedPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      })
    }

    // Get database connection
    const connection = await db.getConnection()

    try {
      // Check if user already exists
      const [existingUser] = await connection.query(
        'SELECT * FROM users WHERE email = ?',
        [trimmedEmail]
      )

      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(trimmedPassword, 10)

      // Insert new user with RSBSA number (with dashes) and selected role
      const [insertResult] = await connection.query(
        'INSERT INTO users (rsbsa_number, email, password, firstname, lastname, address, contact_number, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [trimmedRsbsa, trimmedEmail, hashedPassword, trimmedFirstname, trimmedLastname, address || null, contact_number || null, role]
      )

      const userId = insertResult.insertId

      // Fetch the newly created user
      const [newUser] = await connection.query(
        'SELECT user_id, rsbsa_number, email, firstname, lastname, address, contact_number, role, created_at FROM users WHERE user_id = ?',
        [userId]
      )

      // Generate JWT token
      const token = jwt.sign(
        { 
          user_id: newUser[0].user_id, 
          email: newUser[0].email, 
          role: newUser[0].role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      )

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: newUser[0],
        token,
      })
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
    })
  }
}
