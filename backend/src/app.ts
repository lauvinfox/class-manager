import "dotenv/config";
import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import Router from "@routes/index";
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
app.use(Router);

// Error Handler
app.use(errorHandler);

export default app;
