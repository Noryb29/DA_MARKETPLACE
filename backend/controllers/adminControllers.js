import { db } from "../db.js";

export const getAllProducts = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        cif.crop_id,
        cif.farm_id,
        cif.volume,
        cif.stock,
        cif.crop_name,
        cif.variety,
        cif.specification_1,
        cif.specification_2,
        cif.specification_3,
        cif.specification_4,
        cif.specification_5,
        cif.planting_date,
        cif.expected_harvest,
        f.farm_name,
        f.user_id as farmer_id,
        fm.firstname,
        fm.lastname
      FROM crop_in_farm cif
      JOIN farm f ON cif.farm_id = f.farm_id
      JOIN farmer fm ON f.user_id = fm.user_id
      ORDER BY cif.crop_id DESC
    `);

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

export const getAllFarms = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        f.farm_id,
        f.user_id,
        f.farm_name,
        f.gps_coordinates,
        f.farm_area,
        f.farm_elevation,
        f.created_at,
        fm.firstname,
        fm.lastname,
        fm.email,
        fm.contact_number,
        COUNT(cif.crop_id) as total_crops
      FROM farm f
      JOIN farmer fm ON f.user_id = fm.user_id
      LEFT JOIN crop_in_farm cif ON f.farm_id = cif.farm_id
      GROUP BY f.farm_id, fm.firstname, fm.lastname, fm.email, fm.contact_number
      ORDER BY f.created_at DESC
    `);

    res.status(200).json({
      success: true,
      message: "Farms retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching farms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching farms",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.user_id,
        u.email,
        u.firstname,
        u.lastname,
        u.address,
        u.contact_number,
        u.role,
        u.created_at,
        COUNT(co.crop_order_id) as total_orders
      FROM users u
      LEFT JOIN crop_orders co ON u.user_id = co.user_id
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const userExists = await db.query(
      "SELECT user_id FROM users WHERE user_id = $1",
      [userId]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allowedFields = [
      "email",
      "firstname",
      "lastname",
      "address",
      "contact_number",
    ];
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    updateValues.push(userId);

    await db.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE user_id = $${paramIndex}`,
      updateValues
    );

    if (
      updateData.business_name ||
      updateData.preference1 ||
      updateData.preference2 ||
      updateData.preference3 ||
      updateData.preference4 ||
      updateData.preference5
    ) {
      const detailFields = [];
      const detailValues = [];
      paramIndex = 1;

      if (updateData.business_name) {
        detailFields.push(`business_name = $${paramIndex}`);
        detailValues.push(updateData.business_name);
        paramIndex++;
      }
      if (updateData.preference1) {
        detailFields.push(`preference1 = $${paramIndex}`);
        detailValues.push(updateData.preference1);
        paramIndex++;
      }
      if (updateData.preference2) {
        detailFields.push(`preference2 = $${paramIndex}`);
        detailValues.push(updateData.preference2);
        paramIndex++;
      }
      if (updateData.preference3) {
        detailFields.push(`preference3 = $${paramIndex}`);
        detailValues.push(updateData.preference3);
        paramIndex++;
      }
      if (updateData.preference4) {
        detailFields.push(`preference4 = $${paramIndex}`);
        detailValues.push(updateData.preference4);
        paramIndex++;
      }
      if (updateData.preference5) {
        detailFields.push(`preference5 = $${paramIndex}`);
        detailValues.push(updateData.preference5);
        paramIndex++;
      }

      if (detailFields.length > 0) {
        detailValues.push(userId);
        await db.query(
          `UPDATE user_detail SET ${detailFields.join(", ")} WHERE user_id = $${paramIndex}`,
          detailValues
        );
      }
    }

    const updatedUser = await db.query(
      `SELECT u.*, ud.business_name, ud.preference1, ud.preference2, ud.preference3, ud.preference4, ud.preference5
       FROM users u
       LEFT JOIN user_detail ud ON u.user_id = ud.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error.message,
    });
  }
};

