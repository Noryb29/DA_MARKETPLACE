// Assuming you have a DB connection pool imported
import {db} from '../db.js'

// farmController.js - addFarm stays the same, but remove the LIMIT 1 restriction mindset
// getFarm gets the LATEST farm, getFarms gets all

export const addFarm = async (req, res) => {
    const { farm_name, gps_coordinates, farm_area, farm_elevation } = req.body;
    const user_id = req.user.user_id;

    if (!farm_name || !farm_area) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const query = `
        INSERT INTO farm (user_id, farm_name, gps_coordinates, farm_area, farm_elevation) 
        VALUES (?, ?, ?, ?, ?)
    `;
    try {
        const [result] = await db.execute(query, [
            user_id, farm_name, gps_coordinates || null, farm_area, farm_elevation || null
        ]);
        res.status(201).json({ message: "Farm registered successfully", farmId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

// farmController.js

export const getFarm = async (req, res) => {
    const user_id = req.user.user_id;

    const query = `SELECT * FROM farm WHERE user_id = ? LIMIT 1`;

    try {
        const [rows] = await db.execute(query, [user_id]);

        if (rows.length === 0) {
            return res.status(200).json({ hasFarm: false, farm: null });
        }

        res.status(200).json({ hasFarm: true, farm: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getCrops = async (req, res) => {
    const user_id = req.user.user_id;

    const query = `
        SELECT c.* FROM crop_in_farm c
        INNER JOIN farm f ON c.farm_id = f.farm_id
        WHERE f.user_id = ?
    `;

    try {
        const [rows] = await db.execute(query, [user_id]);
        res.status(200).json({ crops: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarms = async (req, res) => {
    const user_id = req.user.user_id;

    const query = `SELECT * FROM farm WHERE user_id = ? ORDER BY created_at DESC`;

    try {
        const [rows] = await db.execute(query, [user_id]);
        res.status(200).json({ farms: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};




