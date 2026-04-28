import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

export const pool = new Pool({
    host: process.env.PGHOST || process.env.LOCAL_HOST,
    user: process.env.PGUSER || process.env.LOCAL_USER,
    database: process.env.PGDATABASE || process.env.LOCAL_DATABASE,
    password: process.env.PGPASSWORD || process.env.LOCAL_PASSWORD,
    port: process.env.PGPORT,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

export const db = pool

export const createDB = async() => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS farmer (
                user_id SERIAL PRIMARY KEY,
                email VARCHAR(150) NOT NULL UNIQUE,
                role VARCHAR(15) NOT NULL DEFAULT 'farmer',
                password VARCHAR(150) NOT NULL,
                firstname VARCHAR(150) NOT NULL,
                lastname VARCHAR(150) NOT NULL,
                address VARCHAR(150),
                contact_number INTEGER,
                rsbsa_number VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('✓ Table "farmer" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                firstname VARCHAR(100) NOT NULL,
                lastname VARCHAR(100) NOT NULL,
                address VARCHAR(100),
                contact_number INTEGER,
                rsbsa_number VARCHAR(20),
                role VARCHAR(6) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('✓ Table "users" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS farm (
                farm_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                farm_name VARCHAR(150) NOT NULL,
                gps_coordinates VARCHAR(100),
                farm_area INTEGER NOT NULL,
                farm_elevation INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        console.log('✓ Table "farm" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS crop_in_farm (
                crop_id SERIAL PRIMARY KEY,
                farm_id INTEGER NOT NULL,
                volume FLOAT NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                crop_name VARCHAR(150) NOT NULL,
                variety VARCHAR(150),
                specification_1 VARCHAR(150),
                specification_2 VARCHAR(150),
                specification_3 VARCHAR(150),
                specification_4 VARCHAR(150),
                specification_5 VARCHAR(150),
                planting_date DATE NOT NULL,
                expected_harvest DATE NOT NULL
            )
        `)
        console.log('✓ Table "crop_in_farm" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS crop_orders (
                crop_order_id SERIAL PRIMARY KEY,
                crop_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                order_date DATE NOT NULL,
                quantity INTEGER NOT NULL,
                volume INTEGER NOT NULL,
                farmer_id INTEGER NOT NULL,
                farm_id INTEGER NOT NULL,
                expected_arrival DATE NOT NULL
            )
        `)
        console.log('✓ Table "crop_orders" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS markets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                city VARCHAR(100)
            )
        `)
        console.log('✓ Table "markets" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL
            )
        `)
        console.log('✓ Table "categories" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS commodities (
                id SERIAL PRIMARY KEY,
                category_id INTEGER NOT NULL,
                name VARCHAR(150) NOT NULL,
                specification VARCHAR(150)
            )
        `)
        console.log('✓ Table "commodities" created')

        await pool.query(`
            CREATE TABLE IF NOT EXISTS price_records (
                id SERIAL PRIMARY KEY,
                commodity_id INTEGER NOT NULL,
                market_id INTEGER NOT NULL,
                price_date DATE NOT NULL,
                prevailing_price DECIMAL(10,2),
                high_price DECIMAL(10,2),
                low_price DECIMAL(10,2),
                respondent_1 FLOAT,
                respondent_2 FLOAT,
                respondent_3 FLOAT,
                respondent_4 FLOAT,
                respondent_5 FLOAT
            )
        `)
        console.log('✓ Table "price_records" created')

        console.log('\n✅ Database setup completed successfully!')

    } catch (error) {
        console.error('❌ Error creating tables:', error.message)
        return { success: false, error: error.message }
    }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('db.js')) {
    createDB()
}