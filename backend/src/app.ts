import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import healthRouter from "./routes/health.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.use("/api/health", healthRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
