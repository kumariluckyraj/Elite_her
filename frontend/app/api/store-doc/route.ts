import { storeChunks } from "@/lib/rag";
import { requireUser, HttpError } from "@/lib/session";

type IncomingDoc = {
  content?: string;
  filename?: string;
  doc_type?: "policy" | "case";
  scope_id?: string;
};

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = (await req.json()) as IncomingDoc[] | unknown;

    if (!Array.isArray(body)) {
      return Response.json(
        { error: "Body must be an array of documents" },
        { status: 400 },
      );
    }

    const userIdStr = user._id.toHexString();

    for (const doc of body) {
      if (!doc?.content) continue;
      const docType: "policy" | "case" =
        doc.doc_type === "case" ? "case" : "policy";
      const scopeId = doc.scope_id ?? `adhoc-${userIdStr}`;
      await storeChunks(doc.content, {
        docType,
        scopeId,
        userId: userIdStr,
        filename: doc.filename,
      });
    }

    return Response.json({
      success: true,
      message: "Documents stored in Pinecone",
    });
  } catch (err) {
    if (err instanceof HttpError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("STORE DOC ERROR:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
