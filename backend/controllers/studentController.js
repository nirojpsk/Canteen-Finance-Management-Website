import mongoose from "mongoose";
import Student from "../models/Student.js";
import Income from "../models/Income.js";

// Create a new Student

const createStudent = async (req, res) => {
    try {
        const {
            fullName,
            className,
            section,
            rollNumber,
            phone,
            address,
            note,
        } = req.body;

        if (!fullName || !className) {
            return res.status(400).json({
                message: "Full name and class name are required"
            });
        }

        const existingStudent = await Student.findOne({
            fullName: fullName.trim(),
            className: className.trim(),
            section: section ? section.trim() : "",
            rollNumber: rollNumber ? rollNumber.trim() : "",
        });

        if (existingStudent) {
            return res.status(400).json({
                message: "Student with the same details already exists"
            });
        }
        const student = await Student.create({
            fullName: fullName.trim(),
            className: className.trim(),
            section: section ? section.trim() : "",
            rollNumber: rollNumber ? rollNumber.trim() : "",
            phone: phone ? phone.trim() : "",
            address: address ? address.trim() : "",
            note: note ? note.trim() : "",
        });

        return res.status(201).json({
            message: "Student created successfully",
            student,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating student",
            error: error.message
        });
    }
};

// Get all students 

const getAllStudents = async (req, res) => {
    try {
        const { search = "", status = "active", className = "" } = req.query;
        const query = {}; // yesle chai sabai students lai fetch garnu madat garxa

        if (search.trim()) {
            query.$or = [ // query.$or le chai multiple conditions ma search garna madat garxa
                { fullName: { $regex: search.trim(), $options: "i" } }, // $regex le chai regular expression use garera search garna madat garxa, $options: "i" le chai case-insensitive search garna madat garxa
                { rollNumber: { $regex: search.trim(), $options: "i" } },
                { phone: { $regex: search.trim(), $options: "i" } },
            ];
        }

        if (className.trim()) {
            query.className = { $regex: `^{className.trim()}$`, $options: "i" }; // exact match for className
        }

        if (status === "active") {
            query.isActive = true;
        } else if (status === "inactive") {
            query.isActive = false;
        }

        const students = (await Student.find(query)).toSorted({ createdAt: -1 }); // createdAt field ko basis ma students lai descending order ma sort garna madat garxa

        res.status(200).json({
            message: "Students fetched successfully",
            count: students.length,
            students,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching students",
            error: error.message
        });
    }
};

// Get single student by ID

const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID",
            });
        }
        const student = await Student.findById(id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }
        return res.status(200).json({
            message: "Student fetched successfully",
            student,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching student",
            error: error.message
        });
    }
};

// update Student by ID

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fullName,
            className,
            section,
            rollNumber,
            phone,
            address,
            note,
            isActive,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID",
            });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }
        if (fullName !== undefined) student.fullName = fullName.trim();
        if (className !== undefined) student.className = className.trim();
        if (section !== undefined) student.section = section.trim();
        if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();
        if (phone !== undefined) student.phone = phone.trim();
        if (address !== undefined) student.address = address.trim();
        if (note !== undefined) student.note = note.trim();
        if (typeof isActive !== undefined) student.isActive = isActive;

        const updatedStudent = await student.save();

        return res.status(200).json({
            message: "Student updated successfully",
            student: updatedStudent,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating student",
            error: error.message
        });
    }
};

// Toogle student active/inactive status

const toggleStudentStatus = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID",
            });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        student.isActive = !student.isActive;
        const updatedStudent = await student.save();

        return res.status(200).json({
            message: "Student status updated successfully",
            student: updatedStudent,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error toggling student status",
            error: error.message
        });
    }
};

// Get student income history by student ID

const getStudentIncomeHistory = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid student ID",
            });
        }

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        const incomeQuery = { student: id };

        if (PaymentMethod.trim()) {
            incomeQuery.paymentMethod = paymentMethod.trim().toLowerCase();
        }

        if (period) {
            const now = new Date();
            let startDate = null;
            if (period === "daily") {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (period === "weekly") {
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
            } else if (period === "monthly") {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (period === "yearly") {
                startDate = new Date(now.getFullYear(), 0, 1);
            }
            if (startDate){
                incomeQuery.incomeDate = { $gte: startDate, $lte: now};
            }
        }

        const incomeHistory = await Income.find(incomeQuery)
        .populate("student", "fullName className section rollNumber")
        .sort({ incomeDate: -1 });

        const totalIncome = incomeHistory.reduce((sum, item) => sum + item.amount, 0);

        return res.status(200).json({
            message: "Student income history fetched successfully",
            count: incomeHistory.length,
            totalIncome,
            incomeHistory,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching student income history",
            error: error.message
        });
    }
};



export { createStudent, getAllStudents, getStudentById, updateStudent, toggleStudentStatus, getStudentIncomeHistory };