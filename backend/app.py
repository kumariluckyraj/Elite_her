from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from docling.document_converter import DocumentConverter
from typing import List
import tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

converter = DocumentConverter()

@app.post("/parse")
async def parse_documents(
    files: List[UploadFile] = File(...)
):
    print("Number of files:", len(files))

    parsed_docs = []

    for file in files:
        print("Received:", file.filename)

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".pdf"
        ) as tmp:

            contents = await file.read()
            tmp.write(contents)
            pdf_path = tmp.name

        result = converter.convert(pdf_path)

        text = result.document.export_to_markdown()

        parsed_docs.append({
            "filename": file.filename,
            "content": text
        })

    return {
        "documents": parsed_docs
    }