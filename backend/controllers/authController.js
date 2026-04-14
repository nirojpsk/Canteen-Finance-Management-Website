import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";

// LOGIN ADMIN

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }
        const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");

        if (!admin) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                message: "Admin account is deactivated. Please contact support.",
            });
        }

        const isMatch = await admin.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        generateToken(res, admin._id);

        res.status(200).json({
            message: "Login successful",
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                profilePicture: admin.ProfilePicture,
                isActive: admin.isActive,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error login in Admin",
            error: error.message,
        });
    }
};


// LOGOUT ADMIN

const logoutAdmin = (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        res.status(200).json({
            message: "Logout successful",
        });

    } catch (error) {
        res.status(500).json({
            message: "Error logging out Admin",
            error: error.message,
        });
    }
};

// Get Logged-in AdminProfile

const getAdminProfile = async (req, res) => {
    try {
        return res.status(200).json({
            message: "Admin profile fetched successfully",
            admin: {
                _id: req.admin._id,
                name: req.admin.name,
                email: req.admin.email,
                profilePicture: req.admin.ProfilePicture,
                isActive: req.admin.isActive,
                createdAt: req.admin.createdAt,
                updatedAt: req.admin.updatedAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching Admin profile",
            error: error.message,
        });
    }
};

// update Admin Profile

const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;

        const admin = await Admin.findById(req.admin._id);

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
            });
        }

        if (email && email.toLowerCase() !== admin.email) {
            const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

            if (existingAdmin) {
                return res.status(400).json({
                    message: "Email is already in use",
                });
            }
        }
        admin.name = name || admin.name;
        admin.email = email ? email.toLowerCase() : admin.email;
        admin.ProfilePicture = profilePicture !== undefined ? profilePicture.trim() : admin.ProfilePicture;
        const updatedAdmin = await admin.save();

        return res.status(200).json({
            message: "Admin profile updated successfully",
            admin: {
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                profilePicture: updatedAdmin.ProfilePicture,
                isActive: updatedAdmin.isActive,
                createdAt: updatedAdmin.createdAt,
                updatedAt: updatedAdmin.updatedAt,
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating Admin profile",
            error: error.message,
        });
    }
};

// CHANGE PASSWORD

const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Please provide current password, new password and confirm password",
            });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters long",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "New password and confirm password do not match",
            });
        }
        const admin = await Admin.findById(req.admin._id).select("+password");

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found",
            });
        }

        const isMatch = await admin.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                message: "Current password is incorrect",
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }
        admin.password = newPassword;
        await admin.save();

        return res.status(200).json({
            message: "Admin password changed successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Error changing Admin password",
            error: error.message,
        });
    }
};


export { loginAdmin, logoutAdmin, getAdminProfile, updateAdminProfile, changeAdminPassword };
