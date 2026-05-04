import { db } from '../db.js'

export const placeOrder = async (req, res) => {
    const user_id = req.user.user_id
    const { items } = req.body

    if (!items || items.length === 0)
        return res.status(400).json({ message: 'No items in order.' })

    try {
        const insertions = items.map(item =>
            db.query(
                `INSERT INTO crop_orders (crop_id, user_id, order_date, quantity, volume, farmer_id, farm_id, expected_arrival)
                 VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)`,
                [item.crop_id, user_id, item.quantity, item.volume,
                 item.farmer_id, item.farm_id, item.expected_arrival || null]
            )
        )
        await Promise.all(insertions)
        res.status(201).json({ message: 'Order placed successfully.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const getMyOrders = async (req, res) => {
    const user_id = req.user.user_id
    try {
        const rows = await db.query(
            `SELECT 
                co.*,
                c.crop_name, c.variety,
                c.specification_1, c.specification_2, c.specification_3,
                c.specification_4, c.specification_5,
                c.planting_date, c.expected_harvest,
                c.harvest_photo, c.location AS crop_location,
                f.farm_name, f.farm_location, f.gps_coordinates, f.province, f.municipality, f.barangay,
                fa.firstname AS farmer_first_name,
                fa.lastname  AS farmer_last_name
            FROM crop_orders co
            LEFT JOIN crop_in_farm   c  ON co.crop_id   = c.crop_id
            LEFT JOIN farm    f  ON co.farm_id   = f.farm_id
            LEFT JOIN farmer fa ON co.farmer_id = fa.user_id
            WHERE co.user_id = $1
            ORDER BY co.order_date DESC`,
            [user_id]
        )
        res.status(200).json({ orders: rows.rows })
    } catch (error) {
        console.error('getMyOrders error:', error.message)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const getFarmerOrders = async (req, res) => {
    const user_id = req.user.user_id
    try {
        const rows = await db.query(
            `SELECT 
                co.*,
                c.crop_name, c.variety,
                c.specification_1, c.specification_2, c.specification_3,
                c.specification_4, c.specification_5,
                c.harvest_photo, c.location AS crop_location,
                f.farm_name, f.farm_location, f.gps_coordinates, f.province, f.municipality, f.barangay,
                u.firstname AS buyer_first_name,
                u.lastname  AS buyer_last_name,
                ud.profile_picture AS buyer_profile_picture
            FROM crop_orders co
            LEFT JOIN crop_in_farm  c ON co.crop_id  = c.crop_id
            LEFT JOIN farm   f ON co.farm_id  = f.farm_id
            LEFT JOIN users  u ON co.user_id  = u.user_id
            LEFT JOIN user_details ud ON u.user_id = ud.user_id
            WHERE co.farmer_id = $1
            ORDER BY co.order_date DESC`,
            [user_id]
        )
        res.status(200).json({ orders: rows.rows })
    } catch (error) {
        console.error('getFarmerOrders error:', error.message)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}