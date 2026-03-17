// controllers/auth.controller.js

const Service = require("../services/auth.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {

    /**
     * REGISTER STUDENT
     */
    registerStudent: async (req, res) => {

        try {

            const {
                full_name,
                email,
                phone,
                password,
                confirm_password
            } = req.body;

            if (!full_name || !email || !password) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc"
                });
            }

            if (password !== confirm_password) {
                return res.status(400).json({
                    message: "Mật khẩu xác nhận không khớp"
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Mật khẩu phải có ít nhất 6 ký tự"
                });
            }

            // if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
            //     return res.status(400).json({
            //         message: "Mật khẩu phải có ít nhất 6 ký tự, gồm chữ và số"
            //     });
            // }

            const existingUser = await Service.findByEmail(email);

            if (existingUser) {
                return res.status(409).json({
                    message: "Email đã tồn tại"
                });
            }

            const userId = await Service.registerStudent({
                full_name,
                email,
                phone,
                password
            });

            res.status(201).json({
                message: "Đăng ký học viên thành công",
                user_id: userId
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    },

    /**
     * REGISTER TUTOR
     */
    registerTutor: async (req, res) => {

        try {

            const {
                full_name,
                email,
                phone,
                password,
                confirm_password
            } = req.body;

            if (!full_name || !email || !password) {
                return res.status(400).json({
                    message: "Thiếu thông tin bắt buộc"
                });
            }

            if (password !== confirm_password) {
                return res.status(400).json({
                    message: "Mật khẩu xác nhận không khớp"
                });
            }

            const existingUser = await Service.findByEmail(email);

            if (existingUser) {
                return res.status(409).json({
                    message: "Email đã tồn tại"
                });
            }

            const userId = await Service.registerTutor({
                full_name,
                email,
                phone,
                password
            });

            res.status(201).json({
                message: "Đăng ký gia sư thành công, chờ duyệt",
                user_id: userId
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    },

    /**
     * LOGIN
     */
    login: async (req, res) => {

        try {

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Vui lòng nhập email và mật khẩu"
                });
            }

            const user = await Service.findByEmail(email);

            if (!user) {
                return res.status(404).json({
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    message: "Email hoặc mật khẩu không đúng"
                });
            }

            const token = jwt.sign(
                {
                    id: user.user_id,
                    role_id: user.role_id
                },
                SECRET_KEY,
                { expiresIn: "24h" }
            );

            res.json({
                message: "Đăng nhập thành công",
                token,
                user: {
                    id: user.user_id,
                    name: user.full_name,
                    role_id: user.role_id,
                    avatar: user.avatar
                }
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    },

    /**
     * GET CURRENT USER
     */
    getMe: async (req, res) => {

        try {

            const user = await Service.findById(req.user.id);

            if (!user) {
                return res.status(404).json({
                    message: "User không tồn tại"
                });
            }

            res.json(user);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    }

};