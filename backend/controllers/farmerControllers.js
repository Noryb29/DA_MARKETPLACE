// Assuming you have a DB connection pool imported
import {db} from '../db.js'

export const addFarm = async (req, res) => {
    const { farm_name, gps_coordinates, farm_area, farm_elevation } = req.body;
    
    // The user_id should come from your Auth Middleware (decoded from JWT)
    const user_id = req.user.user_id; 

    if (!farm_name || !gps_coordinates || !farm_area) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const query = `
        INSERT INTO farm (user_id, farm_name, gps_coordinates, farm_area, farm_elevation) 
        VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.execute(query, [
            user_id, 
            farm_name, 
            gps_coordinates, 
            farm_area, 
            farm_elevation
        ]);

        res.status(201).json({ 
            message: "Farm registered successfully", 
            farmId: result.insertId 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error", error: error.message });
    }
};

export const getFarm = async (req, res) => {
  const user_id = req.user.user_id;

  const query = `
    SELECT user_id, farm_name, gps_coordinates, farm_area, farm_elevation, created_at
    FROM farm 
    WHERE user_id = ?
    LIMIT 1
  `;

  try {
    const [rows] = await db.execute(query, [user_id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "No farm registered yet" });
    }
    
    res.status(200).json({ farm: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
};
