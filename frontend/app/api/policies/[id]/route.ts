import { policies, toObjectId } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { deleteUpload } from "@/lib/uploads";
import { serializePolicy } from "@/lib/serialize";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/policies/[id]">,
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const oid = toObjectId(id);
    if (!oid) {
      return Response.json({ error: "Policy not found" }, { status: 404 });
    }
    const col = await policies();
    const doc = await col.findOne({ _id: oid, user_id: user._id });
    if (!doc) {
      return Response.json({ error: "Policy not found" }, { status: 404 });
    }
    return Response.json({ policy: serializePolicy(doc) });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/policies/[id]">,
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const oid = toObjectId(id);
    if (!oid) {
      return Response.json({ error: "Policy not found" }, { status: 404 });
    }
    const col = await policies();
    const doc = await col.findOne({ _id: oid, user_id: user._id });
    if (!doc) {
      return Response.json({ error: "Policy not found" }, { status: 404 });
    }

    for (const d of doc.documents ?? []) deleteUpload(d.stored_path);
    await col.deleteOne({ _id: oid });

    return Response.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

function handleError(e: unknown) {
  if (e instanceof HttpError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  console.error(e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
