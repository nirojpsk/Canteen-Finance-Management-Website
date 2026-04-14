import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, "Student is required"],
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [1, "Amount must be at least 1"],
    },
    paymentMethod: {
        type: String,
        enum: ["cash", "esewa", "khalti", "bank", "other"],
        default: "cash",
        lowercase: true,
        trim: true,
    },
    incomeDate: {
        type: Date,
        required: [true, "Income date is required"],
        default: Date.now,
    },
    title: {
        type: String,
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"],
        default: "",
    },
    note: {
        type: String,
        trim: true,
        maxlength: [500, "Note cannot exceed 500 characters"],
        default: "",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: [true, "Created by is required"],
    },
}, { timestamps: true });

const Income = mongoose.model('Income', incomeSchema);

export default Income;