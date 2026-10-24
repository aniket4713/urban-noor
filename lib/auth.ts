import { cookies } from "next/headers";
import { AUTH_COOKIE, TOKEN_TTL_SECONDS, signToken, verifyToken, type SessionUser } from "./jwt";
import { ApiError } from "./api";

/** Read the logged-in user from the httpOnly cookie (server components & route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Please log in to continue");
  return session;
}

/** Every admin API route calls this — the middleware check alone is not enough. */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Please log in");
  if (session.role !== "ADMIN") throw new ApiError(403, "Admins only");
  return session;
}

export async function setSessionCookie(user: SessionUser) {
  const token = await signToken(user);
  cookies().set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
