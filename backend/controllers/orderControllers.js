import { db } from '../db.js'

export const placeOrder = async (req, res) => {
    const user_id = req.user.user_id
    const { items } = req.body

    if (!items || items.length === 0)
        return res.status(400).json({ message: 'No items in order.' })

    try {
        for (const item of items) {
            await db.query(
                `INSERT INTO crop_orders (crop_id, user_id, order_date, quantity, volume, farmer_id, farm_id, expected_arrival, status)
                 VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, 'pending')`,
                [item.crop_id, user_id, item.quantity, item.volume,
                 item.farmer_id, item.farm_id, item.expected_arrival || null]
            )
        }
        res.status(201).json({ message: 'Order placed successfully. Waiting for farmer approval.' })
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

export const approveOrder = async (req, res) => {
    const { orderId } = req.params
    const user_id = req.user.user_id

    try {
        const order = await db.query(
            `SELECT co.*, f.user_id as farm_owner_id 
             FROM crop_orders co 
             JOIN farm f ON co.farm_id = f.farm_id 
             WHERE co.crop_order_id = $1`,
            [orderId]
        )

        if (order.rows.length === 0)
            return res.status(404).json({ message: 'Order not found' })

        if (order.rows[0].farm_owner_id !== user_id)
            return res.status(403).json({ message: 'Not authorized' })

        if (order.rows[0].status !== 'pending')
            return res.status(400).json({ message: 'Order already processed' })

        await db.query(
            `UPDATE crop_orders 
             SET status = 'approved', approved_at = NOW() 
             WHERE crop_order_id = $1`,
            [orderId]
        )

        const crop = order.rows[0]
        if (crop.quantity) {
            await db.query(
                `UPDATE crop_in_farm 
                 SET stock = GREATEST(0, stock - $1) 
                 WHERE crop_id = $2`,
                [crop.quantity, crop.crop_id]
            )
        }
        if (crop.volume) {
            await db.query(
                `UPDATE crop_in_farm 
                 SET volume = GREATEST(0, volume - $1) 
                 WHERE crop_id = $2`,
                [crop.volume, crop.crop_id]
            )
        }

        res.status(200).json({ message: 'Order approved successfully.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}

export const rejectOrder = async (req, res) => {
    const { orderId } = req.params
    const user_id = req.user.user_id
    const { reason } = req.body

    try {
        const order = await db.query(
            `SELECT co.*, f.user_id as farm_owner_id 
             FROM crop_orders co 
             JOIN farm f ON co.farm_id = f.farm_id 
             WHERE co.crop_order_id = $1`,
            [orderId]
        )

        if (order.rows.length === 0)
            return res.status(404).json({ message: 'Order not found' })

        if (order.rows[0].farm_owner_id !== user_id)
            return res.status(403).json({ message: 'Not authorized' })

        if (order.rows[0].status !== 'pending')
            return res.status(400).json({ message: 'Order already processed' })

        await db.query(
            `UPDATE crop_orders 
             SET status = 'rejected', rejected_at = NOW(), rejection_reason = $1 
             WHERE crop_order_id = $2`,
            [reason || null, orderId]
        )

        res.status(200).json({ message: 'Order rejected.' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Database error', error: error.message })
    }
}