import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token provided",
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin) {
            return res.status(401).json({
                message: "Not authorized, admin not found",
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                message: "Account is inactive. Please contact support.",
            });
        }
        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Not authorized to perform this task",
            error: error.message,
        });
    }
};

export default protect;