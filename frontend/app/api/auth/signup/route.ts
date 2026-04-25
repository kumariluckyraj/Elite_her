import { ObjectId, users } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { serializeUser } from "@/lib/serialize";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Enter a valid email" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  const usersCol = await users();
  const existing = await usersCol.findOne({ email });
  if (existing) {
    return Response.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const _id = new ObjectId();
  const created_at = new Date();
  await usersCol.insertOne({
    _id,
    email,
    password_hash: passwordHash,
    created_at,
  });

  const uid = _id.toHexString();
  await setSessionCookie({ uid, email });

  return Response.json({
    user: serializeUser({ _id, email, password_hash: passwordHash, created_at }),
  });
}
