import { cases, policies, toObjectId } from "@/lib/db";
import { requireUser, HttpError } from "@/lib/session";
import { deleteUpload } from "@/lib/uploads";
import { serializeCase } from "@/lib/serialize";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/cases/[id]">,
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const oid = toObjectId(id);
    if (!oid) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }
    const casesCol = await cases();
    const doc = await casesCol.findOne({ _id: oid, user_id: user._id });
    if (!doc) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }
    const policiesCol = await policies();
    const policy = await policiesCol.findOne(
      { _id: doc.policy_id },
      { projection: { insurer: 1, policy_name: 1 } },
    );
    return Response.json({ case: serializeCase(doc, policy) });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/cases/[id]">,
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const oid = toObjectId(id);
    if (!oid) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }
    const casesCol = await cases();
    const doc = await casesCol.findOne({ _id: oid, user_id: user._id });
    if (!doc) {
      return Response.json({ error: "Case not found" }, { status: 404 });
    }
    for (const d of doc.documents ?? []) deleteUpload(d.stored_path);
    await casesCol.deleteOne({ _id: oid });
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
