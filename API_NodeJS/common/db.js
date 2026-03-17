// common/db.js

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'ket_noi_gia_su',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    
    execute: (sql, params) => pool.execute(sql, params),

    query: async (sql, params) => {
        const [results] = await pool.execute(sql, params);
        return results;
    },

    getConnection: () => pool.getConnection()

};