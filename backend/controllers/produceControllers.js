import { db } from '../db.js'

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;
    const query = `
        SELECT c.* FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        WHERE f.user_id = ?
        ORDER BY c.crop_id DESC
    `;
    try {
        const [rows] = await db.execute(query, [user_id]);
        res.status(200).json({ crops: rows });
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
        planting_date, expected_harvest
    } = req.body;

    if (!crop_name) return res.status(400).json({ message: "Crop name is required." });

    const farmQuery = `SELECT farm_id FROM farm WHERE user_id = ? LIMIT 1`;
    try {
        const [farms] = await db.execute(farmQuery, [user_id]);
        if (farms.length === 0) return res.status(404).json({ message: "No farm found. Please register a farm first." });

        const farm_id = farms[0].farm_id;
        const query = `
            INSERT INTO crop_in_farm (
                farm_id, crop_name, variety, volume, stock,
                specification_1, specification_2, specification_3, specification_4, specification_5,
                planting_date, expected_harvest
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            farm_id, crop_name, variety || null, volume || null, stock || null,
            specification_1 || null, specification_2 || null, specification_3 || null,
            specification_4 || null, specification_5 || null,
            planting_date || null, expected_harvest || null
        ]);

        res.status(201).json({ message: "Crop added successfully", cropId: result.insertId });
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
        planting_date, expected_harvest
    } = req.body;

    const verifyQuery = `
        SELECT c.crop_id FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        WHERE c.crop_id = ? AND f.user_id = ?
    `;
    try {
        const [rows] = await db.execute(verifyQuery, [crop_id, user_id]);
        if (rows.length === 0) return res.status(403).json({ message: "Unauthorized or crop not found." });

        const query = `
            UPDATE crop_in_farm SET
                crop_name=?, variety=?, volume=?, stock=?,
                specification_1=?, specification_2=?, specification_3=?,
                specification_4=?, specification_5=?,
                planting_date=?, expected_harvest=?
            WHERE crop_id=?
        `;
        await db.execute(query, [
            crop_name, variety || null, volume || null, stock || null,
            specification_1 || null, specification_2 || null, specification_3 || null,
            specification_4 || null, specification_5 || null,
            planting_date || null, expected_harvest || null,
            crop_id
        ]);

        res.status(200).json({ message: "Crop updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const deleteCrop = async (req, res) => {
    const user_id = req.user.user_id;
    const { crop_id } = req.params;

    const verifyQuery = `
        SELECT c.crop_id FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        WHERE c.crop_id = ? AND f.user_id = ?
    `;
    try {
        const [rows] = await db.execute(verifyQuery, [crop_id, user_id]);
        if (rows.length === 0) return res.status(403).json({ message: "Unauthorized or crop not found." });

        await db.execute(`DELETE FROM crop_in_farm WHERE crop_id = ?`, [crop_id]);
        res.status(200).json({ message: "Crop deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// PUBLIC — no auth required, shows all crops with farm info
export const getAllCrops = async (req, res) => {
    const query = `
        SELECT 
            c.*,
            f.farm_name,
            f.gps_coordinates,
            f.farm_area,
            f.user_id AS farmer_id
        FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        ORDER BY c.crop_id DESC
    `;
    try {
        const [rows] = await db.execute(query);
        res.status(200).json({ crops: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};
