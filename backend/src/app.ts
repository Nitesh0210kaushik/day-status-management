import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { apiRateLimiter } from "./middleware/rate-limit";
import { requireCsrf } from "./middleware/csrf.middleware";
import authRouter from "./routes/auth.routes";
import dayStatusRouter from "./routes/day-status.routes";
import healthRouter from "./routes/health.routes";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(
  pinoHttp({
    redact: {
      paths: [
        "req.headers.cookie",
        "req.headers.authorization",
        "res.headers.set-cookie",
      ],
      remove: true,
    },
    transport:
      env.nodeEnv === "development"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  }),
);

app.use("/api", apiRateLimiter);
app.use("/api/v1", requireCsrf);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/day-status", dayStatusRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
