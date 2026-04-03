import mysql2 from 'mysql2/promise'

export const db = mysql2.createPool({
    host:'localhost',
    user:'root',
    database:'farmers_marketplace',
    password:'',
})

const pool = mysql2.createPool({
    host:'localhost',
    user:'root',
    password:'',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})


export const createDB = async() => {
    await pool.query('CREATE DATABASE IF NOT EXISTS farmers_marketplace');
    await pool.query('USE farmers_marketplace');
    try {
        

        console.log('✓ Connected to MySQL');

        // Create the database if it doesn't exist
        console.log('✓ Database "farmers_marketplace" created or already exists');

        // Select the database
        console.log('✓ Switched to "farmers_marketplace" database');

        // Create farmer table
        await db.query(`
            CREATE TABLE IF NOT EXISTS farmer (
                user_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(150) NOT NULL UNIQUE,
                role VARCHAR(15) NOT NULL DEFAULT 'farmer',
                password VARCHAR(150) NOT NULL,
                firstname VARCHAR(150) NOT NULL,
                lastname VARCHAR(150) NOT NULL,
                address VARCHAR(150) NOT NULL,
                contact_number INT(11) NOT NULL,
                rsbsa_number VARCHAR(20) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "farmer" created');

        // Create farmer_details table
        await db.query(`
            CREATE TABLE IF NOT EXISTS farmer_details (
                user_id INT(11) NOT NULL,
                age INT(11) NOT NULL,
                gender VARCHAR(7) NOT NULL,
                ethnicity VARCHAR(100) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES farmer(user_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "farmer_details" created');

        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(100) NOT NULL,
                firstname VARCHAR(100) NOT NULL,
                lastname VARCHAR(100) NOT NULL,
                address VARCHAR(100) NOT NULL,
                contact_number INT(11) NOT NULL,
                rsbsa_number VARCHAR(20),
                role VARCHAR(6) NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "users" created');

        // Create user_detail table
        await db.query(`
            CREATE TABLE IF NOT EXISTS user_detail (
                user_id INT(11) NOT NULL,
                business_name VARCHAR(100) NOT NULL,
                preference1 VARCHAR(100) NOT NULL,
                preference2 VARCHAR(100) NOT NULL,
                preference3 VARCHAR(100) NOT NULL,
                preference4 VARCHAR(100) NOT NULL,
                preference5 VARCHAR(100) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "user_detail" created');

        // Create farm table
        await db.query(`
            CREATE TABLE IF NOT EXISTS farm (
                farm_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                user_id INT(11) NOT NULL,
                farm_name VARCHAR(150) NOT NULL,
                gps_coordinates VARCHAR(100) NOT NULL,
                farm_area INT(11) NOT NULL,
                farm_elevation INT(11) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES farmer(user_id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "farm" created');

        // Create crop_in_farm table
        await db.query(`
            CREATE TABLE IF NOT EXISTS crop_in_farm (
                crop_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                farm_id INT(11) NOT NULL,
                volume FLOAT NOT NULL,
                stock INT(11) NOT NULL DEFAULT 0,
                crop_name VARCHAR(150) NOT NULL,
                variety VARCHAR(150) NOT NULL,
                specification_1 VARCHAR(150),
                specification_2 VARCHAR(150),
                specification_3 VARCHAR(150),
                specification_4 VARCHAR(150),
                specification_5 VARCHAR(150),
                planting_date DATE NOT NULL,
                expected_harvest DATE NOT NULL,
                FOREIGN KEY (farm_id) REFERENCES farm(farm_id) ON DELETE CASCADE,
                INDEX idx_farm_id (farm_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        console.log('✓ Table "crop_in_farm" created');

        // Create crop_orders table
        await db.query(`
            CREATE TABLE IF NOT EXISTS crop_orders (
                crop_order_id INT(11) PRIMARY KEY AUTO_INCREMENT,
                crop_id INT(11) NOT NULL,
                user_id INT(11) NOT NULL,
                order_date DATE NOT NULL,
                quantity INT(11) NOT NULL,
                volume INT(11) NOT NULL,
                farmer_id INT(11) NOT NULL,
                farm_id INT(11) NOT NULL,
                expected_arrival DATE NOT NULL,
                FOREIGN KEY (crop_id) REFERENCES crop_in_farm(crop_id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY (farmer_id) REFERENCES farmer(user_id) ON DELETE CASCADE,
                FOREIGN KEY (farm_id) REFERENCES farm(farm_id) ON DELETE CASCADE,
                INDEX idx_crop_id (crop_id),
                INDEX idx_user_id (user_id),
                INDEX idx_farmer_id (farmer_id),
                INDEX idx_farm_id (farm_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);

            //     // MARKETS
            // await db.query(`
            // CREATE TABLE IF NOT EXISTS markets (
            //     id INT AUTO_INCREMENT PRIMARY KEY,
            //     name VARCHAR(100) NOT NULL,
            //     city VARCHAR(100) NOT NULL
            // )
            // `)

            // // CATEGORIES
            // await db.query(`
            // CREATE TABLE IF NOT EXISTS categories (
            //     id INT AUTO_INCREMENT PRIMARY KEY,
            //     name VARCHAR(100) NOT NULL
            // )
            // `)

            // // COMMODITIES
            // await db.query(`
            // CREATE TABLE IF NOT EXISTS commodities (
            //     id INT AUTO_INCREMENT PRIMARY KEY,
            //     category_id INT NOT NULL,
            //     name VARCHAR(150) NOT NULL,
            //     specification VARCHAR(150),
            //     FOREIGN KEY (category_id) REFERENCES categories(id)
            // )
            // `)

            // // PRICE RECORDS
            // await db.query(`
            // CREATE TABLE IF NOT EXISTS price_records (
            //     id INT AUTO_INCREMENT PRIMARY KEY,
            //     commodity_id INT NOT NULL,
            //     market_id INT NOT NULL,
            //     price_date DATE NOT NULL,
            //     prevailing_price DECIMAL(10,2),
            //     high_price DECIMAL(10,2),
            //     low_price DECIMAL(10,2),
            //     respondent_1 FLOAT(10,2) NULL,
            //     respondent_2 FLOAT(10,2) NULL,
            //     respondent_3 FLOAT(10,2) NULL,
            //     respondent_4 FLOAT(10,2) NULL,
            //     respondent_5 FLOAT(10,2) NULL,
            //     FOREIGN KEY (commodity_id) REFERENCES commodities(id),
            //     FOREIGN KEY (market_id) REFERENCES markets(id)
            // )
            // `);

        console.log('✓ Table "crop_orders" created');

        console.log('\n✅ Database setup completed successfully!');
        console.log('Database and tables created successfully');

        return { success: true, message: 'Database and tables created successfully, Please click Ctrl + C to stop the process and run "npm run" to start the server.' };

    } catch (error) {
        console.error('❌ Error creating database:', error.message, "Please go to localhost/phpmyadmin and create the database named 'farmers_marketplace' and try again.");
        return { success: false, error: error.message };
    } finally {
        if (db) {
            await db.end();
            console.log('✓ Database connection closed');
            console.log('Please click Ctrl + C to stop the process and run "npm run dev" to start the server.');
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('db.js')) {
    try{
        createDB();
    }catch(error){
        console.log("Error creating database: ", error)
    }
}

