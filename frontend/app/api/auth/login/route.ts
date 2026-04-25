import { users } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
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

  if (!email || !password) {
    return Response.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const usersCol = await users();
  const user = await usersCol.findOne({ email });

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return Response.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  await setSessionCookie({ uid: user._id.toHexString(), email: user.email });

  return Response.json({ user: serializeUser(user) });
}