export const getAllFarmers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        f.user_id,
        f.email,
        f.firstname,
        f.lastname,
        f.address,
        f.contact_number,
        f.rsbsa_number,
        f.role,
        f.created_at,
        fd.gender,
        fd.date_of_birth,
        COUNT(fm.farm_id) as total_farms,
        COUNT(DISTINCT cif.crop_id) as total_crops
      FROM farmer f
      LEFT JOIN farmer_details fd ON f.user_id = fd.user_id
      LEFT JOIN farm fm ON f.user_id = fm.user_id
      LEFT JOIN crop_in_farm cif ON fm.farm_id = cif.farm_id
      GROUP BY f.user_id, fd.gender, fd.date_of_birth
      ORDER BY f.created_at DESC
    `);

    res.status(200).json({
      success: true,
      message: "Farmers retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching farmers",
      error: error.message,
    });
  }
};

export const updateFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const updateData = req.body;

    const farmerExists = await db.query(
      "SELECT user_id FROM farmer WHERE user_id = $1",
      [farmerId]
    );

    if (farmerExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    const allowedFarmerFields = [
      "email",
      "firstname",
      "lastname",
      "address",
      "contact_number",
    ];
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach((key) => {
      if (allowedFarmerFields.includes(key) && updateData[key] !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(updateData[key]);
        paramIndex++;
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(farmerId);
      await db.query(
        `UPDATE farmer SET ${updateFields.join(", ")} WHERE user_id = $${paramIndex}`,
        updateValues
      );
    }

    if (updateData.age || updateData.gender || updateData.ethnicity) {
      const detailFields = [];
      const detailValues = [];
      paramIndex = 1;

      if (updateData.age !== undefined) {
        detailFields.push(`age = $${paramIndex}`);
        detailValues.push(updateData.age);
        paramIndex++;
      }
      if (updateData.gender) {
        detailFields.push(`gender = $${paramIndex}`);
        detailValues.push(updateData.gender);
        paramIndex++;
      }
      if (updateData.ethnicity) {
        detailFields.push(`ethnicity = $${paramIndex}`);
        detailValues.push(updateData.ethnicity);
        paramIndex++;
      }

      if (detailFields.length > 0) {
        detailValues.push(farmerId);

        const detailExists = await db.query(
          "SELECT user_id FROM farmer_details WHERE user_id = $1",
          [farmerId]
        );

        if (detailExists.rows.length === 0) {
          await db.query(
            `INSERT INTO farmer_details (user_id, age, gender, ethnicity) VALUES ($1, $2, $3, $4)`,
            [farmerId, updateData.age || null, updateData.gender || null, updateData.ethnicity || null]
          );
        } else {
          await db.query(
            `UPDATE farmer_details SET ${detailFields.join(", ")} WHERE user_id = $${paramIndex}`,
            detailValues
          );
        }
      }
    }

    const updatedFarmer = await db.query(
      `SELECT f.*, fd.age, fd.gender, fd.ethnicity
       FROM farmer f
       LEFT JOIN farmer_details fd ON f.user_id = fd.user_id
       WHERE f.user_id = $1`,
      [farmerId]
    );

    res.status(200).json({
      success: true,
      message: "Farmer updated successfully",
      data: updatedFarmer.rows[0],
    });
  } catch (error) {
    console.error("Error updating farmer:", error);
    res.status(500).json({
      success: false,
      message: "Error updating farmer",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        co.crop_order_id,
        co.crop_id,
        co.user_id,
        co.order_date,
        co.quantity,
        co.volume,
        co.farmer_id,
        co.farm_id,
        co.expected_arrival,
        cif.crop_name,
        cif.variety,
        u.firstname as buyer_firstname,
        u.lastname as buyer_lastname,
        u.email as buyer_email,
        fm.firstname as farmer_firstname,
        fm.lastname as farmer_lastname,
        f.farm_name
      FROM crop_orders co
      JOIN crop_in_farm cif ON co.crop_id = cif.crop_id
      JOIN users u ON co.user_id = u.user_id
      JOIN farmer fm ON co.farmer_id = fm.user_id
      JOIN farm f ON co.farm_id = f.farm_id
      ORDER BY co.order_date DESC
    `);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await db.query(`
      SELECT 
        co.crop_order_id,
        co.crop_id,
        co.user_id,
        co.order_date,
        co.quantity,
        co.volume,
        co.farmer_id,
        co.farm_id,
        co.expected_arrival,
        cif.crop_name,
        cif.variety,
        cif.specification_1,
        cif.specification_2,
        cif.specification_3,
        cif.specification_4,
        cif.specification_5,
        u.firstname as buyer_firstname,
        u.lastname as buyer_lastname,
        u.email as buyer_email,
        u.address as buyer_address,
        u.contact_number as buyer_contact,
        fm.firstname as farmer_firstname,
        fm.lastname as farmer_lastname,
        fm.email as farmer_email,
        f.farm_name,
        f.gps_coordinates
      FROM crop_orders co
      JOIN crop_in_farm cif ON co.crop_id = cif.crop_id
      JOIN users u ON co.user_id = u.user_id
      JOIN farmer fm ON co.farmer_id = fm.user_id
      JOIN farm f ON co.farm_id = f.farm_id
      WHERE co.crop_order_id = $1
    `, [orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};