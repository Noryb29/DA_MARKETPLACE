import {db} from '../db.js'
import fs from 'fs'
import path from 'path'

const handleFarmImageUpload = (req) => {
    if (req.files && req.files['farm_image'] && req.files['farm_image'][0]) {
        const file = req.files['farm_image'][0]
        const uploadsDir = path.join(process.cwd(), 'uploads', 'farm_images')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        const ext = path.extname(file.originalname) || '.jpg'
        const filename = `farm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`
        const filepath = path.join(uploadsDir, filename)
        fs.renameSync(file.path, filepath)
        return `/uploads/farm_images/${filename}`
    }
    return null
}

const handleFarmDocsUpload = (req) => {
    if (req.files && req.files['farm_docs']) {
        const docs = req.files['farm_docs']
        const uploadsDir = path.join(process.cwd(), 'uploads', 'farm_docs')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const docPaths = docs.slice(0, 3).map((file) => {
            if (!file || !file.name) return null
            const ext = path.extname(file.name) || '.pdf'
            const filename = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}${ext}`
            const filepath = path.join(uploadsDir, filename)
            fs.renameSync(file.path, filepath)
            return `/uploads/farm_docs/${filename}`
        }).filter(Boolean)
        console.log('Uploaded docs:', docPaths)
        return docPaths
    }
    return []
}

export const addFarm = async (req, res) => {
    const { farm_name, gps_coordinates, farm_area, farm_elevation, total_acres, plot_boundaries, land_use_type } = req.body;
    const user_id = req.user.user_id;

    if (!farm_name || !farm_area) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    if (land_use_type && !['pasture', 'cultivated', 'fallow'].includes(land_use_type)) {
        return res.status(400).json({ message: "Invalid land use type. Must be pasture, cultivated, or fallow." });
    }

    try {
        const farmImageUrl = handleFarmImageUpload(req)
        const farmDocUrls = handleFarmDocsUpload(req)
        
        const result = await db.query(
            `INSERT INTO farm (user_id, farm_name, gps_coordinates, farm_area, farm_elevation, total_acres, plot_boundaries, land_use_type, farm_image, farm_docs) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                user_id, 
                farm_name, 
                gps_coordinates || null, 
                farm_area, 
                farm_elevation || null,
                total_acres || null,
                plot_boundaries || null,
                land_use_type || null,
                farmImageUrl,
                farmDocUrls.length > 0 ? farmDocUrls : null
            ]
        );
        res.status(201).json({ message: "Farm registered successfully", farm: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarm = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(`SELECT * FROM farm WHERE user_id = $1 LIMIT 1`, [user_id]);

        if (rows.rows.length === 0) {
            return res.status(200).json({ hasFarm: false, farm: null });
        }

        res.status(200).json({ hasFarm: true, farm: rows.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(
            `SELECT c.* FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             WHERE f.user_id = $1`,
            [user_id]
        );
        res.status(200).json({ crops: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarms = async (req, res) => {
    const user_id = req.user.user_id;

    try {
        const rows = await db.query(`SELECT * FROM farm WHERE user_id = $1 ORDER BY created_at DESC`, [user_id]);
        res.status(200).json({ farms: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};