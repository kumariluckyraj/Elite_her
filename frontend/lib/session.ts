import { cookies } from "next/headers";
import { toObjectId, users, type UserDoc } from "./db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSession,
  verifySession,
  type SessionPayload,
} from "./auth";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser(): Promise<UserDoc | null> {
  const session = await getSession();
  if (!session) return null;
  const oid = toObjectId(session.uid);
  if (!oid) return null;
  const usersCol = await users();
  return await usersCol.findOne({ _id: oid });
}

export async function requireUser(): Promise<UserDoc> {
  const user = await getCurrentUser();
  if (!user) {
    throw new HttpError(401, "Not authenticated");
  }
  return user;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
