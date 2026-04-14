import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Expense title is required"],
        trim: true,
        minlength: [2, "Expense title must be at least 2 characters long"],
        maxlength: [100, "Expense title must be less than 100 characters long"]
    },
    amount: {
        type: Number,
        required: [true, "Expense amount is required"],
        min: [1, "Amount must be at least 1"]
    },
    category: {
        type: String,
        required: [true, "Expense category is required"],
        enum: [
            "stock",
            "drinks",
            "gas",
            "salary",
            "rent",
            "electricity",
            "miscellaneous"
        ],
        lowercase: true,
        trim: true
    },
    expenseDate: {
        type: Date,
        required: [true, "Expense date is required"],
        default: Date.now,
    },

    note: {
        type: String,
        trim: true,
        maxlength: [500, "Note must be less than 500 characters long"]
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: [true, "Expense must be associated with an admin user"]
    },
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;