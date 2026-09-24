import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail } from "../repositories/user.repository";
import {
  createSession,
  findActiveSession,
  revokeSession,
  revokeSessionByHash,
} from "../repositories/session.repository";
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

async function createAuthSession(user: {
  id: string;
  email: string;
  fullName?: string | null;
  createdAt: Date;
}) {
  const refreshToken = randomBytes(48).toString("hex");
  await createSession(
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

export async function register(
  email: string,
  password: string,
  fullName: string,
) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser(email, passwordHash, fullName);

  return createAuthSession(user);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  const isValidPassword = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !isValidPassword) {
    throw new AppError(401, "Invalid email or password");
  }

  return createAuthSession({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  });
}

export async function refresh(refreshToken: string) {
  const storedToken = await findActiveSession(hashRefreshToken(refreshToken));

  if (!storedToken) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  await revokeSession(storedToken.id);
  return createAuthSession({
    id: storedToken.user.id,
    email: storedToken.user.email,
    fullName: storedToken.user.fullName,
    createdAt: storedToken.user.createdAt,
  });
}

export function getAccessTokenPayload(token: string) {
  return jwt.verify(token, env.jwtSecret) as { sub?: string; email?: string };
}

export function logout(refreshToken: string | undefined) {
  return refreshToken
    ? revokeSessionByHash(hashRefreshToken(refreshToken))
    : Promise.resolve();
}
