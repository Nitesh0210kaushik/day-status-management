import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import {
  createRefreshToken,
  findActiveRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenByHash,
} from "../repositories/refresh-token.repository";
import { AppError } from "../utils/errors";

const SALT_ROUNDS = 12;

function createAccessToken(user: { id: string; email: string }) {
  return jwt.sign({ email: user.email }, env.jwtSecret, {
    subject: user.id,
    expiresIn: env.accessTokenExpiresIn,
  });
}

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getRefreshExpiry() {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + env.refreshTokenExpiresInDays);
  return expiry;
}

async function createSession(user: {
  id: string;
  email: string;
  createdAt: Date;
}) {
  const refreshToken = randomBytes(48).toString("hex");
  await createRefreshToken(
    hashRefreshToken(refreshToken),
    user.id,
    getRefreshExpiry(),
  );

  return {
    user,
    accessToken: createAccessToken(user),
    refreshToken,
  };
}

export async function register(email: string, password: string) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser(email, passwordHash);

  return createSession(user);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  const isValidPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !isValidPassword) {
    throw new AppError(401, "Invalid email or password");
  }

  return createSession({
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  });
}

export async function refresh(refreshToken: string) {
  const storedToken = await findActiveRefreshToken(
    hashRefreshToken(refreshToken),
  );

  if (!storedToken) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  await revokeRefreshToken(storedToken.id);
  return createSession({
    id: storedToken.user.id,
    email: storedToken.user.email,
    createdAt: storedToken.user.createdAt,
  });
}

export function getAccessTokenPayload(token: string) {
  return jwt.verify(token, env.jwtSecret) as { sub?: string; email?: string };
}

export function logout(refreshToken: string | undefined) {
  return refreshToken
    ? revokeRefreshTokenByHash(hashRefreshToken(refreshToken))
    : Promise.resolve();
}
