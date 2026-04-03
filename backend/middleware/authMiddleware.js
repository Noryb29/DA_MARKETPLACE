import jwt from 'jsonwebtoken'

// ─── User middleware ──────────────────────────────────────────────────────────
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization header missing or malformed' })

    const token = authHeader.split(' ')[1]
    if (!process.env.JWT_SECRET_USER)
      throw new Error('JWT_SECRET_USER is not defined')

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER)

    if (decoded.role !== 'user' && decoded.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Invalid Role detected' })

    req.user = decoded
    next()
  } catch (error) {
    if (error.message === 'JWT_SECRET_USER is not defined')
      return res.status(500).json({ message: 'Server configuration error' })
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ─── Farmer middleware ────────────────────────────────────────────────────────
export const farmerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization header missing or malformed' })

    const token = authHeader.split(' ')[1]
    if (!process.env.JWT_SECRET_FARMER)
      throw new Error('JWT_SECRET_FARMER is not defined')

    const decoded = jwt.verify(token, process.env.JWT_SECRET_FARMER)

    if (decoded.role !== 'farmer')
      return res.status(403).json({ message: 'Access denied. Farmer account required.' })

    req.user = decoded
    next()
  } catch (error) {
    if (error.message === 'JWT_SECRET_FARMER is not defined')
      return res.status(500).json({ message: 'Server configuration error' })
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ─── Either role (for shared routes like getCurrentUser) ──────────────────────
export const anyAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization header missing or malformed' })

    const token = authHeader.split(' ')[1]

    // Try user secret first, then farmer secret
    let decoded = null
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_USER)
    } catch {
      decoded = jwt.verify(token, process.env.JWT_SECRET_FARMER)
    }

    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

// ─── Admin middleware ─────────────────────────────────────────────────────────
// Accepts admin users from JWT_SECRET_USER (admin role in users table)
export const adminAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'Authorization header missing or malformed' })

    const token = authHeader.split(' ')[1]
    if (!process.env.JWT_SECRET_USER)
      throw new Error('JWT_SECRET_USER is not defined')

    const decoded = jwt.verify(token, process.env.JWT_SECRET_USER)

    // Check if role is admin
    if (decoded.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admin account required.' })

    req.user = decoded
    next()
  } catch (error) {
    if (error.message === 'JWT_SECRET_USER is not defined')
      return res.status(500).json({ message: 'Server configuration error' })
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}