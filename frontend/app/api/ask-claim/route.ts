import { embedText } from "@/lib/rag";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!
});

const index = pc.index(process.env.PINECONE_INDEX!);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});


function safeJSONParse(text: string) {
  try {

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ RAW MODEL OUTPUT:", text);

    return {
      status: "NEEDS_REVIEW",
      risk_score: 50,
      reason: "Model returned invalid format",
      summary: "Could not parse model response properly",
      suggested_fix:
        "Force model to return strict JSON without markdown or explanations"
    };
  }
}

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return Response.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }


    const qEmbedding = await embedText(question);

    // 2. Retrieve ONLY policy context
    const matches = await index.query({
      vector: qEmbedding,
      topK: 6,
      includeMetadata: true,
      filter: {
        type: "policy"
      }
    });

    const context = matches.matches
      ?.map((m) => m.metadata?.text)
      .filter(Boolean)
      .join("\n") || "";


    if (!context.trim()) {
      return Response.json({
        result: {
          status: "NEEDS_REVIEW",
          risk_score: 70,
          reason: "No policy documents found in knowledge base",
          summary:
            "System cannot evaluate claim without insurance policy rules",
          suggested_fix:
            "Upload insurance policy document containing coverage and exclusion rules first"
        }
      });
    }

    // 4. GROQ DECISION ENGINE
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an insurance claim decision engine.

You must act like a strict insurance officer.

DECISION RULES:
- APPROVED → policy clearly allows claim
- REJECTED → policy explicitly excludes claim
- NEEDS_REVIEW → missing or unclear evidence

FOR NEEDS_REVIEW:
- explain what is missing
- explain why unclear
- give exact required documents or details

OUTPUT MUST BE VALID JSON ONLY:
{
  "status": "APPROVED | REJECTED | NEEDS_REVIEW",
  "risk_score": number (0-100),
  "reason": string,
  "summary": string,
  "suggested_fix": string
}
`
        },
        {
          role: "user",
          content: `
POLICY CONTEXT:
${context}

CLAIM QUESTION:
${question}
`
        }
      ]
    });


    const raw = response.choices[0].message.content || "{}";
    const result = safeJSONParse(raw);


    return Response.json({ result });

  } catch (err: any) {
    console.error("ASK CLAIM ERROR:", err);

    return Response.json(
      {
        error: "Internal server error",
        details: err.message
      },
      { status: 500 }
    );
  }
}