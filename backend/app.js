import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js"; 
import expenseRoutes from "./routes/expenseRoute.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notFound from "./middlewares/notFoundMiddleware.js";
import errorHandler from "./middlewares/errorMiddleware.js";

const app = express();

// Body parser middleware: yesko matlab chai client bata aune data lai parse garna ko lagi ho

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware: yesko matlab chai client bata aune cookies lai parse garna ko lagi ho

app.use(cookieParser());

// CORS Middleware: yesko matlab chai cross-origin requests lai allow garna ko lagi ho

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);

// Test Route: yesko matlab chai server chaliraheko cha ki nai bhanera test garna ko lagi ho

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Canteen Finance Management System API is running",
    });
});

// Auth Routes: yesko matlab chai authentication related routes lai handle garna ko lagi ho

app.use("/api/auth", authRoutes);
// Student Routes: yesko matlab chai student related routes lai handle garna ko lagi ho
app.use("/api/students", studentRoutes);
// Income Routes: yesko matlab chai income related routes lai handle garna ko lagi ho
app.use("/api/income", incomeRoutes);
// Expense Routes: yesko matlab chai expense related routes lai handle garna ko lagi ho
app.use("/api/expenses", expenseRoutes);
// Dashboard Routes: yesko matlab chai dashboard related routes lai handle garna ko lagi ho
app.use("/api/dashboard", dashboardRoutes);
// Not Found Middleware: yesko matlab chai jaba client le invalid route ma request pathaune ho tyo handle garna ko lagi ho
app.use(notFound);

// Error Handler Middleware: yesko matlab chai jaba server ma kunai error aune ho tyo handle garna ko lagi ho

app.use(errorHandler);

export default app;
