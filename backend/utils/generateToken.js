import jwt from 'jsonwebtoken';

const generateToken = (res, adminId) => {
    const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

export default generateToken;