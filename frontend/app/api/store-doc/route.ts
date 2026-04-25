import { storeChunks } from "@/lib/rag";

export async function POST(req: Request) {
  try {
    const body = await req.json();


    if (!Array.isArray(body)) {
      return Response.json(
        { error: "Body must be an array of documents" },
        { status: 400 }
      );
    }

    for (const doc of body) {
      if (!doc?.content) continue;

      await storeChunks(doc.content);
    }

    return Response.json({
      success: true,
      message: "Documents stored in Pinecone"
    });

  } catch (err: any) {
    console.error("STORE DOC ERROR:", err);

    return Response.json(
      {
        success: false,
        error: err.message
      },
      { status: 500 }
    );
  }
}