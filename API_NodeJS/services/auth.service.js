// services/auth.service.js

const bcrypt = require("bcryptjs");
const db = require("../common/db");

const SALT_ROUNDS = 10;

module.exports = {

    findByEmail: async (email) => {

        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ? AND deleted_at IS NULL",
            [email]
        );

        return rows[0];
    },

    findById: async (id) => {

        const [rows] = await db.execute(
            `SELECT 
                u.user_id,
                u.full_name,
                u.email,
                u.role_id,
                u.avatar,
                COALESCE(t.is_verified, 0) AS is_verified
             FROM users u
             LEFT JOIN tutors t ON t.user_id = u.user_id AND t.deleted_at IS NULL
             WHERE u.user_id = ? AND u.deleted_at IS NULL`,
            [id]
        );

        return rows[0];
    },

    registerStudent: async (data) => {

        const conn = await db.getConnection();

        try {

            await conn.beginTransaction();

            const hashPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

            const [userResult] = await conn.execute(

                `INSERT INTO users
                (role_id, full_name, email, phone, password)
                VALUES (3, ?, ?, ?, ?)`,
                [
                    data.full_name,
                    data.email,
                    data.phone,
                    hashPassword
                ]

            );

            const userId = userResult.insertId;

            await conn.execute(

                `INSERT INTO students (user_id)
                VALUES (?)`,
                [userId]

            );

            await conn.commit();

            return userId;

        } catch (error) {

            await conn.rollback();
            throw error;

        } finally {

            conn.release();

        }

    },

    registerTutor: async (data) => {

        const conn = await db.getConnection();

        try {

            await conn.beginTransaction();

            const hashPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

            const [userResult] = await conn.execute(

                `INSERT INTO users
                (role_id, full_name, email, phone, password)
                VALUES (2, ?, ?, ?, ?)`,
                [
                    data.full_name,
                    data.email,
                    data.phone,
                    hashPassword
                ]

            );

            const userId = userResult.insertId;

            await conn.execute(

                `INSERT INTO tutors
                (user_id, approval_status)
                VALUES (?, 'pending')`,
                [userId]

            );

            await conn.commit();

            return userId;

        } catch (error) {

            await conn.rollback();
            throw error;

        } finally {

            conn.release();

        }

    }

};