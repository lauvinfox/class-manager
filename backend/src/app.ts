import "dotenv/config";
import express, { Application } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import { swaggerSpec, swaggerUi } from "./config/swagger";

import Router from "@routes/index";
import errorHandler from "@middleware/errorHandler";

const app: Application = express();

// Set up express for json bodies
app.use(express.json());

// Debugging
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5000",
    credentials: true,
  })
);

// Middleware for cookies
app.use(cookieParser());

// Set up routes
app.use(Router);

// Error Handler
app.use(errorHandler);

// Set up Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
