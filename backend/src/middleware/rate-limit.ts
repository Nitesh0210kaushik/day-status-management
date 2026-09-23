import rateLimit from "express-rate-limit";

const commonOptions = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
};

export const apiRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 120,
  skip: (request) =>
    request.path === "/health" || request.path === "/v1/health",
  message: { error: "Too many API requests. Please try again later." },
});

export const loginRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: "Too many login attempts. Please try again later." },
});

export const registerRateLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: "Too many registration attempts. Please try again later." },
});
