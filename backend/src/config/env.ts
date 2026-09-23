import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

const accessTokenExpiresIn = (process.env.ACCESS_TOKEN_EXPIRES_IN ??
  "15m") as SignOptions["expiresIn"];
const refreshTokenExpiresInDays = Number(
  process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? 7,
);

function durationToMilliseconds(value: SignOptions["expiresIn"]): number {
  if (typeof value === "number") return value * 1000;

  const match = /^([0-9]+)([smhd])$/.exec(String(value));
  if (!match)
    throw new Error(
      "ACCESS_TOKEN_EXPIRES_IN must use formats such as 900, 15m, 1h, or 1d",
    );

  const multipliers = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  } as const;
  return Number(match[1]) * multipliers[match[2] as keyof typeof multipliers];
}

const accessTokenCookieMaxAgeMs = durationToMilliseconds(accessTokenExpiresIn);

if (
  !Number.isInteger(refreshTokenExpiresInDays) ||
  refreshTokenExpiresInDays <= 0
) {
  throw new Error("REFRESH_TOKEN_EXPIRES_IN_DAYS must be a positive integer");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  jwtSecret,
  accessTokenExpiresIn,
  accessTokenCookieMaxAgeMs,
  refreshTokenExpiresInDays,
  secureCookies: process.env.NODE_ENV === "production",
} as const;
