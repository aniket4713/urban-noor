// Edge-safe JWT helpers (used by middleware.ts AND server code). Only depends on `jose`.
import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE = "un_token";
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  sub: string; // user id
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET is missing or too short. Set it in your .env file.");
  }
  return new TextEncoder().encode(s);
}

export async function signToken(user: SessionUser) {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret());
}

export async function verifyToken(token?: string | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    };
  } catch {
    return null;
  }
}
