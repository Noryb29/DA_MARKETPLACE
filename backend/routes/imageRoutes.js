import express from 'express'
import { db } from '../db.js'

export const imageRouter = express.Router()

const serveImage = async (req, res, table, idParam, dataCol, pathCol) => {
  const id = req.params[idParam]
  try {
    const result = await db.query(
      `SELECT ${dataCol}, ${pathCol} FROM ${table} WHERE ${idParam} = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Not found' })
    }
    const row = result.rows[0]
    console.log('serveImage row:', { dataCol, hasData: !!row[dataCol], dataType: typeof row[dataCol], pathCol, hasPath: !!row[pathCol] })
    if (row[dataCol]) {
      res.set('Content-Type', 'image/jpeg')
      res.set('Cache-Control', 'public, max-age=31536000')
      res.send(row[dataCol])
    } else if (row[pathCol]) {
      res.redirect(row[pathCol])
    } else {
      res.status(404).json({ message: 'No image found' })
    }
  } catch (error) {
    console.error('Error serving image:', error)
    res.status(500).json({ message: 'Database error', error: error.message })
  }
}

imageRouter.get('/farm/:farmId', (req, res) => serveImage(req, res, 'farm', 'farm_id', 'farm_image_data', 'farm_image'))
imageRouter.get('/crop/:cropId', (req, res) => serveImage(req, res, 'crop_in_farm', 'crop_id', 'harvest_photo_data', 'harvest_photo'))
imageRouter.get('/user/:userId', (req, res) => serveImage(req, res, 'user_details', 'user_id', 'profile_picture_data', 'profile_picture'))
imageRouter.get('/farmer/:farmerId', (req, res) => serveImage(req, res, 'farmer_details', 'user_id', 'profile_picture_data', 'profile_picture'))
