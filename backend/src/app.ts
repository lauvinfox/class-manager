import "dotenv/config";
import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import StudentRouter from "@routes/student.route";
import UserRouter from "@routes/user.route";
import AuthRouter from "@routes/auth.route";
import errorHandler from "@middleware/errorHandler";

const app: Application = express();

// Set up express for json bodies
app.use(express.json());

// Debugging
app.use(morgan("dev"));

app.use(cors());

// Middleware for cookies
app.use(cookieParser());

// Set up routes
// Student API
app.use("/api/v1/students", StudentRouter);

// User API
app.use("/api/v1/users", UserRouter);

// Auth API
app.use("/auth", AuthRouter);

// Error Handler
app.use(errorHandler);

export default app;
