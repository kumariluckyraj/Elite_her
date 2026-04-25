import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { storeChunks, type ChunkScope } from "./rag";
import type { EmbeddedDoc } from "./db";

const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "",
);
const UPLOAD_ROOT = join(process.cwd(), "uploads");

type ParseScope = {
  docType: "policy" | "case";
  scopeId: string;
  userId: string;
};

export type ParsedDocResult = {
  doc: EmbeddedDoc;
  fromCache: boolean;
};

export async function parseAndIndexDocs(
  docs: EmbeddedDoc[],
  scope: ParseScope,
): Promise<ParsedDocResult[]> {
  const results: ParsedDocResult[] = [];
  for (const doc of docs) {
    if (doc.parsed_text && doc.parsed_text.length > 0) {
      results.push({ doc, fromCache: true });
      continue;
    }

    const fullPath = join(UPLOAD_ROOT, doc.stored_path);
    const bytes = await readFile(fullPath);
    const blob = new Blob([new Uint8Array(bytes)], {
      type: doc.mime_type ?? "application/pdf",
    });

    const fd = new FormData();
    fd.append("files", blob, doc.original_name);

    let res: Response;
    try {
      res = await fetch(`${BACKEND_URL}/parse`, { method: "POST", body: fd });
    } catch (err) {
      if (err instanceof TypeError) {
        throw new Error(
          `Document parser backend unreachable at ${BACKEND_URL}. ` +
            `Start it with: cd backend && python -m uvicorn app:app --port 8000`,
        );
      }
      throw err;
    }
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Parse backend failed (${res.status}) for ${doc.original_name}: ${errText.slice(0, 200)}`,
      );
    }
    const data = (await res.json()) as {
      documents?: Array<{ filename: string; content: string }>;
    };
    const parsed = data.documents?.[0]?.content ?? "";

    const chunkScope: ChunkScope = {
      docType: scope.docType,
      scopeId: scope.scopeId,
      userId: scope.userId,
      filename: doc.original_name,
    };
    if (parsed.trim().length > 0) {
      await storeChunks(parsed, chunkScope);
    }

    const updated: EmbeddedDoc = {
      ...doc,
      parsed_text: parsed,
      parsed_at: new Date(),
    };
    results.push({ doc: updated, fromCache: false });
  }
  return results;
}
