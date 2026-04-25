import { getCurrentUser } from "@/lib/session";
import { serializeUser } from "@/lib/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({ user: serializeUser(user) });
}
