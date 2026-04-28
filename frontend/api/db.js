import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    database: process.env.PGDATABASE || 'neondb',
    password: process.env.PGPASSWORD || '',
    port: process.env.PGPORT || 5432,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
})

export const db = pool