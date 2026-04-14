import Admin from "../models/Admin.js";
import connectDB from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({email: process.env.ADMIN_EMAIL?.toLowerCase().trim()});

        if (existingAdmin){
            console.log("Admin already exists");
            process.exit(0);
        }

        const admin = await Admin.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL?.toLowerCase().trim(),
            password: process.env.ADMIN_PASSWORD,
            ProfilePicture: "",
        });

        console.log("Admin created Successfully", {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        });
        process.exit(0); // yesle chai process lai exit garxa after seeding ra 0 le indicate garxa ki sabai thik cha
    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exit(1); // yesle chai process lai exit garxa with error code 1 ra error code 1 le indicate garxa ki error aayo
    }
};

seedAdmin();
