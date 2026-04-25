import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pc.index(process.env.PINECONE_INDEX!);

let embedder: any;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
  }
  return embedder;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(output.data as Float32Array);
}

function chunkText(text: string, size = 800) {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + size));
    start += size;
  }
  return chunks;
}

export type ChunkScope = {
  docType: "policy" | "case";
  scopeId: string;
  userId: string;
  filename?: string;
};

export async function storeChunks(parsedText: string, scope: ChunkScope) {
  const chunks = chunkText(parsedText, 800);
  const stamp = Date.now();
  for (let i = 0; i < chunks.length; i++) {
    const vector = await embedText(chunks[i]);
    await index.upsert({
      records: [
        {
          id: `${scope.docType}-${scope.scopeId}-${stamp}-${i}`,
          values: vector,
          metadata: {
            text: chunks[i],
            type: scope.docType,
            scope_id: scope.scopeId,
            user_id: scope.userId,
            filename: scope.filename ?? "",
          },
        },
      ],
    });
  }
}

export type RetrievedChunk = {
  id: string;
  text: string;
  score: number;
};

export async function retrievePolicyChunks(
  query: string,
  opts: { policyId: string; userId: string; topK?: number },
): Promise<RetrievedChunk[]> {
  const vector = await embedText(query);
  const res = await index.query({
    vector,
    topK: opts.topK ?? 6,
    includeMetadata: true,
    filter: {
      type: "policy",
      scope_id: opts.policyId,
      user_id: opts.userId,
    },
  });
  return (res.matches ?? [])
    .map((m) => ({
      id: m.id,
      text: String(m.metadata?.text ?? ""),
      score: m.score ?? 0,
    }))
    .filter((c) => c.text.length > 0);
}
