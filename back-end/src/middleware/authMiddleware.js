import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.headers.token?.split(" ")[1] || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ!" });
        }
        req.user = user;
        next(); 
    });
};