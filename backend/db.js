import mysql2 from 'mysql2/promise'

export const db = mysql2.createPool({
    host:'localhost',
    user:'root',
    database:'farmers_marketplace',
    password:'',
})