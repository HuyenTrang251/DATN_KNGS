// common/db.js

const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ket_noi_gia_su',
    dateStrings: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool({
    ...dbConfig
});

module.exports = {
    
    execute: (sql, params) => pool.execute(sql, params),

    query: async (sql, params) => {
        const [results] = await pool.execute(sql, params);
        return results;
    },

    getConnection: () => pool.getConnection()

};