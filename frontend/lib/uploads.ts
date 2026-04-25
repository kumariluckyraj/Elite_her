import { mkdirSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const UPLOAD_ROOT = join(process.cwd(), "uploads");
mkdirSync(UPLOAD_ROOT, { recursive: true });

export type SavedFile = {
  storedPath: string;
  originalName: string;
  size: number;
  mime: string;
};

export async function saveUpload(
  file: File,
  scope: string,
): Promise<SavedFile> {
  const dir = join(UPLOAD_ROOT, scope);
  mkdirSync(dir, { recursive: true });

  const ext = extractExtension(file.name);
  const id = randomBytes(12).toString("hex");
  const storedName = `${id}${ext}`;
  const fullPath = join(dir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  writeFileSync(fullPath, buffer);

  const relPath = join(scope, storedName).replaceAll("\\", "/");

  return {
    storedPath: relPath,
    originalName: file.name,
    size: file.size,
    mime: file.type || "application/octet-stream",
  };
}

export function deleteUpload(relPath: string): void {
  const full = join(UPLOAD_ROOT, relPath);
  if (existsSync(full)) unlinkSync(full);
}

function extractExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx <= 0) return "";
  return name.slice(idx).toLowerCase();
}
