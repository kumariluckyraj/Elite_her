import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "dev-only-claimshield-session-secret-change-me",
);

export const SESSION_COOKIE = "cs_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export type SessionPayload = {
  uid: string;
  email: string;
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(SESSION_SECRET);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    if (typeof payload.uid !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return { uid: payload.uid, email: payload.email };
  } catch {
    return null;
  }
}
