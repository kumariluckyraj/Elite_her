import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!
});

const index = pc.index(process.env.PINECONE_INDEX!);

let embedder: any;

async function getEmbedder() {
    if (!embedder) {
        embedder = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );
    }
    return embedder;
}


export async function embedText(text: string): Promise<number[]> {
    const model = await getEmbedder();

    const output = await model(text, {
        pooling: "mean",
        normalize: true
    });

    return Array.from(output.data as Float32Array);
}


function chunkText(text: string, size = 800) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
        chunks.push(text.slice(start, start + size));
        start += size;
    }

    return chunks;
}


export async function storeChunks(parsedText: string, docType: string = "policy") {

    console.log("🔥 storeChunks CALLED");

    const chunks = chunkText(parsedText, 800);

    for (let i = 0; i < chunks.length; i++) {

        const vector = await embedText(chunks[i]);

        await index.upsert({
            records: [
                {
                    id: `${docType}-${Date.now()}-${i}`,
                    values: vector,
                    metadata: {
                        text: chunks[i],
                        type: docType
                    }
                }
            ]
        });

        console.log(` Stored chunk ${i} (${docType})`);
    }
}