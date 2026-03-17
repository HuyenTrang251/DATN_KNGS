// const jwt = require('jsonwebtoken');
// const SECRET_KEY = process.env.SECRET_KEY || "YOUR_SECRET_KEY";

// const authentic = (requiredRoles = []) => {
//     return (req, res, next) => {
//         const authHeader = req.headers['authorization'];
//         const token = authHeader && authHeader.split(' ')[1];

//         if (!token) return res.status(401).json({ message: "Thiếu Token" });

//         try {
//             const decoded = jwt.verify(token, SECRET_KEY);
//             req.userId = decoded.userId;
//             req.userRole = decoded.roleName; // Tên role: 'admin', 'tutor', 'student'

//             // Kiểm tra quyền (nếu có yêu cầu)
//             if (requiredRoles.length > 0 && !requiredRoles.includes(req.userRole)) {
//                 return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
//             }
//             next();
//         } catch (err) {
//             return res.status(403).json({ message: "Token không hợp lệ hoặc hết hạn" });
//         }
//     };
// };

// module.exports = authentic; cũ

// middlewares/authentic.js

const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error("SECRET_KEY chưa được cấu hình trong .env");
}

const authentic = (requiredRoles = []) => {

    return (req, res, next) => {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Thiếu Authorization header"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Thiếu token"
            });
        }

        try {

            const decoded = jwt.verify(token, SECRET_KEY);

            req.user = decoded;

            // kiểm tra role nếu có yêu cầu
            if (requiredRoles.length > 0) {
                if (!requiredRoles.includes(decoded.role_id)) {
                    return res.status(403).json({
                        message: "Không có quyền truy cập"
                    });
                }
            }

            next();

        } catch (error) {

            return res.status(401).json({
                message: "Token không hợp lệ hoặc đã hết hạn"
            });

        }
    };
};

module.exports = authentic;