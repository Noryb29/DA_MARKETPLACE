import {db} from '../db.js'

export const addFarm = async (req, res) => {
    const { farm_name, gps_coordinates, farm_area, farm_elevation } = req.body;
    const user_id = req.user.user_id;

    if (!farm_name || !farm_area) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    try {
        const result = await db.query(
            `INSERT INTO farm (user_id, farm_name, gps_coordinates, farm_area, farm_elevation) 
             VALUES ($1, $2, $3, $4, $5)
             RETURNING farm_id`,
            [user_id, farm_name, gps_coordinates || null, farm_area, farm_elevation || null]
        );
        res.status(201).json({ message: "Farm registered successfully", farmId: result.rows[0].farm_id });
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