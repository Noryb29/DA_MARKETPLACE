import { db } from '../db.js'
import fs from 'fs'
import path from 'path'

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;
    try {
        const rows = await db.query(
            `SELECT c.*, 
                    s.specification_1_name, s.specification_1_value,
                    s.specification_2_name, s.specification_2_value,
                    s.specification_3_name, s.specification_3_value,
                    s.specification_4_name, s.specification_4_value,
                    s.specification_5_name, s.specification_5_value,
                    s.specification_6_name, s.specification_6_value,
                    s.specification_7_name, s.specification_7_value,
                    s.specification_8_name, s.specification_8_value
             FROM crop_in_farm c
             INNER JOIN farm f ON c.farm_id = f.farm_id
             LEFT JOIN crop_specifications s ON c.crop_id = s.crop_id
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
        farm_id: providedFarmId, crop_name, variety, volume, stock,
        specification_1, specification_2, specification_3,
        specification_4, specification_5, specification_6, specification_7, specification_8,
        maturity_days, expected_volume,
        planting_date, expected_harvest, actual_harvest, total_harvest,
        location
    } = req.body;

    const parseSpec = (spec) => {
        if (!spec) return null
        if (typeof spec === 'object') return spec
        try { return JSON.parse(spec) } catch { return null }
    }

    const spec1 = parseSpec(specification_1)
    const spec2 = parseSpec(specification_2)
    const spec3 = parseSpec(specification_3)
    const spec4 = parseSpec(specification_4)
    const spec5 = parseSpec(specification_5)
    const spec6 = parseSpec(specification_6)
    const spec7 = parseSpec(specification_7)
    const spec8 = parseSpec(specification_8)

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
        let farm_id = providedFarmId;
        
        if (!farm_id) {
            const farms = await db.query(`SELECT farm_id FROM farm WHERE user_id = $1 LIMIT 1`, [user_id]);
            if (farms.rows.length === 0) return res.status(404).json({ message: "No farm found. Please register a farm first." });
            farm_id = farms.rows[0].farm_id;
        } else {
            const farmCheck = await db.query(`SELECT farm_id FROM farm WHERE farm_id = $1 AND user_id = $2`, [farm_id, user_id]);
            if (farmCheck.rows.length === 0) return res.status(403).json({ message: "Invalid farm selected." });
        }
        const result = await db.query(
            `INSERT INTO crop_in_farm (
                farm_id, crop_name, variety, volume, stock,
                maturity_days, expected_volume,
                planting_date, expected_harvest, actual_harvest, total_harvest,
                harvest_photo, location
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING crop_id`,
            [farm_id, crop_name, variety || null, volume || null, stock || null,
             maturity_days || null, expected_volume || null,
             planting_date || null, expected_harvest || null, actual_harvest || null, total_harvest || null,
             harvest_photo, location || null]
        );

        const cropId = result.rows[0].crop_id;

        if (spec1 || spec2 || spec3 || spec4 || spec5 || spec6 || spec7 || spec8) {
            await db.query(
                `INSERT INTO crop_specifications (
                    crop_id, 
                    specification_1_name, specification_1_value,
                    specification_2_name, specification_2_value,
                    specification_3_name, specification_3_value,
                    specification_4_name, specification_4_value,
                    specification_5_name, specification_5_value,
                    specification_6_name, specification_6_value,
                    specification_7_name, specification_7_value,
                    specification_8_name, specification_8_value
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [cropId,
                 spec1?.name || null, spec1?.value || null,
                 spec2?.name || null, spec2?.value || null,
                 spec3?.name || null, spec3?.value || null,
                 spec4?.name || null, spec4?.value || null,
                 spec5?.name || null, spec5?.value || null,
                 spec6?.name || null, spec6?.value || null,
                 spec7?.name || null, spec7?.value || null,
                 spec8?.name || null, spec8?.value || null]
            );
        }

        res.status(201).json({ message: "Crop added successfully", cropId });
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
        specification_4, specification_5, specification_6, specification_7, specification_8,
        maturity_days, expected_volume,
        planting_date, expected_harvest, actual_harvest, total_harvest,
        location
    } = req.body;

    const parseSpec = (spec) => {
        if (!spec) return null
        if (typeof spec === 'object') return spec
        try { return JSON.parse(spec) } catch { return null }
    }

    const spec1 = parseSpec(specification_1)
    const spec2 = parseSpec(specification_2)
    const spec3 = parseSpec(specification_3)
    const spec4 = parseSpec(specification_4)
    const spec5 = parseSpec(specification_5)
    const spec6 = parseSpec(specification_6)
    const spec7 = parseSpec(specification_7)
    const spec8 = parseSpec(specification_8)

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
                maturity_days=$5, expected_volume=$6,
                planting_date=$7, expected_harvest=$8, actual_harvest=$9, total_harvest=$10,
                harvest_photo=$11, location=$12
            WHERE crop_id=$13`,
            [crop_name, variety || null, volume || null, stock || null,
             maturity_days || null, expected_volume || null,
             planting_date || null, expected_harvest || null, actual_harvest || null, total_harvest || null,
             finalPhoto, location || null,
             crop_id]
        );

        const existingSpec = await db.query(`SELECT spec_id FROM crop_specifications WHERE crop_id = $1`, [crop_id]);
        
        if (existingSpec.rows.length > 0) {
            await db.query(
                `UPDATE crop_specifications SET
                    specification_1_name=$1, specification_1_value=$2,
                    specification_2_name=$3, specification_2_value=$4,
                    specification_3_name=$5, specification_3_value=$6,
                    specification_4_name=$7, specification_4_value=$8,
                    specification_5_name=$9, specification_5_value=$10,
                    specification_6_name=$11, specification_6_value=$12,
                    specification_7_name=$13, specification_7_value=$14,
                    specification_8_name=$15, specification_8_value=$16,
                    updated_at=CURRENT_TIMESTAMP
                WHERE crop_id=$17`,
                [spec1?.name || null, spec1?.value || null,
                 spec2?.name || null, spec2?.value || null,
                 spec3?.name || null, spec3?.value || null,
                 spec4?.name || null, spec4?.value || null,
                 spec5?.name || null, spec5?.value || null,
                 spec6?.name || null, spec6?.value || null,
                 spec7?.name || null, spec7?.value || null,
                 spec8?.name || null, spec8?.value || null,
                 crop_id]
            );
        } else if (spec1 || spec2 || spec3 || spec4 || spec5 || spec6 || spec7 || spec8) {
            await db.query(
                `INSERT INTO crop_specifications (
                    crop_id, 
                    specification_1_name, specification_1_value,
                    specification_2_name, specification_2_value,
                    specification_3_name, specification_3_value,
                    specification_4_name, specification_4_value,
                    specification_5_name, specification_5_value,
                    specification_6_name, specification_6_value,
                    specification_7_name, specification_7_value,
                    specification_8_name, specification_8_value
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [crop_id,
                 spec1?.name || null, spec1?.value || null,
                 spec2?.name || null, spec2?.value || null,
                 spec3?.name || null, spec3?.value || null,
                 spec4?.name || null, spec4?.value || null,
                 spec5?.name || null, spec5?.value || null,
                 spec6?.name || null, spec6?.value || null,
                 spec7?.name || null, spec7?.value || null,
                 spec8?.name || null, spec8?.value || null]
            );
        }

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
                f.user_id AS farmer_id,
                s.specification_1_name, s.specification_1_value,
                s.specification_2_name, s.specification_2_value,
                s.specification_3_name, s.specification_3_value,
                s.specification_4_name, s.specification_4_value,
                s.specification_5_name, s.specification_5_value,
                s.specification_6_name, s.specification_6_value,
                s.specification_7_name, s.specification_7_value,
                s.specification_8_name, s.specification_8_value
            FROM crop_in_farm c
            INNER JOIN farm f ON c.farm_id = f.farm_id
            LEFT JOIN crop_specifications s ON c.crop_id = s.crop_id
            ORDER BY c.crop_id DESC`
        );
        res.status(200).json({ crops: rows.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};