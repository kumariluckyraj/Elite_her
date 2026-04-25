"use client";

import { useState } from "react";

export default function UploadInsurance() {

    const [files, setFiles] = useState<FileList | null>(null);
    const [docs, setDocs] = useState<any[]>([]);
    const [question, setQuestion] = useState("");

    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const [loadingUpload, setLoadingUpload] = useState(false);
    const [loadingAsk, setLoadingAsk] = useState(false);

    // ---------------- UPLOAD ----------------
    const uploadPDF = async () => {
        if (!files) return;

        setLoadingUpload(true);
        setError("");

        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            // STEP 1: Parse PDF
            const res = await fetch("http://localhost:8000/parse", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            setDocs(data.documents || []);

            // STEP 2: Store in Pinecone
            await fetch("http://localhost:3000/api/store-doc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data.documents)
            });

        } catch (err: any) {
            console.error(err);
            setError("Upload failed. Check backend.");
        }

        setLoadingUpload(false);
    };

    // ---------------- ASK QUESTION ----------------
    const askQuestion = async () => {
        if (!question) return;

        setLoadingAsk(true);
        setResult(null);
        setError("");

        try {
            const res = await fetch("http://localhost:3000/api/ask-claim", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ question })
            });

            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setResult(data.result);
            }

        } catch (err: any) {
            console.error(err);
            setError("Failed to get AI response.");
        }

        setLoadingAsk(false);
    };

    // ---------------- UI HELPERS ----------------
    const getColor = (status: string) => {
        if (!status) return "text-gray-600";
        if (status === "APPROVED") return "text-green-600";
        if (status === "REJECTED") return "text-red-600";
        return "text-yellow-600";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">

            <h1 className="text-3xl font-bold mb-6 text-center">
                AI Insurance Claims Assistant
            </h1>

            {error && (
                <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ---------------- LEFT PANEL ---------------- */}
                <div className="bg-white p-5 rounded-xl shadow">

                    <h2 className="text-xl font-semibold mb-4">
                        Upload Documents
                    </h2>

                    <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={(e) => setFiles(e.target.files)}
                        className="mb-4"
                    />

                    <button
                        onClick={uploadPDF}
                        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                    >
                        {loadingUpload ? "Processing..." : "Upload & Parse"}
                    </button>

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Uploaded Docs</h3>

                        {docs.length === 0 && (
                            <p className="text-gray-500 text-sm">
                                No documents uploaded yet
                            </p>
                        )}

                        {docs.map((doc, i) => (
                            <div key={i} className="border rounded p-3 mb-3 bg-gray-50">

                                <p className="font-bold text-sm">
                                    {doc.filename}
                                </p>

                                <p className="text-xs text-gray-600 mt-1 line-clamp-3">
                                    {doc.content}
                                </p>

                            </div>
                        ))}
                    </div>
                </div>

                {/* ---------------- RIGHT PANEL ---------------- */}
                <div className="bg-white p-5 rounded-xl shadow flex flex-col">

                    <h2 className="text-xl font-semibold mb-4">
                        Ask AI About Claims
                    </h2>

                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. Is heart attack treatment covered?"
                        className="border p-3 rounded w-full h-28 mb-3"
                    />

                    <button
                        onClick={askQuestion}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        {loadingAsk ? "Thinking..." : "Ask AI"}
                    </button>

                    {/* ---------------- RESULT BOX ---------------- */}
                    <div className="mt-6 flex-1">

                        <h3 className="font-semibold mb-2">AI Decision</h3>

                        {!result && (
                            <div className="bg-gray-50 border rounded p-4 min-h-[200px] text-gray-500">
                                Response will appear here...
                            </div>
                        )}

                        {result && (
                            <div className="bg-gray-50 border rounded p-4 space-y-3">

                                <p className={`font-bold text-lg ${getColor(result.status)}`}>
                                    {result.status}
                                </p>

                                <p>
                                    <span className="font-semibold">Risk Score:</span>{" "}
                                    {result.risk_score}
                                </p>

                                <p>
                                    <span className="font-semibold">Reason:</span>{" "}
                                    {result.reason}
                                </p>

                                <p>
                                    <span className="font-semibold">Summary:</span>{" "}
                                    {result.summary}
                                </p>

                                {result.suggested_fix && (
                                    <div className="bg-yellow-100 p-2 rounded">
                                        <span className="font-semibold">Suggested Fix:</span>{" "}
                                        {result.suggested_fix}
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}