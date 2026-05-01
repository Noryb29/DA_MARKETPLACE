import { db } from '../db.js'
import fs from 'fs'
import path from 'path'

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const rows = await db.query(
            `SELECT c.* FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             WHERE f.user_id = $1
             ORDER BY c.crop_id DESC`,
            [user_id]
        );
        res.status(200).json({ crops: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const addCrop = async (req, res) => {
    const user_id = req.user.user_id;
    const {
        crop_name, variety, volume, stock,
        specification_1, specification_2, specification_3,
        specification_4, specification_5,
        maturity_days, expected_volume,
        planting_date, expected_harvest, actual_harvest, total_harvest,
        location
    } = req.body;

    if (!crop_name) return res.status(400).json({ message: "Crop name is required." });

    let harvest_photo = null;
    if (req.file) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'harvest_photos')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const ext = path.extname(req.file.originalname) || '.jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
        const filepath = path.join(uploadsDir, filename)
        fs.renameSync(req.file.path, filepath)
        harvest_photo = `/uploads/harvest_photos/${filename}`
    }

    try {
        const farms = await db.query(`SELECT farm_id FROM farm WHERE user_id = $1 LIMIT 1`, [user_id]);
        if (farms.rows.length === 0) return res.status(404).json({ message: "No farm found. Please register a farm first." });

        const farm_id = farms.rows[0].farm_id;
        const result = await db.query(
            `INSERT INTO crop_in_farm (
                farm_id, crop_name, variety, volume, stock,
                specification_1, specification_2, specification_3, specification_4, specification_5,
                maturity_days, expected_volume,
                planting_date, expected_harvest, actual_harvest, total_harvest,
                harvest_photo, location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING crop_id`,
            [farm_id, crop_name, variety || null, volume || null, stock || null,
             specification_1 || null, specification_2 || null, specification_3 || null,
             specification_4 || null, specification_5 || null,
             maturity_days || null, expected_volume || null,
             planting_date || null, expected_harvest || null, actual_harvest || null, total_harvest || null,
             harvest_photo, location || null]
        );

        res.status(201).json({ message: "Crop added successfully", cropId: result.rows[0].crop_id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const updateCrop = async (req, res) => {
    const user_id = req.user.user_id;
    const { crop_id } = req.params;
    const {
        crop_name, variety, volume, stock,
        specification_1, specification_2, specification_3,
        specification_4, specification_5,
        maturity_days, expected_volume,
        planting_date, expected_harvest, actual_harvest, total_harvest,
        location
    } = req.body;

    let harvest_photo = null;
    if (req.file) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'harvest_photos')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const ext = path.extname(req.file.originalname) || '.jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
        const filepath = path.join(uploadsDir, filename)
        fs.renameSync(req.file.path, filepath)
        harvest_photo = `/uploads/harvest_photos/${filename}`
    }

    try {
        const rows = await db.query(
            `SELECT c.crop_id, c.harvest_photo FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             WHERE c.crop_id = $1 AND f.user_id = $2`,
            [crop_id, user_id]
        );
        if (rows.rows.length === 0) return res.status(403).json({ message: "Unauthorized or crop not found." });

        const currentPhoto = rows.rows[0].harvest_photo
        const finalPhoto = harvest_photo || (req.body.harvest_photo === '' ? null : currentPhoto)

        await db.query(
            `UPDATE crop_in_farm SET
                crop_name=$1, variety=$2, volume=$3, stock=$4,
                specification_1=$5, specification_2=$6, specification_3=$7,
                specification_4=$8, specification_5=$9,
                maturity_days=$10, expected_volume=$11,
                planting_date=$12, expected_harvest=$13, actual_harvest=$14, total_harvest=$15,
                harvest_photo=$16, location=$17
            WHERE crop_id=$18`,
            [crop_name, variety || null, volume || null, stock || null,
             specification_1 || null, specification_2 || null, specification_3 || null,
             specification_4 || null, specification_5 || null,
             maturity_days || null, expected_volume || null,
             planting_date || null, expected_harvest || null, actual_harvest || null, total_harvest || null,
             finalPhoto, location || null,
             crop_id]
        );

        res.status(200).json({ message: "Crop updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const deleteCrop = async (req, res) => {
    const user_id = req.user.user_id;
    const { crop_id } = req.params;

    try {
        const rows = await db.query(
            `SELECT c.crop_id FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             WHERE c.crop_id = $1 AND f.user_id = $2`,
            [crop_id, user_id]
        );
        if (rows.rows.length === 0) return res.status(403).json({ message: "Unauthorized or crop not found." });

        await db.query(`DELETE FROM crop_in_farm WHERE crop_id = $1`, [crop_id]);
        res.status(200).json({ message: "Crop deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getAllCrops = async (req, res) => {
    try {
        const rows = await db.query(
            `SELECT 
                c.*,
                f.farm_name,
                f.gps_coordinates,
                f.farm_area,
                f.user_id AS farmer_id
            FROM crop_in_farm c
            INNER JOIN farm f ON c.farm_id = f.farm_id
            ORDER BY c.crop_id DESC`
        );
        res.status(200).json({ crops: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};