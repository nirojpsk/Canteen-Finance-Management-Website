import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, "Student name must be at least 2 characters long"],
        maxlength: [50, "Student name must be less than 50 characters long"],
    },
    className: {
        type: String,
        required: [true, 'Class name is required'],
        trim: true,
        maxlength: [20, "Class name must be less than 20 characters long"],
    },

    section: {
        type: String,
        trim: true,
        maxlength: [20, "Section name must be less than 20 characters long"],
        default: "",
    },

    rollNumber: {
        type: String,
        trim: true,
        maxlength: [20, "Roll number must be less than 20 characters long"],
        default: "",
    },

    phone: {
        type: String,
        trim: true,
        maxlength: [15, "Phone number must be less than 15 characters long"],
        default: "",
    },
    
    address: {
        type: String,
        trim: true,
        maxlength: [100, "Address must be less than 100 characters long"],
        default: "",
    },
    
    isActive: {
        type: Boolean,
        default: true,
    },

    note: {
        type: String,
        trim: true,
        maxlength: [200, "Note must be less than 200 characters long"],
        default: "",
    },
}, { timestamps: true });


const Student = mongoose.model('Student', studentSchema);

export default Student;